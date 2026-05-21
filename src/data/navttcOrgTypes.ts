/** Shared organogram types & labels (no tree data — avoids circular imports). */

export type OrgLevel = 'head' | 'wing' | 'section' | 'sub_section_1' | 'sub_section_2'

export type NavttcOrgNode = {
  id: string
  level: OrgLevel
  name: string
  parentId: string | null
  legacyDepartmentId?: string
  code?: string
}

export const ORG_LEVEL_LABELS: Record<OrgLevel, string> = {
  head: 'Head',
  wing: 'Wing',
  section: 'Section',
  sub_section_1: 'Section 1 (DD)',
  sub_section_2: 'Section 2 (AD)',
}

export const ORG_LEVEL_SIDEBAR_LABELS: Record<OrgLevel, string> = {
  head: 'Head',
  wing: 'Wings',
  section: 'Sections',
  sub_section_1: 'Section 1 (DD)',
  sub_section_2: 'Section 2 (AD)',
}

export type OrgStructureRouteKey = 'head' | 'wings' | 'sections' | 'section-1' | 'section-2'

export const ORG_STRUCTURE_ROUTES: Record<
  OrgStructureRouteKey,
  { level: OrgLevel; title: string; description: string }
> = {
  head: {
    level: 'head',
    title: 'Head',
    description: 'NAVTTC Headquarters — Executive Director (Organogram 2026).',
  },
  wings: {
    level: 'wing',
    title: 'Wings',
    description: 'Director General (P&D), (A&F), (A&C), and (S&C).',
  },
  sections: {
    level: 'section',
    title: 'Sections',
    description: 'Directorates under each Director General (dark blocks on organogram PDF).',
  },
  'section-1': {
    level: 'sub_section_1',
    title: 'Section 1 (DD)',
    description: 'Deputy Director units under each directorate.',
  },
  'section-2': {
    level: 'sub_section_2',
    title: 'Section 2 (AD)',
    description: 'Assistant Director units under Section 1.',
  },
}

export type OrgMappingColumn = { level: OrgLevel; label: string }

export const ORG_TABLE_MAPPING_COLUMNS: Record<OrgStructureRouteKey, OrgMappingColumn[]> = {
  head: [],
  wings: [{ level: 'head', label: 'Head' }],
  sections: [{ level: 'wing', label: 'Wing' }],
  'section-1': [
    { level: 'wing', label: 'Wing' },
    { level: 'section', label: 'Section' },
  ],
  'section-2': [
    { level: 'wing', label: 'Wing' },
    { level: 'section', label: 'Section' },
    { level: 'sub_section_1', label: 'Section 1 (DD)' },
  ],
}
