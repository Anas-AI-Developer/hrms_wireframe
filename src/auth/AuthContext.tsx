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
import { permissionsForRole, roleHasPermission } from './rolePermissions'
import type { AuthUser, Permission, RoleId } from './types'
import { STORAGE_KEY } from './types'

const ROLE_IDS: RoleId[] = [
  'executive_director',
  'director_general',
  'director',
  'deputy_director',
  'assistant_director',
  'assistant_accounts_officer_accounts',
  'assistant_accounts_officer_finance',
  'employee',
]

function isRoleId(value: unknown): value is RoleId {
  return typeof value === 'string' && ROLE_IDS.includes(value as RoleId)
}

type AuthContextValue = {
  user: AuthUser | null
  login: (username: string, password: string) => { ok: true } | { ok: false; message: string }
  logout: () => void
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
    if (!parsed?.username || !isRoleId(parsed.role)) return null
    if (permissionsForRole(parsed.role).size === 0) return null
    return parsed
  } catch {
    return null
  }
}

function enrichUser(base: AuthUser): AuthUser {
  const employeeId = resolveActorEmployeeId(base)
  return employeeId ? { ...base, employeeId } : base
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = typeof window !== 'undefined' ? readStoredUser() : null
    return stored ? enrichUser(stored) : null
  })

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
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setUser(next)
    return { ok: true as const }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

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
      can,
      visibleEmployees,
      canViewEmployee: canViewEmployeeFn,
      actorEmployeeId,
    }),
    [user, login, logout, can, visibleEmployees, canViewEmployeeFn, actorEmployeeId],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

