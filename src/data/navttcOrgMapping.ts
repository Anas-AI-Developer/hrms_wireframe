/**
 * NAVTTC HQs organogram — source-of-truth tree + legacy field mappings.
 * Aligned with Organogram_NAVTTC HQs_2026.pdf
 */
import type { Employee } from '../types/hrms'
import type { NavttcOrgNode, OrgLevel } from './navttcOrgTypes'
import { ORG_LEVEL_LABELS } from './navttcOrgTypes'

export type { NavttcOrgNode, OrgLevel } from './navttcOrgTypes'

/** Placement fields stored on employees (defined here to avoid circular imports). */
export type EmployeeOrgPlacement = {
  orgHeadId: string
  orgWingId: string
  orgSectionId: string
  orgSubSection1Id?: string
  orgSubSection2Id?: string
}

export type OrgMappingNode = {
  id: string
  name: string
  level: OrgLevel
  /** Short code for mapping tables / imports */
  code: string
  legacyDepartmentId?: string
  children?: OrgMappingNode[]
}

/** Nested organogram (Head → Wing → Section → Sub Section 1 → Sub Section 2) */
export const NAVTTC_HQ_ORG_TREE: OrgMappingNode = {
  id: 'org-head',
  code: 'HEAD-ED',
  name: 'Executive Director',
  level: 'head',
  children: [
    {
      id: 'org-wing-pd',
      code: 'WING-PD',
      name: 'Director General (P&D)',
      level: 'wing',
      legacyDepartmentId: 'c1',
      children: [
        {
          id: 'org-sec-pd-nsis',
          code: 'SEC-NSIS',
          name: 'Director (NSIS)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-pd-nsis-data',
              code: 'SS1-NSIS-DATA',
              name: 'NSIS Data & Analytics',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-pd-nsis-dd',
                  code: 'SS2-DD-NSIS',
                  name: 'Deputy Director (NSIS)',
                  level: 'sub_section_2',
                },
                {
                  id: 'org-ss2-pd-nsis-ad',
                  code: 'SS2-AD-NSIS',
                  name: 'Assistant Director (NSIS)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-pd-plan',
          code: 'SEC-PLAN',
          name: 'Director (Planning)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-pd-plan-policy',
              code: 'SS1-PLAN-POL',
              name: 'Policy & Research',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-pd-plan-dd',
                  code: 'SS2-DD-PLAN',
                  name: 'Deputy Director (Planning)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-pd-me',
          code: 'SEC-ME',
          name: 'Director (Monitoring & Evaluation)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-pd-me-field',
              code: 'SS1-ME-FLD',
              name: 'Field Monitoring',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-pd-me-dd',
                  code: 'SS2-DD-ME',
                  name: 'Deputy Director (M&E)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-pd-innov',
          code: 'SEC-INNOV',
          name: 'Director (Innovation & Partnerships)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-pd-innov-pm',
              code: 'SS1-INNOV-PM',
              name: 'Partnerships & PMYSDP',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-pd-innov-dd',
                  code: 'SS2-DD-INNOV',
                  name: 'Deputy Director (Innovation)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'org-wing-af',
      code: 'WING-AF',
      name: 'Director General (A&F)',
      level: 'wing',
      legacyDepartmentId: 'c2',
      children: [
        {
          id: 'org-sec-af-admin',
          code: 'SEC-ADMIN',
          name: 'Director (Administration)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-af-admin-gen',
              code: 'SS1-ADMIN',
              name: 'General Administration',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-af-admin-dd',
                  code: 'SS2-DD-ADMIN',
                  name: 'Deputy Director (Administration)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-af-finance',
          code: 'SEC-FIN',
          name: 'Director (Finance)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-af-fin-accts',
              code: 'SS1-ACCOUNTS',
              name: 'Accounts & Budget',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-af-fin-dd',
                  code: 'SS2-DD-FIN',
                  name: 'Deputy Director (Finance)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-af-hr',
          code: 'SEC-HR',
          name: 'Director (Human Resource)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-af-hr-ops',
              code: 'SS1-HR-OPS',
              name: 'HR Operations',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-af-hr-dd',
                  code: 'SS2-DD-HR',
                  name: 'Deputy Director (HR)',
                  level: 'sub_section_2',
                },
                {
                  id: 'org-ss2-af-hr-ad',
                  code: 'SS2-AD-HR',
                  name: 'Assistant Director (HR)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-af-estate',
          code: 'SEC-ESTATE',
          name: 'Director (Estate & Logistics)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-af-estate-log',
              code: 'SS1-LOGISTICS',
              name: 'Logistics & Transport',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-af-estate-dd',
                  code: 'SS2-DD-ESTATE',
                  name: 'Deputy Director (Estate)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'org-wing-ac',
      code: 'WING-AC',
      name: 'Director General (A&C)',
      level: 'wing',
      legacyDepartmentId: 'c1',
      children: [
        {
          id: 'org-sec-ac-accred',
          code: 'SEC-ACCRED',
          name: 'Director (Accreditation)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-ac-accred-reg',
              code: 'SS1-ACCRED-REG',
              name: 'Accreditation Registry',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-ac-accred-dd',
                  code: 'SS2-DD-ACCRED',
                  name: 'Deputy Director (Accreditation)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-ac-cert',
          code: 'SEC-CERT',
          name: 'Director (Certification)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-ac-cert-ops',
              code: 'SS1-CERT',
              name: 'Certification Operations',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-ac-cert-dd',
                  code: 'SS2-DD-CERT',
                  name: 'Deputy Director (Certification)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-ac-quality',
          code: 'SEC-QA',
          name: 'Director (Quality Assurance)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-ac-qa-audit',
              code: 'SS1-QA',
              name: 'QA & Audit',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-ac-qa-dd',
                  code: 'SS2-DD-QA',
                  name: 'Deputy Director (Quality Assurance)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'org-wing-sc',
      code: 'WING-SC',
      name: 'Director General (S&C)',
      level: 'wing',
      legacyDepartmentId: 'c3',
      children: [
        {
          id: 'org-sec-sc-curr',
          code: 'SEC-CURR',
          name: 'Director (Curricula)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-sc-curr-dev',
              code: 'SS1-CURR-DEV',
              name: 'Curriculum Development',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-sc-curr-dd',
                  code: 'SS2-DD-CURR',
                  name: 'Deputy Director (Curricula)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-sc-standards',
          code: 'SEC-STD',
          name: 'Director (Standards)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-sc-std-nos',
              code: 'SS1-NOS',
              name: 'National Occupational Standards',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-sc-std-dd',
                  code: 'SS2-DD-STD',
                  name: 'Deputy Director (Standards)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
        {
          id: 'org-sec-sc-assess',
          code: 'SEC-ASSESS',
          name: 'Director (Assessment)',
          level: 'section',
          children: [
            {
              id: 'org-ss1-sc-assess-ctr',
              code: 'SS1-ASSESS',
              name: 'Assessment Centres',
              level: 'sub_section_1',
              children: [
                {
                  id: 'org-ss2-sc-assess-dd',
                  code: 'SS2-DD-ASSESS',
                  name: 'Deputy Director (Assessment)',
                  level: 'sub_section_2',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

/** Wireframe department id → default wing (for roster migration) */
export const LEGACY_DEPARTMENT_TO_WING: Record<string, string> = {
  c1: 'org-wing-pd',
  c2: 'org-wing-af',
  c3: 'org-wing-sc',
  c4: 'org-wing-af',
  c5: 'org-wing-pd',
  c6: 'org-wing-pd',
  c7: 'org-wing-pd',
  c8: 'org-wing-pd',
}

/** Demo section label (MasterList) → organogram section node id */
export const LEGACY_SECTION_TO_ORG_SECTION: Record<string, string> = {
  Executive: 'org-sec-pd-plan',
  Administration: 'org-sec-af-admin',
  'HR Operations': 'org-sec-af-hr',
  'Software Development': 'org-sec-sc-curr',
  Payroll: 'org-sec-af-finance',
  'Field Operations': 'org-sec-pd-me',
  General: 'org-sec-af-admin',
}

/** Sanctioned post keyword → section (when section label missing) */
export const POST_KEYWORD_TO_ORG_SECTION: { match: RegExp; sectionId: string }[] = [
  { match: /executive director/i, sectionId: 'org-sec-pd-plan' },
  { match: /director general|dg\b/i, sectionId: 'org-sec-pd-plan' },
  { match: /nsis/i, sectionId: 'org-sec-pd-nsis' },
  { match: /deputy director|dd\b/i, sectionId: 'org-sec-pd-me' },
  { match: /assistant director|ad\b/i, sectionId: 'org-sec-af-hr' },
  { match: /human resource|hr\b/i, sectionId: 'org-sec-af-hr' },
  { match: /finance|accounts|cashier/i, sectionId: 'org-sec-af-finance' },
  { match: /accreditation|certification/i, sectionId: 'org-sec-ac-accred' },
  { match: /curricula|standard|assessment/i, sectionId: 'org-sec-sc-curr' },
  { match: /private secretary|aps|stenotypist|receptionist|driver|chowkidar|sanitary|electrician|maintenance/i, sectionId: 'org-sec-af-admin' },
]

export type OrgMappingRow = {
  id: string
  code: string
  level: OrgLevel
  levelLabel: string
  name: string
  parentId: string | null
  parentName: string | null
  path: string
  legacyDepartmentId?: string
}

function flattenTree(
  node: OrgMappingNode,
  parent: OrgMappingNode | null,
  pathParts: string[],
): OrgMappingRow[] {
  const path = [...pathParts, node.name].join(' › ')
  const row: OrgMappingRow = {
    id: node.id,
    code: node.code,
    level: node.level,
    levelLabel: ORG_LEVEL_LABELS[node.level],
    name: node.name,
    parentId: parent?.id ?? null,
    parentName: parent?.name ?? null,
    path,
    legacyDepartmentId: node.legacyDepartmentId,
  }
  const childRows = (node.children ?? []).flatMap((c) => flattenTree(c, node, [...pathParts, node.name]))
  return [row, ...childRows]
}

export const ORG_MAPPING_ROWS: OrgMappingRow[] = flattenTree(NAVTTC_HQ_ORG_TREE, null, [])

export function treeToFlatNodes(tree: OrgMappingNode = NAVTTC_HQ_ORG_TREE): NavttcOrgNode[] {
  const rows: NavttcOrgNode[] = []
  function walk(node: OrgMappingNode, parentId: string | null) {
    rows.push({
      id: node.id,
      level: node.level,
      name: node.name,
      parentId,
      legacyDepartmentId: node.legacyDepartmentId,
      code: node.code,
    })
    for (const child of node.children ?? []) walk(child, node.id)
  }
  walk(tree, null)
  return rows
}

export function inferOrgPlacementFromEmployee(emp: Employee): EmployeeOrgPlacement | null {
  const wingId = LEGACY_DEPARTMENT_TO_WING[emp.departmentId]
  if (!wingId) return null

  let sectionId = emp.orgSectionId
  if (!sectionId && emp.section) {
    sectionId = LEGACY_SECTION_TO_ORG_SECTION[emp.section]
  }
  if (!sectionId && emp.sanctionedPost) {
    const hit = POST_KEYWORD_TO_ORG_SECTION.find((r) => r.match.test(emp.sanctionedPost!))
    sectionId = hit?.sectionId
  }
  if (!sectionId) {
    const firstSection = treeToFlatNodes().find((n) => n.parentId === wingId && n.level === 'section')
    sectionId = firstSection?.id
  }
  if (!sectionId) return null

  const placement: EmployeeOrgPlacement = {
    orgHeadId: 'org-head',
    orgWingId: wingId,
    orgSectionId: sectionId,
    orgSubSection1Id: emp.orgSubSection1Id,
    orgSubSection2Id: emp.orgSubSection2Id,
  }

  if (!placement.orgSubSection2Id && emp.sanctionedPost && /deputy director|\bdd\b/i.test(emp.sanctionedPost)) {
    const ss1 = treeToFlatNodes().find((n) => n.parentId === sectionId && n.level === 'sub_section_1')
    const ss2 = ss1
      ? treeToFlatNodes().find((n) => n.parentId === ss1.id && n.level === 'sub_section_2' && /dd/i.test(n.name))
      : treeToFlatNodes().find((n) => n.parentId === sectionId && n.level === 'sub_section_2' && /dd/i.test(n.name))
    if (ss1) placement.orgSubSection1Id = ss1.id
    if (ss2) placement.orgSubSection2Id = ss2.id
  }

  return placement
}
