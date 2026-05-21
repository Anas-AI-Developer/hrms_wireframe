/**
 * NAVTTC HQs organogram — flat node API (built from navttcOrgMapping tree).
 */
import {
  NAVTTC_HQ_ORG_TREE,
  ORG_MAPPING_ROWS,
  treeToFlatNodes,
  type OrgMappingRow,
} from './navttcOrgMapping'
import type { EmployeeOrgPlacement } from './navttcOrgMapping'
import type { NavttcOrgNode, OrgLevel } from './navttcOrgTypes'
import {
  ORG_LEVEL_LABELS,
  ORG_LEVEL_SIDEBAR_LABELS,
  ORG_STRUCTURE_ROUTES,
  ORG_TABLE_MAPPING_COLUMNS,
  type OrgMappingColumn,
} from './navttcOrgTypes'

export type { NavttcOrgNode, OrgLevel, OrgMappingColumn, OrgStructureRouteKey } from './navttcOrgTypes'
export type { EmployeeOrgPlacement } from './navttcOrgMapping'
export {
  ORG_LEVEL_LABELS,
  ORG_LEVEL_SIDEBAR_LABELS,
  ORG_STRUCTURE_ROUTES,
  ORG_TABLE_MAPPING_COLUMNS,
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

export function orgNodesAtLevel(level: OrgLevel): NavttcOrgNode[] {
  return NAVTTC_ORG_NODES.filter((n) => n.level === level).sort((a, b) =>
    a.name.localeCompare(b.name),
  )
}

export function orgParentPath(node: NavttcOrgNode): string {
  const parts: string[] = []
  let id: string | null | undefined = node.parentId
  while (id) {
    const parent = getOrgNode(id)
    if (!parent) break
    parts.unshift(parent.name)
    id = parent.parentId
  }
  return parts.join(' › ')
}

export function getOrgAncestorAtLevel(
  node: NavttcOrgNode,
  ancestorLevel: OrgLevel,
): NavttcOrgNode | undefined {
  let id: string | null | undefined = node.parentId
  while (id) {
    const parent = getOrgNode(id)
    if (!parent) break
    if (parent.level === ancestorLevel) return parent
    id = parent.parentId
  }
  return undefined
}

export function orgMappingSearchText(node: NavttcOrgNode, columns: OrgMappingColumn[]): string {
  const bits = [node.name, node.code ?? '', orgParentPath(node)]
  for (const col of columns) {
    const anc = getOrgAncestorAtLevel(node, col.level)
    if (anc) bits.push(anc.name, anc.code ?? '')
  }
  return bits.join(' ').toLowerCase()
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
