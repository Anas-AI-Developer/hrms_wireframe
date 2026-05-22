import type { Employee } from '../types/hrms'
import type { OrgMappingRow } from './navttcOrgMapping'
import {
  NAVTTC_CANONICAL_WING_IDS,
  NAVTTC_HQ_ORG_TREE,
  NAVTTC_WING_DIRECTORATES_LABEL,
  applyCanonicalWingDisplayNames,
  getCanonicalWings,
  isCanonicalWingId,
  organogramHasNonCanonicalWings,
  treeToFlatNodes,
} from './navttcOrgMapping'
import type { NavttcOrgNode, OrgLevel } from './navttcOrgTypes'
import { ORG_LEVEL_LABELS } from './navttcOrgTypes'
import { getWireframeStore } from './wireframeStore'

const DEFAULT_ORG_HEAD_ID = 'org-head'
export const ORGANOGRAM_SNAPSHOT_PATH = '/organogram-snapshot.json'

function orgParentPathForNode(node: NavttcOrgNode, all: NavttcOrgNode[]): string {
  const byId = new Map(all.map((n) => [n.id, n]))
  const parts: string[] = []
  let id: string | null | undefined = node.parentId
  while (id) {
    const parent = byId.get(id)
    if (!parent) break
    parts.unshift(parent.name)
    id = parent.parentId
  }
  return parts.join(' › ')
}

export { DEFAULT_ORG_HEAD_ID }

const STORAGE_KEY = 'hrms-wireframe-organogram-v3'
const LEGACY_STORAGE_KEY = 'hrms-wireframe-organogram-v2'

const PARENT_LEVEL: Record<OrgLevel, OrgLevel | null> = {
  head: null,
  wing: 'head',
  section: 'wing',
  sub_section_1: 'section',
  sub_section_2: 'sub_section_1',
}

const ID_PREFIX: Partial<Record<OrgLevel, string>> = {
  wing: 'org-wing-',
  section: 'org-sec-',
  sub_section_1: 'org-ss1-',
  sub_section_2: 'org-ss2-',
}

type Listener = () => void
const listeners = new Set<Listener>()

function defaultSeedNodes(): NavttcOrgNode[] {
  return applyCanonicalWingDisplayNames(treeToFlatNodes(structuredClone(NAVTTC_HQ_ORG_TREE)))
}

function parseStoredNodes(raw: string | null): NavttcOrgNode[] | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as NavttcOrgNode[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    if (!parsed.some((n) => n.id === DEFAULT_ORG_HEAD_ID)) return null
    return parsed
  } catch {
    return null
  }
}

function wingIdFromNodeId(nodeId: string): (typeof NAVTTC_CANONICAL_WING_IDS)[number] | undefined {
  if (nodeId.includes('-pd-') || nodeId.startsWith('org-wing-pd')) return 'org-wing-pd'
  if (nodeId.includes('-af-') || nodeId.startsWith('org-wing-af')) return 'org-wing-af'
  if (nodeId.includes('-ac-') || nodeId.startsWith('org-wing-ac')) return 'org-wing-ac'
  if (nodeId.includes('-sc-') || nodeId.startsWith('org-wing-sc')) return 'org-wing-sc'
  return undefined
}

/** Drop extra wing nodes and fix children that pointed at removed wings. */
function sanitizeOrganogramNodes(input: NavttcOrgNode[]): NavttcOrgNode[] {
  if (!organogramHasNonCanonicalWings(input)) return input

  const seed = defaultSeedNodes()
  const canonicalWings = getCanonicalWings(seed)
  const head =
    input.find((n) => n.id === DEFAULT_ORG_HEAD_ID) ??
    seed.find((n) => n.id === DEFAULT_ORG_HEAD_ID)!
  const canonicalSet = new Set<string>(NAVTTC_CANONICAL_WING_IDS)

  const repaired = input
    .filter((n) => n.level !== 'wing' && n.level !== 'head')
    .map((n) => {
      if (!n.parentId || canonicalSet.has(n.parentId)) return n
      const parent = input.find((p) => p.id === n.parentId)
      if (parent?.level !== 'wing') return n
      const wingId = wingIdFromNodeId(n.id) ?? wingIdFromNodeId(parent.id)
      if (!wingId) return n
      return { ...n, parentId: wingId }
    })

  return [head, ...canonicalWings, ...repaired]
}

function loadFromLocalStorage(): NavttcOrgNode[] | null {
  const stored = parseStoredNodes(localStorage.getItem(STORAGE_KEY))
  if (stored) {
    if (organogramHasNonCanonicalWings(stored)) {
      const clean = applyCanonicalWingDisplayNames(sanitizeOrganogramNodes(stored))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
      return clean
    }
    return applyCanonicalWingDisplayNames(stored)
  }
  const legacy = parseStoredNodes(localStorage.getItem(LEGACY_STORAGE_KEY))
  if (legacy) {
    const clean = applyCanonicalWingDisplayNames(sanitizeOrganogramNodes(legacy))
    localStorage.removeItem(LEGACY_STORAGE_KEY)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
    return clean
  }
  return null
}

let nodes: NavttcOrgNode[] = loadFromLocalStorage() ?? defaultSeedNodes()

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes))
}

function commit(next: NavttcOrgNode[]) {
  nodes = applyCanonicalWingDisplayNames(next)
  persist()
  listeners.forEach((fn) => fn())
}

export function subscribeOrganogramStore(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getOrgNodesSnapshot(): NavttcOrgNode[] {
  return nodes
}

export function resetOrganogramStore() {
  localStorage.removeItem(STORAGE_KEY)
  commit(defaultSeedNodes())
}

/** Load public/organogram-snapshot.json when browser storage is empty (shows in Cursor if saved there). */
function parseSnapshotPayload(data: unknown): NavttcOrgNode[] | null {
  if (Array.isArray(data)) return parseStoredNodes(JSON.stringify(data))
  if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { nodes?: unknown }).nodes)
  ) {
    return parseStoredNodes(JSON.stringify((data as { nodes: NavttcOrgNode[] }).nodes))
  }
  return null
}

export async function hydrateOrganogramFromProjectFile(): Promise<boolean> {
  if (loadFromLocalStorage()) return false
  try {
    const res = await fetch(ORGANOGRAM_SNAPSHOT_PATH, { cache: 'no-store' })
    if (!res.ok) return false
    const parsed = parseSnapshotPayload(await res.json())
    if (!parsed) return false
    commit(parsed)
    return true
  } catch {
    return false
  }
}

export function exportOrganogramSnapshotDownload(): void {
  const json = JSON.stringify(nodes, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'organogram-snapshot.json'
  a.click()
  URL.revokeObjectURL(url)
}

export function importOrganogramSnapshotFromJson(
  raw: string,
): { ok: true } | { error: string } {
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { error: 'File is not valid JSON.' }
  }
  const parsed = parseSnapshotPayload(data)
  if (!parsed) return { error: 'Invalid organogram JSON (need a non-empty array with org-head).' }
  commit(parsed)
  return { ok: true }
}

function nodeIndex() {
  return new Map(nodes.map((n) => [n.id, n]))
}

export function getOrgNodeFromStore(id: string | undefined): NavttcOrgNode | undefined {
  if (!id) return undefined
  return nodeIndex().get(id)
}

export function getOrgChildrenFromStore(parentId: string | null, level: OrgLevel): NavttcOrgNode[] {
  if (level === 'wing' && (parentId === null || parentId === DEFAULT_ORG_HEAD_ID)) {
    return getCanonicalWings(nodes)
  }
  const rows = nodes.filter((n) => n.parentId === parentId && n.level === level)
  if (level === 'wing') {
    return getCanonicalWings(rows.length > 0 ? rows : nodes)
  }
  return rows.sort((a, b) => a.name.localeCompare(b.name))
}

export function orgNodesAtLevelFromStore(level: OrgLevel): NavttcOrgNode[] {
  if (level === 'wing') return getCanonicalWings(nodes)
  return nodes.filter((n) => n.level === level).sort((a, b) => a.name.localeCompare(b.name))
}

export function buildOrgMappingRows(): OrgMappingRow[] {
  return nodes.map((node) => {
    const parent = node.parentId ? nodeIndex().get(node.parentId) : null
    return {
      id: node.id,
      code: node.code ?? '',
      level: node.level,
      levelLabel: ORG_LEVEL_LABELS[node.level],
      name: node.name,
      parentId: node.parentId,
      parentName: parent?.name ?? null,
      path: orgParentPathForNode(node, nodes),
      legacyDepartmentId: node.legacyDepartmentId,
    }
  })
}

export function getOrgMappingRowsSnapshot(): OrgMappingRow[] {
  return buildOrgMappingRows()
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

function nextOrgId(level: OrgLevel, code: string): string {
  const prefix = ID_PREFIX[level] ?? 'org-node-'
  const base = `${prefix}${slugify(code)}`
  const ids = new Set(nodes.map((n) => n.id))
  if (!ids.has(base)) return base
  let i = 2
  while (ids.has(`${base}-${i}`)) i++
  return `${base}-${i}`
}

function expectedParentLevel(level: OrgLevel): OrgLevel | null {
  return PARENT_LEVEL[level] ?? null
}

export type OrgNodeInput = {
  name: string
  code: string
  parentId: string | null
  legacyDepartmentId?: string
}

export function validateOrgNodeInput(
  level: OrgLevel,
  input: OrgNodeInput,
  editingId?: string,
): string | null {
  if (level === 'head') return 'Head node cannot be created via this form.'
  if (!input.name.trim()) return 'Name is required.'
  if (!input.code.trim()) return 'Code is required.'
  const parentLevel = expectedParentLevel(level)
  if (parentLevel && !input.parentId) {
    return `Select a parent ${ORG_LEVEL_LABELS[parentLevel]}.`
  }
  const parent = input.parentId ? nodeIndex().get(input.parentId) : undefined
  if (parentLevel && (!parent || parent.level !== parentLevel)) {
    return `Parent must be a ${ORG_LEVEL_LABELS[parentLevel]}.`
  }
  const duplicateCode = nodes.some(
    (n) => n.level === level && n.code?.toLowerCase() === input.code.trim().toLowerCase() && n.id !== editingId,
  )
  if (duplicateCode) return 'Code already exists at this level.'
  return null
}

export function addOrgNode(level: OrgLevel, input: OrgNodeInput): NavttcOrgNode | { error: string } {
  if (level === 'wing') {
    return {
      error: `HQ has four fixed directorate wings (${NAVTTC_WING_DIRECTORATES_LABEL}). Edit an existing wing instead.`,
    }
  }
  const err = validateOrgNodeInput(level, input)
  if (err) return { error: err }
  const row: NavttcOrgNode = {
    id: nextOrgId(level, input.code),
    level,
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    parentId: level === 'head' ? null : input.parentId,
    legacyDepartmentId: undefined,
  }
  commit([...nodes, row])
  return row
}

export function updateOrgNode(
  id: string,
  input: OrgNodeInput,
): NavttcOrgNode | { error: string } | undefined {
  const existing = nodeIndex().get(id)
  if (!existing) return undefined
  if (existing.level === 'wing' && !isCanonicalWingId(existing.id)) {
    return { error: `Only the four HQ directorate wings can be maintained.` }
  }
  const err = validateOrgNodeInput(existing.level, input, id)
  if (err) return { error: err }
  if (existing.id === DEFAULT_ORG_HEAD_ID && input.parentId !== existing.parentId) {
    return { error: 'Cannot change parent of the Head node.' }
  }
  const updated: NavttcOrgNode = {
    ...existing,
    name: input.name.trim(),
    code: input.code.trim().toUpperCase(),
    parentId: existing.level === 'head' ? null : input.parentId,
    legacyDepartmentId: existing.level === 'wing' ? input.legacyDepartmentId : existing.legacyDepartmentId,
  }
  commit(nodes.map((n) => (n.id === id ? updated : n)))
  return updated
}

function countEmployeesOnNode(nodeId: string, employees: Employee[]): number {
  return employees.filter(
    (e) =>
      e.orgHeadId === nodeId ||
      e.orgWingId === nodeId ||
      e.orgSectionId === nodeId ||
      e.orgSubSection1Id === nodeId ||
      e.orgSubSection2Id === nodeId,
  ).length
}

function childCount(nodeId: string): number {
  return nodes.filter((n) => n.parentId === nodeId).length
}

export function deleteOrgNode(id: string): { ok: true } | { error: string } {
  if (id === DEFAULT_ORG_HEAD_ID) return { error: 'The Head (Executive Director) node cannot be deleted.' }
  if (isCanonicalWingId(id)) {
    return { error: 'HQ directorate wings cannot be deleted.' }
  }
  const node = nodeIndex().get(id)
  if (!node) return { error: 'Unit not found.' }
  if (childCount(id) > 0) {
    return { error: 'Remove or reassign child units before deleting this node.' }
  }
  const staff = countEmployeesOnNode(id, getWireframeStore().employees)
  if (staff > 0) {
    return { error: `Cannot delete: ${staff} employee(s) are assigned to this unit.` }
  }
  commit(nodes.filter((n) => n.id !== id))
  return { ok: true }
}

export function parentLevelFor(level: OrgLevel): OrgLevel | null {
  return PARENT_LEVEL[level] ?? null
}

export function canCreateAtLevel(level: OrgLevel): boolean {
  return level !== 'head' && level !== 'wing'
}

export function canDeleteNode(id: string): boolean {
  return id !== DEFAULT_ORG_HEAD_ID
}

/** Parent dropdown options when creating/editing a unit (not used for wing/head). */
export function listParentOptionsForLevel(level: OrgLevel): NavttcOrgNode[] {
  const head = getOrgChildrenFromStore(null, 'head')[0]
  const headId = head?.id ?? null
  if (level === 'section') {
    return getOrgChildrenFromStore(headId, 'wing')
  }
  if (level === 'sub_section_1') {
    return getOrgChildrenFromStore(headId, 'wing').flatMap((w) =>
      getOrgChildrenFromStore(w.id, 'section'),
    )
  }
  if (level === 'sub_section_2') {
    return getOrgChildrenFromStore(headId, 'wing').flatMap((w) =>
      getOrgChildrenFromStore(w.id, 'section').flatMap((s) =>
        getOrgChildrenFromStore(s.id, 'sub_section_1'),
      ),
    )
  }
  return []
}
