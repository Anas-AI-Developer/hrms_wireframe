/**
 * NAVTTC HQs organogram — flat node API (reads from organogramStore).
 */
import type { EmployeeOrgPlacement } from './navttcOrgMapping'
import type { NavttcOrgNode, OrgLevel } from './navttcOrgTypes'
import {
  ORG_LEVEL_LABELS,
  ORG_LEVEL_SIDEBAR_LABELS,
  ORG_STRUCTURE_ROUTES,
  ORG_TABLE_MAPPING_COLUMNS,
  type OrgMappingColumn,
} from './navttcOrgTypes'
import {
  buildOrgMappingRows,
  getOrgChildrenFromStore,
  getOrgMappingRowsSnapshot,
  getOrgNodeFromStore,
  getOrgNodesSnapshot,
  orgNodesAtLevelFromStore,
} from './organogramStore'

export type { NavttcOrgNode, OrgLevel, OrgMappingColumn, OrgStructureRouteKey } from './navttcOrgTypes'
export type { EmployeeOrgPlacement } from './navttcOrgMapping'
export {
  ORG_LEVEL_LABELS,
  ORG_LEVEL_SIDEBAR_LABELS,
  ORG_STRUCTURE_ROUTES,
  ORG_TABLE_MAPPING_COLUMNS,
}

export const NAVTTC_HQ_OFFICE_ID = 'o-hq'
export const DEFAULT_ORG_HEAD_ID = 'org-head'

/** @deprecated Use getOrgNodesSnapshot() — kept for legacy imports */
export function getOrgNodes(): NavttcOrgNode[] {
  return getOrgNodesSnapshot()
}

export function getOrgNode(id: string | undefined): NavttcOrgNode | undefined {
  return getOrgNodeFromStore(id)
}

export function getOrgChildren(parentId: string | null, level: OrgLevel): NavttcOrgNode[] {
  return getOrgChildrenFromStore(parentId, level)
}

export function orgNodesAtLevel(level: OrgLevel): NavttcOrgNode[] {
  return orgNodesAtLevelFromStore(level)
}

export function orgParentPath(node: NavttcOrgNode): string {
  const parts: string[] = []
  let id: string | null | undefined = node.parentId
  while (id) {
    const parent = getOrgNodeFromStore(id)
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
    const parent = getOrgNodeFromStore(id)
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
    .map((id) => getOrgNodeFromStore(id)?.name)
    .filter(Boolean)
    .join(' › ')
}

export function legacyDepartmentIdForPlacement(placement: EmployeeOrgPlacement): string {
  const wing = getOrgNodeFromStore(placement.orgWingId)
  return wing?.legacyDepartmentId ?? 'c1'
}

export function getOrgMappingRows(): ReturnType<typeof buildOrgMappingRows> {
  return getOrgMappingRowsSnapshot()
}

export type OrgMappingRow = ReturnType<typeof buildOrgMappingRows>[number]

export { buildOrgMappingRows as ORG_MAPPING_ROWS_BUILDER }
