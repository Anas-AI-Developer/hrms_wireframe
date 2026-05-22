import type { EmployeeOrgPlacement, OrgLevel } from './navttcHqOrganogram'
import { DEFAULT_ORG_HEAD_ID, getOrgNode } from './navttcHqOrganogram'
import type { NavttcOrgNode } from './navttcOrgTypes'
import { getRoleLevelById } from './navttcRoleLevels'

const LEVEL_ORDER: OrgLevel[] = ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2']

/** Deepest organogram level the selected NAVTTC role posts at (Organogram 2026). */
const ROLE_TARGET_LEVEL: Record<string, OrgLevel> = {
  'role-1': 'head',
  'role-2': 'head',
  'role-3': 'wing',
  'role-4': 'section',
  'role-5': 'sub_section_1',
  'role-6': 'sub_section_2',
  'role-7': 'section',
  'role-8': 'section',
}

export function organogramTargetLevel(roleLevelId: string | undefined): OrgLevel | null {
  if (!roleLevelId) return null
  return ROLE_TARGET_LEVEL[roleLevelId] ?? null
}

/** How the employee form walks the organogram (fewer picks for DD / AD). */
export type OrgPlacementEntryMode =
  | 'cascade'
  /** Pick Director (section) → auto Wing & Head → pick DD under that section. */
  | 'section_then_dd'
  /** Pick the role’s anchor post (AD, DD, Director, DG) → auto-fill all parents. */
  | 'anchor_post'

export function orgPlacementEntryMode(roleLevelId: string | undefined): OrgPlacementEntryMode {
  switch (roleLevelId) {
    case 'role-5':
      return 'section_then_dd'
    case 'role-3':
      return 'anchor_post'
    default:
      return 'cascade'
  }
}

/** Filter dropdown at each tier (Director for section, DD for ss1, AD for ss2 — not the job role on every step). */
export function organogramFilterRoleForLevel(
  level: OrgLevel,
  employeeRoleLevelId?: string,
): string | undefined {
  if (!employeeRoleLevelId) return undefined
  if (organogramTargetLevel(employeeRoleLevelId) === level) {
    return employeeRoleLevelId
  }
  const tierRole: Record<OrgLevel, string> = {
    head: 'role-2',
    wing: 'role-3',
    section: 'role-4',
    sub_section_1: 'role-5',
    sub_section_2: 'role-6',
  }
  return tierRole[level]
}

/** HQ organogram roles (Chairman through Employee) use Head Office and organogram fields. */
export function roleRequiresHeadOffice(roleLevelId: string | undefined): boolean {
  if (!roleLevelId) return false
  return /^role-[1-8]$/.test(roleLevelId)
}

export type RoleOrgUiConfig = {
  forceHeadOffice: boolean
  visibleLevels: OrgLevel[]
  requiredLevels: OrgLevel[]
  /** Short hint shown above organogram fields on the employee form. */
  formHint: string
}

const ROLE_ORG_CONFIG: Record<string, RoleOrgUiConfig> = {
  'role-1': {
    forceHeadOffice: true,
    visibleLevels: ['head'],
    requiredLevels: ['head'],
    formHint: 'Chairman — Head Office only (Executive Director node).',
  },
  'role-2': {
    forceHeadOffice: true,
    visibleLevels: ['head'],
    requiredLevels: ['head'],
    formHint: 'Executive Director — confirm Head, then choose designation.',
  },
  'role-3': {
    forceHeadOffice: true,
    visibleLevels: ['head', 'wing'],
    requiredLevels: ['head', 'wing'],
    formHint: 'Select the HQ wing this post reports under.',
  },
  'role-4': {
    forceHeadOffice: true,
    visibleLevels: ['wing'],
    requiredLevels: ['head', 'wing'],
    formHint: 'Director — select wing (upper level), then choose Director designation.',
  },
  'role-5': {
    forceHeadOffice: true,
    visibleLevels: ['head', 'wing', 'section', 'sub_section_1'],
    requiredLevels: ['head', 'wing', 'section', 'sub_section_1'],
    formHint: 'Deputy Director — Wing → Section → Section 1 (DD).',
  },
  'role-6': {
    forceHeadOffice: true,
    visibleLevels: ['wing', 'section', 'sub_section_1'],
    requiredLevels: ['head', 'wing', 'section', 'sub_section_1'],
    formHint:
      'Assistant Director — Wing → Section → Section 1 (DD), then choose Assistant Director designation.',
  },
  'role-7': {
    forceHeadOffice: true,
    visibleLevels: LEVEL_ORDER,
    requiredLevels: ['head', 'wing', 'section'],
    formHint: 'Assistant — Wing and Section required; DD/AD units optional if listed.',
  },
  'role-8': {
    forceHeadOffice: true,
    visibleLevels: ['head', 'wing', 'section', 'sub_section_1'],
    requiredLevels: ['head', 'wing', 'section'],
    formHint: 'Employee — place under Wing and Section; DD unit optional.',
  },
}

export function roleOrgUiConfig(roleLevelId: string | undefined): RoleOrgUiConfig | null {
  if (!roleLevelId || !roleRequiresHeadOffice(roleLevelId)) return null
  return ROLE_ORG_CONFIG[roleLevelId] ?? ROLE_ORG_CONFIG['role-7']!
}

/** Clear organogram picks when role changes (avoids locking e.g. DG wing on Director role). */
export function orgPlacementForRoleChange(
  _roleLevelId: string,
  current: EmployeeOrgPlacement,
): EmployeeOrgPlacement {
  return {
    orgHeadId: current.orgHeadId || DEFAULT_ORG_HEAD_ID,
    orgWingId: '',
    orgSectionId: '',
  }
}

/** Only nodes that match the role tier (DG / Director / DD / AD) appear in dropdowns. */
export function organogramNodeMatchesRole(node: NavttcOrgNode, roleLevelId: string | undefined): boolean {
  if (!roleLevelId) return true
  const name = node.name.toLowerCase()
  switch (roleLevelId) {
    case 'role-1':
    case 'role-2':
      return node.level === 'head'
    case 'role-3':
      return node.level === 'wing' && /director general|dg\b/.test(name)
    case 'role-4':
      return (
        node.level === 'section' &&
        /director/.test(name) &&
        !/deputy|assistant/.test(name)
      )
    case 'role-5':
      return node.level === 'sub_section_1' && /deputy director|\bdd\b/.test(name)
    case 'role-6':
      return node.level === 'sub_section_2' && /assistant director|\bad\b/.test(name)
    case 'role-7':
    case 'role-8':
      return true
    default:
      return true
  }
}

export function filterOrganogramNodesForRole(
  nodes: NavttcOrgNode[],
  roleLevelId: string | undefined,
): NavttcOrgNode[] {
  return nodes.filter((n) => organogramNodeMatchesRole(n, roleLevelId))
}

/** Organogram picks required on the employee form (may be higher than the post tier). */
export function organogramFormAnchorLevel(roleLevelId: string | undefined): OrgLevel | null {
  switch (roleLevelId) {
    case 'role-4':
      return 'wing'
    case 'role-6':
      return 'sub_section_1'
    default:
      return organogramTargetLevel(roleLevelId)
  }
}

export function organogramAnchorNodeId(
  placement: EmployeeOrgPlacement,
  roleLevelId: string | undefined,
): string | undefined {
  const target = organogramFormAnchorLevel(roleLevelId)
  if (!target) return undefined
  switch (target) {
    case 'head':
      return placement.orgHeadId || DEFAULT_ORG_HEAD_ID
    case 'wing':
      return placement.orgWingId || undefined
    case 'section':
      return placement.orgSectionId || undefined
    case 'sub_section_1':
      return placement.orgSubSection1Id || undefined
    case 'sub_section_2':
      return placement.orgSubSection2Id || undefined
    default:
      return undefined
  }
}

export function isOrganogramPlacementComplete(
  placement: EmployeeOrgPlacement,
  roleLevelId: string | undefined,
): boolean {
  return validateOrgPlacementForRole(placement, roleLevelId) === null
}

/** User-facing hint when designation is locked until organogram steps finish. */
export function organogramPlacementHint(
  placement: EmployeeOrgPlacement,
  roleLevelId: string | undefined,
): string | null {
  return validateOrgPlacementForRole(placement, roleLevelId)
}

/** Keywords from organogram node e.g. "Assistant Director (Finance)" → finance */
export function organogramNodeSpecialty(node: NavttcOrgNode | undefined): string | null {
  if (!node) return null
  const paren = node.name.match(/\(([^)]+)\)/)
  if (paren?.[1]) return paren[1].trim().toLowerCase()
  return null
}

export function validateOrgPlacementForRole(
  placement: EmployeeOrgPlacement,
  roleLevelId: string | undefined,
): string | null {
  const cfg = roleOrgUiConfig(roleLevelId)
  if (!cfg) return null

  if (!placement.orgHeadId) return 'Select the organizational head (Executive Director).'

  for (const level of cfg.requiredLevels) {
    if (level === 'wing' && !placement.orgWingId) {
      return 'Select a wing.'
    }
    if (level === 'section' && !placement.orgSectionId) {
      return roleLevelId === 'role-6'
        ? 'Select a Director (section) under that wing.'
        : 'Select the section under that wing.'
    }
    if (level === 'sub_section_1' && !placement.orgSubSection1Id) {
      return roleLevelId === 'role-6'
        ? 'Select Section 1 (DD) under the section.'
        : 'Select Section 1 (Deputy Director unit) under the section.'
    }
    if (level === 'sub_section_2' && !placement.orgSubSection2Id) {
      return 'Select Section 2 (Assistant Director unit) under Section 1.'
    }
  }

  if (placement.orgWingId) {
    if (!getOrgNode(placement.orgWingId)) return 'Invalid wing selection.'
    const wing = getOrgNode(placement.orgWingId)
    if (wing && !organogramNodeMatchesRole(wing, 'role-3')) {
      return 'Select a Director General (Wing) from the organogram.'
    }
  }
  if (placement.orgSectionId) {
    if (!getOrgNode(placement.orgSectionId)) return 'Invalid section selection.'
    const parentWing = getOrgNode(placement.orgSectionId)?.parentId
    if (parentWing !== placement.orgWingId) {
      return 'Section must belong to the selected wing.'
    }
    const section = getOrgNode(placement.orgSectionId)
    if (section && !organogramNodeMatchesRole(section, 'role-4')) {
      return 'Select a Director (section) under this wing.'
    }
  }
  if (placement.orgSubSection1Id) {
    const ss1 = getOrgNode(placement.orgSubSection1Id)
    if (!ss1 || ss1.parentId !== placement.orgSectionId) {
      return 'Section 1 (DD) must belong to the selected section.'
    }
    const ddTierRole = roleLevelId === 'role-6' ? 'role-5' : roleLevelId
    if (ddTierRole && !organogramNodeMatchesRole(ss1, ddTierRole)) {
      return 'Select Section 1 (DD) under this wing and section.'
    }
  }
  if (placement.orgSubSection2Id) {
    const ss2 = getOrgNode(placement.orgSubSection2Id)
    if (!ss2 || ss2.parentId !== placement.orgSubSection1Id) {
      return 'Assistant Director (AD) must belong to the selected Deputy Director (DD).'
    }
    if (!organogramNodeMatchesRole(ss2, roleLevelId)) {
      return 'Select an Assistant Director (AD) unit from the organogram tree.'
    }
  }

  const anchorId = organogramAnchorNodeId(placement, roleLevelId)
  if (anchorId) {
    const anchor = getOrgNode(anchorId)
    const filterRole = anchor
      ? organogramFilterRoleForLevel(anchor.level, roleLevelId)
      : undefined
    if (anchor && filterRole && !organogramNodeMatchesRole(anchor, filterRole)) {
      const role = getRoleLevelById(roleLevelId)
      return `Selected organogram unit must match ${role?.title ?? 'the role'} level.`
    }
  }

  return null
}
