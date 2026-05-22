import { ALL_LOGIN_DEMO_POSTS, LOGIN_DEMO_LEADERSHIP_POSTS } from '../auth/clientRoles'
import type { Department } from '../types/hrms'
import type { EmployeeOrgPlacement } from './navttcOrgMapping'
import type { NavttcOrgNode } from './navttcOrgTypes'
import { getOrgChildren, getOrgNode } from './navttcHqOrganogram'
import {
  organogramAnchorNodeId,
  organogramNodeSpecialty,
} from './roleOrgPlacement'
import { resolveDepartmentOfficeId } from './navttcOffices'

/**
 * NAVTTC designation hierarchy (Chairman → Employee) — Master Data, ordered by BPS level.
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

/** Chairman through Assistant — Head Office organogram (ED → DG → D → DD → AD). */
export const HQ_HIERARCHY_ROLE_IDS = [
  'role-1',
  'role-2',
  'role-3',
  'role-4',
  'role-5',
  'role-6',
  'role-7',
] as const

export const REGIONAL_STAFF_ROLE_ID = 'role-8'

export function isHqHierarchyRole(roleId: string | undefined): boolean {
  if (!roleId) return false
  return (HQ_HIERARCHY_ROLE_IDS as readonly string[]).includes(roleId)
}

export const NAVTTC_ROLE_LEVELS: NavttcRoleLevel[] = [
  { id: 'role-1', order: 1, title: 'Chairman', bps: 22, levelCategory: 'Executive' },
  { id: 'role-2', order: 2, title: 'Executive Director', bps: 22, levelCategory: 'Executive' },
  { id: 'role-3', order: 3, title: 'Director General', bps: 20, levelCategory: 'Executive' },
  { id: 'role-4', order: 4, title: 'Director', bps: 19, levelCategory: 'Upper Management' },
  { id: 'role-5', order: 5, title: 'Deputy Director', bps: 18, levelCategory: 'Upper Management' },
  { id: 'role-6', order: 6, title: 'Assistant Director', bps: 17, levelCategory: 'Middle Management' },
  { id: 'role-7', order: 7, title: 'Assistant', bps: 15, levelCategory: 'Supervisory' },
  {
    id: 'role-8',
    order: 8,
    title: 'Employee',
    bps: 15,
    levelCategory: 'Employee',
  },
]

export function getRoleLevelById(id: string | undefined): NavttcRoleLevel | undefined {
  if (!id) return undefined
  return NAVTTC_ROLE_LEVELS.find((r) => r.id === id)
}

export function formatRoleLevelLabel(role: NavttcRoleLevel): string {
  if (role.id === 'role-8') return role.title
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
  /** Full HQ organogram path — designations follow the selected tree branch. */
  orgPlacement?: EmployeeOrgPlacement
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
 * Strict title match so "Director" does not match "Director General" or "Assistant Director".
 * (Mirrors organogram tier rules in roleOrgPlacement.)
 */
export function designationTitleMatchesRoleLevel(title: string, roleId: string): boolean {
  const t = title.toLowerCase().trim()
  switch (roleId) {
    case 'role-1':
      return /chairman/.test(t)
    case 'role-2':
      return /executive director/.test(t) && !/general|deputy|assistant/.test(t)
    case 'role-3':
      return (
        (/director general|\bdg\b/.test(t) || t.startsWith('dg ')) &&
        !/deputy|assistant|executive/.test(t)
      )
    case 'role-4':
      return (
        (/^director\b|\bdirector\s*\(/.test(t) || t === 'director') &&
        !/general|deputy|assistant|executive/.test(t)
      )
    case 'role-5':
      return /deputy director/.test(t) || (/\bdd\b/.test(t) && !/assistant/.test(t))
    case 'role-6':
      return /assistant director/.test(t) || /\bad\b/.test(t)
    case 'role-7':
      return (
        (t === 'assistant' || /^assistant\b/.test(t)) &&
        !/director|general|deputy|executive/.test(t)
      )
    case 'role-8':
      return true
    default:
      return false
  }
}

/** PDF organogram posts under the wing/section the user selected on the form. */
function hqOrganogramPostsForPlacement(
  roleId: string,
  placement: EmployeeOrgPlacement,
): NavttcOrgNode[] {
  if (roleId === 'role-4' && placement.orgWingId) {
    return getOrgChildren(placement.orgWingId, 'section').filter((n) =>
      designationTitleMatchesRoleLevel(n.name, 'role-4'),
    )
  }
  if (roleId === 'role-6' && placement.orgSectionId) {
    const posts: NavttcOrgNode[] = []
    for (const dd of getOrgChildren(placement.orgSectionId, 'sub_section_1')) {
      for (const ad of getOrgChildren(dd.id, 'sub_section_2')) {
        if (designationTitleMatchesRoleLevel(ad.name, 'role-6')) posts.push(ad)
      }
    }
    return posts
  }
  return []
}

function applyOrganogramSpecialty(
  rows: DesignationRow[],
  specialty: string | null,
): DesignationRow[] {
  if (!specialty) return rows
  const matched = rows.filter((d) => {
    const t = d.title.toLowerCase()
    return (
      t.includes(specialty) ||
      specialty.split(/\s+/).some((w) => w.length > 2 && t.includes(w))
    )
  })
  return matched.length > 0 ? matched : rows
}

function buildHqDesignationsFromOrganogram(
  role: NavttcRoleLevel,
  roleId: string,
  designations: DesignationRow[],
  opts: DesignationMatchScope,
): DesignationRow[] {
  const placement = opts.orgPlacement!
  const anchorId = organogramAnchorNodeId(placement, roleId)
  const anchorNode = anchorId ? getOrgNode(anchorId) : undefined
  const sectionNode = placement.orgSectionId
    ? getOrgNode(placement.orgSectionId)
    : undefined
  const specialty =
    organogramNodeSpecialty(sectionNode ?? undefined) ??
    organogramNodeSpecialty(anchorNode ?? undefined)

  const bpsPool = filterActiveAtRoleBps(role, designations)
  let strictCatalog = bpsPool.filter((d) =>
    designationTitleMatchesRoleLevel(d.title, roleId),
  )

  const rows: DesignationRow[] = []
  const wingDept =
    getOrgNode(placement.orgWingId ?? '')?.legacyDepartmentId ?? opts.departmentId ?? 'c1'

  const pushOrgPost = (node: NavttcOrgNode) => {
    if (rows.some((r) => r.id === `org-post-${node.id}`)) return
    rows.push({
      id: `org-post-${node.id}`,
      title: node.name,
      grade: `BPS ${role.bps}`,
      departmentId: opts.departmentId ?? wingDept,
      status: 'active',
    })
  }

  for (const node of hqOrganogramPostsForPlacement(roleId, placement)) {
    pushOrgPost(node)
  }

  if (
    anchorNode &&
    designationTitleMatchesRoleLevel(anchorNode.name, roleId)
  ) {
    pushOrgPost(anchorNode)
  }

  for (const d of strictCatalog) {
    if (!rows.some((r) => r.title.toLowerCase() === d.title.toLowerCase())) {
      rows.push(d)
    }
  }

  let result = applyOrganogramSpecialty(rows, specialty)

  if (result.length === 0 && strictCatalog.length > 0) {
    result = strictCatalog
  }

  if (result.length === 0 && bpsPool.length > 0) {
    result = bpsPool.filter((d) => designationTitleMatchesRoleLevel(d.title, roleId))
  }

  return result.length > 0 ? result : rows
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

  let pool: DesignationRow[]

  if (opts.orgPlacement && isHqHierarchyRole(roleId)) {
    pool = buildHqDesignationsFromOrganogram(role, roleId, designations, opts)
  } else {
    pool = filterActiveAtRoleBps(role, designations)
    if (isHqHierarchyRole(roleId)) {
      pool = pool.filter(
        (d) =>
          d.id.startsWith('org-post-') || designationTitleMatchesRoleLevel(d.title, roleId),
      )
    }
  }

  if (opts.departmentId) {
    const inUnit = pool.filter(
      (d) =>
        d.id.startsWith('org-post-') ||
        !d.departmentId ||
        d.departmentId === opts.departmentId,
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
    const inOffice = pool.filter((d) => deptIds.has(d.departmentId))
    if (inOffice.length > 0) return sortDesignationOptions(inOffice, role, opts.departmentId)
  }

  return sortDesignationOptions(pool, role, opts.departmentId)
}

function sortDesignationOptions(
  rows: DesignationRow[],
  role: NavttcRoleLevel,
  preferredDepartmentId?: string,
): DesignationRow[] {
  return [...rows].sort((a, b) => {
    const aExact = designationTitleMatchesRoleLevel(a.title, role.id) ? 0 : 1
    const bExact = designationTitleMatchesRoleLevel(b.title, role.id) ? 0 : 1
    if (aExact !== bExact) return aExact - bExact
    const aOrg = a.id.startsWith('org-post-') ? 0 : 1
    const bOrg = b.id.startsWith('org-post-') ? 0 : 1
    if (aOrg !== bOrg) return aOrg - bOrg
    const aDept = a.departmentId === preferredDepartmentId ? 0 : 1
    const bDept = b.departmentId === preferredDepartmentId ? 0 : 1
    if (aDept !== bDept) return aDept - bDept
    return a.title.localeCompare(b.title)
  })
}

function catalogTitleMatchesLoginTitle(catalogTitle: string, loginTitle: string): boolean {
  const c = catalogTitle.toLowerCase().trim()
  const l = loginTitle.toLowerCase().trim()
  if (c === l) return true
  const loginBase = l.split('/')[0]!.trim()
  if (c === loginBase || loginBase.startsWith(c) || c.startsWith(loginBase)) return true
  if (c.replace(/s$/, '') === l.replace(/s$/, '')) return true
  return false
}

/**
 * Posts shown on the login page (ESS demo accounts) — used for regional office hires.
 */
export function loginDesignationTitleForId(designationId: string): string | undefined {
  if (!designationId.startsWith('login-post-')) return undefined
  const slug = designationId.slice('login-post-'.length)
  return ALL_LOGIN_DEMO_POSTS.find((d) => d.slug === slug)?.title
}

const LEADERSHIP_TITLE_TO_ROLE_LEVEL: Record<string, string> = {
  'Executive Director': 'role-2',
  'Director General': 'role-3',
  Director: 'role-4',
  'Deputy Director': 'role-5',
  'Assistant Director': 'role-6',
  'Assistant Accounts Officer (Accounts)': 'role-7',
  'Assistant Accounts Officer (Finance)': 'role-7',
}

/** Map login demo post title → NAVTTC role level (employee form). */
export function roleLevelIdFromLoginDemoTitle(title: string): string | undefined {
  const leadership = LOGIN_DEMO_LEADERSHIP_POSTS.find((p) =>
    catalogTitleMatchesLoginTitle(title, p.title),
  )
  if (leadership) {
    return LEADERSHIP_TITLE_TO_ROLE_LEVEL[leadership.title] ?? 'role-7'
  }
  if (ALL_LOGIN_DEMO_POSTS.some((p) => catalogTitleMatchesLoginTitle(title, p.title))) {
    return REGIONAL_STAFF_ROLE_ID
  }
  return undefined
}

/**
 * Full login credentials table (Executive Director → Sanitary Workers).
 * Regional office uses the complete list — not filtered by centre or office.
 */
export function loginDemoDesignations(
  designations: DesignationRow[],
  _scope?: DesignationMatchScope,
): DesignationRow[] {
  const active = designations.filter((d) => d.status === 'active')
  const rows: DesignationRow[] = []

  for (const login of ALL_LOGIN_DEMO_POSTS) {
    const catalog = active.find((d) => catalogTitleMatchesLoginTitle(d.title, login.title))
    if (catalog) {
      rows.push(catalog)
    } else {
      rows.push({
        id: `login-post-${login.slug}`,
        title: login.title,
        grade: '—',
        departmentId: '',
        status: 'active',
      })
    }
  }

  return rows
}

/** Regional office: full login table + any other active catalog posts (no centre mapping). */
export function regionalOfficeDesignations(designations: DesignationRow[]): DesignationRow[] {
  const loginRows = loginDemoDesignations(designations)
  const seenTitles = new Set(loginRows.map((r) => r.title.toLowerCase().trim()))
  const extra = designations
    .filter((d) => d.status === 'active' && !seenTitles.has(d.title.toLowerCase().trim()))
    .sort((a, b) => a.title.localeCompare(b.title))
  return [...loginRows, ...extra]
}

/** @deprecated Use loginDemoDesignations */
export const regionalLoginDesignations = loginDemoDesignations

export function designationMatchesRoleLevel(
  designation: { id?: string; grade: string; title?: string } | undefined,
  roleId: string | undefined,
  options?: { regionalStaff?: boolean },
): boolean {
  if (!designation || !roleId) return true
  if (designation.id?.startsWith('org-post-') || designation.id?.startsWith('login-post-')) {
    return true
  }
  if (options?.regionalStaff) {
    return true
  }
  const role = getRoleLevelById(roleId)
  if (!role) return true
  if (roleId && isHqHierarchyRole(roleId)) {
    return (
      parseBpsFromGrade(designation.grade) === role.bps &&
      designationTitleMatchesRoleLevel(designation.title ?? '', roleId)
    )
  }
  return parseBpsFromGrade(designation.grade) === role.bps
}
