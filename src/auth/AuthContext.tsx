import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Employee } from '../types/hrms'
import { canViewEmployee, filterEmployeesForUser, resolveActorEmployeeId } from './employeeScope'
import { findMockUser } from './mockUsers'
import { DEMO_PASSWORD } from './clientRoles'
import {
  applyProfileOverrides,
  getEffectivePassword,
  patchProfileOverride,
} from './profileStorage'
import { roleHasPermission } from './rolePermissions'
import type { AuthUser, Permission } from './types'
import { STORAGE_KEY } from './types'

export type UpdateProfileInput = {
  displayName: string
  email: string
  phone: string
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (username: string, password: string) => { ok: true } | { ok: false; message: string }
  logout: () => void
  updateProfile: (input: UpdateProfileInput) => { ok: true } | { ok: false; message: string }
  changePassword: (input: ChangePasswordInput) => { ok: true } | { ok: false; message: string }
  can: (permission: Permission) => boolean
  visibleEmployees: () => Employee[]
  canViewEmployee: (employee: Employee) => boolean
  actorEmployeeId: string | undefined
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    if (!parsed?.username || !parsed?.role) return null
    return parsed
  } catch {
    return null
  }
}

function enrichUser(base: AuthUser): AuthUser {
  const withEmployee = (() => {
    const employeeId = resolveActorEmployeeId(base)
    return employeeId ? { ...base, employeeId } : base
  })()
  return applyProfileOverrides(withEmployee)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = typeof window !== 'undefined' ? readStoredUser() : null
    return stored ? enrichUser(stored) : null
  })

  const commitUser = useCallback((next: AuthUser) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  const login = useCallback((username: string, password: string) => {
    const row = findMockUser(username, password)
    if (!row) {
      return { ok: false as const, message: 'Invalid username or password.' }
    }
    const next = enrichUser({
      username: row.username,
      displayName: row.displayName,
      role: row.role,
      ...(row.designation ? { designation: row.designation } : {}),
    })
    commitUser(next)
    return { ok: true as const }
  }, [commitUser])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  const updateProfile = useCallback(
    (input: UpdateProfileInput) => {
      if (!user) return { ok: false as const, message: 'Not signed in.' }
      const displayName = input.displayName.trim()
      const email = input.email.trim()
      const phone = input.phone.trim()
      if (!displayName) {
        return { ok: false as const, message: 'Display name is required.' }
      }
      if (!email) {
        return { ok: false as const, message: 'Email is required.' }
      }
      patchProfileOverride(user.username, { displayName, email, phone })
      const next = enrichUser({ ...user, displayName, email, phone })
      commitUser(next)
      return { ok: true as const }
    },
    [user, commitUser],
  )

  const changePassword = useCallback(
    (input: ChangePasswordInput) => {
      if (!user) return { ok: false as const, message: 'Not signed in.' }
      const { currentPassword, newPassword, confirmPassword } = input
      if (!currentPassword || !newPassword) {
        return { ok: false as const, message: 'Enter your current and new password.' }
      }
      if (newPassword.length < 8) {
        return { ok: false as const, message: 'New password must be at least 8 characters.' }
      }
      if (newPassword !== confirmPassword) {
        return { ok: false as const, message: 'New password and confirmation do not match.' }
      }
      const effective = getEffectivePassword(user.username, DEMO_PASSWORD)
      if (currentPassword !== effective) {
        return { ok: false as const, message: 'Current password is incorrect.' }
      }
      patchProfileOverride(user.username, { password: newPassword })
      return { ok: true as const }
    },
    [user],
  )

  const can = useCallback(
    (permission: Permission) => {
      if (!user) return false
      return roleHasPermission(user.role, permission)
    },
    [user],
  )

  const permissionBag = useMemo(
    () => ({
      has: (p: Permission) => (user ? roleHasPermission(user.role, p) : false),
    }),
    [user],
  )

  const visibleEmployees = useCallback(() => {
    if (!user) return []
    return filterEmployeesForUser(user, permissionBag)
  }, [user, permissionBag])

  const canViewEmployeeFn = useCallback(
    (employee: Employee) => {
      if (!user) return false
      return canViewEmployee(user, employee, permissionBag)
    },
    [user, permissionBag],
  )

  const actorEmployeeId = user ? resolveActorEmployeeId(user) : undefined

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      updateProfile,
      changePassword,
      can,
      visibleEmployees,
      canViewEmployee: canViewEmployeeFn,
      actorEmployeeId,
    }),
    [
      user,
      login,
      logout,
      updateProfile,
      changePassword,
      can,
      visibleEmployees,
      canViewEmployeeFn,
      actorEmployeeId,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

