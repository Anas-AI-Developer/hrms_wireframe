import type { EmployeeOrgPlacement, OrgLevel } from './navttcHqOrganogram'
import { DEFAULT_ORG_HEAD_ID, getOrgNode } from './navttcHqOrganogram'

const LEVEL_ORDER: OrgLevel[] = ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2']

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
    visibleLevels: ['head', 'wing', 'section'],
    requiredLevels: ['head', 'wing', 'section'],
    formHint: 'Director — select wing, then the section under that wing.',
  },
  'role-5': {
    forceHeadOffice: true,
    visibleLevels: ['head', 'wing', 'section', 'sub_section_1'],
    requiredLevels: ['head', 'wing', 'section', 'sub_section_1'],
    formHint: 'Deputy Director — Wing → Section → Section 1 (DD).',
  },
  'role-6': {
    forceHeadOffice: true,
    visibleLevels: LEVEL_ORDER,
    requiredLevels: ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2'],
    formHint: 'Assistant Director — Wing → Section → Section 1 (DD) → Section 2 (AD).',
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

function maxLevelIndex(levels: OrgLevel[]): number {
  return Math.max(...levels.map((l) => LEVEL_ORDER.indexOf(l)), -1)
}

/** Reset organogram fields when role changes so depth matches the new role. */
export function orgPlacementForRoleChange(
  roleLevelId: string,
  current: EmployeeOrgPlacement,
): EmployeeOrgPlacement {
  const cfg = roleOrgUiConfig(roleLevelId)
  const next: EmployeeOrgPlacement = {
    orgHeadId: current.orgHeadId || DEFAULT_ORG_HEAD_ID,
    orgWingId: '',
    orgSectionId: '',
  }

  if (!cfg) return next

  const maxIdx = maxLevelIndex(cfg.visibleLevels)

  if (maxIdx >= LEVEL_ORDER.indexOf('wing') && current.orgWingId) {
    const wing = getOrgNode(current.orgWingId)
    if (wing?.level === 'wing') next.orgWingId = current.orgWingId
  }
  if (maxIdx >= LEVEL_ORDER.indexOf('section') && current.orgSectionId && next.orgWingId) {
    const section = getOrgNode(current.orgSectionId)
    if (section?.parentId === next.orgWingId) next.orgSectionId = current.orgSectionId
  }
  if (maxIdx >= LEVEL_ORDER.indexOf('sub_section_1') && current.orgSubSection1Id && next.orgSectionId) {
    const ss1 = getOrgNode(current.orgSubSection1Id)
    if (ss1?.parentId === next.orgSectionId) next.orgSubSection1Id = current.orgSubSection1Id
  }
  if (maxIdx >= LEVEL_ORDER.indexOf('sub_section_2') && current.orgSubSection2Id && next.orgSubSection1Id) {
    const ss2 = getOrgNode(current.orgSubSection2Id)
    if (ss2?.parentId === next.orgSubSection1Id) next.orgSubSection2Id = current.orgSubSection2Id
  }

  return next
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
      return 'Select the section under that wing.'
    }
    if (level === 'sub_section_1' && !placement.orgSubSection1Id) {
      return 'Select Section 1 (Deputy Director unit) under the section.'
    }
    if (level === 'sub_section_2' && !placement.orgSubSection2Id) {
      return 'Select Section 2 (Assistant Director unit) under Section 1.'
    }
  }

  if (placement.orgWingId && !getOrgNode(placement.orgWingId)) {
    return 'Invalid wing selection.'
  }
  if (placement.orgSectionId) {
    if (!getOrgNode(placement.orgSectionId)) return 'Invalid section selection.'
    const parentWing = getOrgNode(placement.orgSectionId)?.parentId
    if (parentWing !== placement.orgWingId) {
      return 'Section must belong to the selected wing.'
    }
  }
  if (placement.orgSubSection1Id) {
    const ss1 = getOrgNode(placement.orgSubSection1Id)
    if (!ss1 || ss1.parentId !== placement.orgSectionId) {
      return 'Section 1 (DD) must belong to the selected Section.'
    }
  }
  if (placement.orgSubSection2Id) {
    const ss2 = getOrgNode(placement.orgSubSection2Id)
    if (!ss2 || ss2.parentId !== placement.orgSubSection1Id) {
      return 'Section 2 (AD) must belong to the selected Section 1 (DD).'
    }
  }

  return null
}
