import { DEMO_PASSWORD, EMPLOYEE_DESIGNATIONS, LEADERSHIP_ACCOUNTS } from './clientRoles'
import { getEffectivePassword } from './profileStorage'
import { ROLE_LABELS } from './roleLabels'
import type { RoleId } from './types'

/** Demo accounts for the wireframe — aligned with client organogram roles. */
export type MockUserRecord = {
  username: string
  password: string
  displayName: string
  role: RoleId
  /** Post / designation title (required for employee logins). */
  designation?: string
  description: string
}

const leadershipUsers: MockUserRecord[] = LEADERSHIP_ACCOUNTS.map((a) => ({
  username: a.username,
  password: DEMO_PASSWORD,
  displayName: a.displayName,
  role: a.role,
  description: a.description,
}))

const employeeUsers: MockUserRecord[] = EMPLOYEE_DESIGNATIONS.map((d) => ({
  username: `emp.${d.slug}`,
  password: DEMO_PASSWORD,
  displayName: `Demo — ${d.title}`,
  role: 'employee' as const,
  designation: d.title,
  description: 'Employee self-service portal (ESS) — wireframe dashboard only for now.',
}))

export const MOCK_USERS: MockUserRecord[] = [...leadershipUsers, ...employeeUsers]

export function roleLabelForUser(u: MockUserRecord): string {
  if (u.role === 'employee') return ROLE_LABELS.employee
  return ROLE_LABELS[u.role]
}

export function findMockUser(username: string, password: string) {
  const normalized = username.trim().toLowerCase()
  const row = MOCK_USERS.find((x) => x.username.toLowerCase() === normalized)
  if (!row) return undefined
  const effective = getEffectivePassword(normalized, row.password)
  if (password !== effective) return undefined
  return row
}
