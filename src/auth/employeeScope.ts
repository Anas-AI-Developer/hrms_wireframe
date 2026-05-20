import { getEmployees } from '../data/mock'
import type { Employee } from '../types/hrms'
import type { AuthUser, RoleId } from './types'

const DEMO_ACTOR_BY_USERNAME: Record<string, string> = {
  'executive.director': 'm-1',
  'director.general': 'm-2',
  director: 'm-3',
  'deputy.director': 'm-4',
  'assistant.director': 'm-5',
}

const EMP_SLUG_TO_TITLE: Record<string, string> = {
  'private-secretary': 'Private Secretary',
  aps: 'APS',
  librarian: 'Librarian',
  mto: 'Mechanical Transport Officer',
  cashier: 'Cashier',
  assistant: 'Assistant',
  stenotypist: 'Stenotypist',
  deo: 'Data Entry Operator',
  receptionist: 'Receptionist',
  'hardware-technician': 'Hardware Technician',
  'maintenance-worker': 'General Maintenance Worker',
  'dispatch-rider': 'Dispatch Rider',
  driver: 'Driver',
  dmo: 'DMO',
  electrician: 'Electrician',
  'naib-qasid': 'Naib Qasid',
  chowkidar: 'Chowkidar',
  'sanitary-worker': 'Sanitary Workers',
}

export function resolveActorEmployeeId(user: AuthUser): string | undefined {
  if (user.employeeId) return user.employeeId
  const demo = DEMO_ACTOR_BY_USERNAME[user.username]
  const roster = getEmployees()
  if (demo && roster.some((e) => e.id === demo)) return demo

  if (user.role === 'employee' && user.username.startsWith('emp.')) {
    const slug = user.username.slice(4)
    const title = EMP_SLUG_TO_TITLE[slug]
    if (title) {
      const match = roster.find(
        (e) =>
          e.status === 'active' &&
          (e.sanctionedPost?.toLowerCase().includes(title.toLowerCase()) ||
            e.workingAs?.toLowerCase().includes(title.toLowerCase())),
      )
      return match?.id
    }
  }
  return undefined
}

function leadershipRoles(role: RoleId): boolean {
  return (
    role === 'executive_director' ||
    role === 'director_general' ||
    role === 'director' ||
    role === 'deputy_director' ||
    role === 'assistant_director'
  )
}

export function canViewEmployee(
  user: AuthUser,
  target: Employee,
  permissions: { has: (p: import('./types').Permission) => boolean },
): boolean {
  if (permissions.has('employee.view_all')) return true
  if (permissions.has('employee.view_self')) {
    const actorId = resolveActorEmployeeId(user)
    return actorId != null && target.id === actorId
  }
  if (permissions.has('employee.view_team')) {
    const actorId = resolveActorEmployeeId(user)
    if (!actorId) return leadershipRoles(user.role)
    if (target.id === actorId) return true
    return target.managerId === actorId
  }
  return false
}

export function filterEmployeesForUser(
  user: AuthUser,
  permissions: { has: (p: import('./types').Permission) => boolean },
): Employee[] {
  return getEmployees().filter((e) => canViewEmployee(user, e, permissions))
}
