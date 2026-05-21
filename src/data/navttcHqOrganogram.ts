/**
 * NAVTTC HQs organogram — flat node API (built from navttcOrgMapping tree).
 */
import {
  NAVTTC_HQ_ORG_TREE,
  ORG_MAPPING_ROWS,
  treeToFlatNodes,
  type OrgMappingRow,
} from './navttcOrgMapping'

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
  sub_section_1: 'Sub Section 1',
  sub_section_2: 'Sub Section 2',
}

export const NAVTTC_HQ_OFFICE_ID = 'o-hq'

export const NAVTTC_ORG_NODES: NavttcOrgNode[] = treeToFlatNodes(NAVTTC_HQ_ORG_TREE)

const nodeById = new Map(NAVTTC_ORG_NODES.map((n) => [n.id, n]))

export function getOrgNode(id: string | undefined): NavttcOrgNode | undefined {
  if (!id) return undefined
  return nodeById.get(id)
}

export function getOrgChildren(parentId: string | null, level: OrgLevel): NavttcOrgNode[] {
  return NAVTTC_ORG_NODES.filter((n) => n.parentId === parentId && n.level === level).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export type EmployeeOrgPlacement = {
  orgHeadId: string
  orgWingId: string
  orgSectionId: string
  orgSubSection1Id?: string
  orgSubSection2Id?: string
}

export function formatOrgPlacementPath(placement: Partial<EmployeeOrgPlacement>): string {
  const ids = [
    placement.orgHeadId,
    placement.orgWingId,
    placement.orgSectionId,
    placement.orgSubSection1Id,
    placement.orgSubSection2Id,
  ].filter(Boolean) as string[]
  return ids
    .map((id) => getOrgNode(id)?.name)
    .filter(Boolean)
    .join(' › ')
}

export function legacyDepartmentIdForPlacement(placement: EmployeeOrgPlacement): string {
  const wing = getOrgNode(placement.orgWingId)
  return wing?.legacyDepartmentId ?? 'c1'
}

export const DEFAULT_ORG_HEAD_ID = 'org-head'

export { ORG_MAPPING_ROWS, type OrgMappingRow }
