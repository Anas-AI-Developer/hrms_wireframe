import type { Department } from '../types/hrms'
import { resolveDepartmentOfficeId } from './navttcOffices'

/**
 * NAVTTC designation hierarchy (roles 1–7) — Master Data, ordered by BPS level.
 * Source: NAVTTC — Designations Ordered by Level (BPS), April 2026.
 */
export type NavttcRoleLevel = {
  id: string
  /** Role number (1 = highest). */
  order: number
  title: string
  bps: number
  levelCategory: string
}

export const NAVTTC_ROLE_LEVELS: NavttcRoleLevel[] = [
  { id: 'role-1', order: 1, title: 'Chairman', bps: 22, levelCategory: 'Executive' },
  { id: 'role-2', order: 2, title: 'Executive Director', bps: 22, levelCategory: 'Executive' },
  { id: 'role-3', order: 3, title: 'Director General', bps: 20, levelCategory: 'Executive' },
  { id: 'role-4', order: 4, title: 'Director', bps: 19, levelCategory: 'Upper Management' },
  { id: 'role-5', order: 5, title: 'Deputy Director', bps: 18, levelCategory: 'Upper Management' },
  { id: 'role-6', order: 6, title: 'Assistant Director', bps: 17, levelCategory: 'Middle Management' },
  { id: 'role-7', order: 7, title: 'Assistant', bps: 15, levelCategory: 'Supervisory' },
]

export function getRoleLevelById(id: string | undefined): NavttcRoleLevel | undefined {
  if (!id) return undefined
  return NAVTTC_ROLE_LEVELS.find((r) => r.id === id)
}

export function formatRoleLevelLabel(role: NavttcRoleLevel): string {
  return `Role ${role.order} · ${role.title} (BPS ${role.bps})`
}

export function inferRoleLevelId(emp: {
  roleLevelId?: string
  designationId?: string
  sanctionedPost?: string
  actualPost?: string
  workingAs?: string
}, designationTitle?: string): string | undefined {
  if (emp.roleLevelId) return emp.roleLevelId
  const titles = [
    emp.sanctionedPost,
    emp.actualPost,
    emp.workingAs,
    designationTitle,
  ]
    .filter(Boolean)
    .map((t) => t!.toLowerCase().trim())

  for (const role of NAVTTC_ROLE_LEVELS) {
    const key = role.title.toLowerCase()
    if (titles.some((t) => t === key || t.startsWith(`${key} `))) {
      return role.id
    }
  }
  return undefined
}

/** Parse BPS number from grade strings like "BPS 17" or "17". */
export function parseBpsFromGrade(grade: string): number | null {
  const normalized = grade.trim()
  const bpsMatch = normalized.match(/bps\s*(\d+)/i)
  if (bpsMatch) return Number.parseInt(bpsMatch[1]!, 10)
  if (/^\d+$/.test(normalized)) return Number.parseInt(normalized, 10)
  return null
}

type DesignationRow = {
  id: string
  title: string
  grade: string
  departmentId: string
  status: string
}

export type DesignationMatchScope = {
  departmentId?: string
  officeId?: string
  departments?: Department[]
}

function filterActiveAtRoleBps(
  role: NavttcRoleLevel,
  rows: DesignationRow[],
): DesignationRow[] {
  return rows.filter(
    (d) => d.status === 'active' && parseBpsFromGrade(d.grade) === role.bps,
  )
}

/**
 * Sanctioned posts must match the role BPS exactly (never lower scales).
 * Prefer posts in the selected unit, then the same office, then all HQ catalog entries.
 */
export function designationsMatchingRoleLevel(
  roleId: string,
  designations: DesignationRow[],
  scope?: string | DesignationMatchScope,
): DesignationRow[] {
  const role = getRoleLevelById(roleId)
  if (!role) return []

  const opts: DesignationMatchScope =
    typeof scope === 'string' ? { departmentId: scope } : (scope ?? {})

  if (opts.departmentId) {
    const inUnit = filterActiveAtRoleBps(
      role,
      designations.filter((d) => d.departmentId === opts.departmentId),
    )
    if (inUnit.length > 0) return sortDesignationOptions(inUnit, role, opts.departmentId)
  }

  if (opts.officeId && opts.departments?.length) {
    const deptIds = new Set(
      opts.departments
        .filter(
          (d) => d.status === 'active' && resolveDepartmentOfficeId(d) === opts.officeId,
        )
        .map((d) => d.id),
    )
    const inOffice = filterActiveAtRoleBps(
      role,
      designations.filter((d) => deptIds.has(d.departmentId)),
    )
    if (inOffice.length > 0) return sortDesignationOptions(inOffice, role, opts.departmentId)
  }

  return sortDesignationOptions(filterActiveAtRoleBps(role, designations), role, opts.departmentId)
}

function sortDesignationOptions(
  rows: DesignationRow[],
  role: NavttcRoleLevel,
  preferredDepartmentId?: string,
): DesignationRow[] {
  return [...rows].sort((a, b) => {
    const aTitle = a.title.toLowerCase() === role.title.toLowerCase() ? 0 : 1
    const bTitle = b.title.toLowerCase() === role.title.toLowerCase() ? 0 : 1
    if (aTitle !== bTitle) return aTitle - bTitle
    const aDept = a.departmentId === preferredDepartmentId ? 0 : 1
    const bDept = b.departmentId === preferredDepartmentId ? 0 : 1
    if (aDept !== bDept) return aDept - bDept
    return a.title.localeCompare(b.title)
  })
}

export function designationMatchesRoleLevel(
  designation: { grade: string } | undefined,
  roleId: string | undefined,
): boolean {
  if (!designation || !roleId) return true
  const role = getRoleLevelById(roleId)
  if (!role) return true
  return parseBpsFromGrade(designation.grade) === role.bps
}
