import { useEffect, useMemo } from 'react'
import { useOrganogramNodes } from '../../hooks/useOrganogramNodes'
import {
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormRequired,
} from '../hrms/HrmsCompactForm'
import {
  getCanonicalWings,
  legacyDepartmentIdForWingId,
} from '../../data/navttcOrgMapping'
import {
  filterOrganogramNodesForRole,
  orgPlacementEntryMode,
  organogramFilterRoleForLevel,
  organogramTargetLevel,
  roleOrgUiConfig,
  validateOrgPlacementForRole,
} from '../../data/roleOrgPlacement'
import {
  DEFAULT_ORG_HEAD_ID,
  formatOrgPlacementPath,
  getOrgAncestorAtLevel,
  getOrgChildren,
  getOrgNode,
  nodeIsUnderWing,
  orgNodesAtLevel,
  placementFromOrgNode,
  ORG_LEVEL_LABELS,
  ORG_LEVEL_SIDEBAR_LABELS,
  type EmployeeOrgPlacement,
  type NavttcOrgNode,
  type OrgLevel,
} from '../../data/navttcHqOrganogram'
import { wingIdForLegacyDepartment } from '../../data/navttcOrgMapping'
type Props = {
  value: EmployeeOrgPlacement
  onChange: (next: EmployeeOrgPlacement) => void
  error?: string | null
  roleLevelId?: string
  /** HQ roster centre id (legacy department) — syncs with wing via mapping table. */
  legacyCentreId?: string
  onLegacyCentreChange?: (departmentId: string) => void
}

const LEVEL_ORDER: OrgLevel[] = ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2']

const LEVEL_ICONS: Record<OrgLevel, string> = {
  head: 'ri-user-star-line',
  wing: 'ri-git-branch-line',
  section: 'ri-organization-chart',
  sub_section_1: 'ri-node-tree',
  sub_section_2: 'ri-stack-line',
}

const PARENT_LEVEL: Partial<Record<OrgLevel, OrgLevel>> = {
  wing: 'head',
  section: 'wing',
  sub_section_1: 'section',
  sub_section_2: 'sub_section_1',
}

const PLACEHOLDER: Record<OrgLevel, string> = {
  head: 'Select Executive Director…',
  wing: 'Select Director General…',
  section: 'Select Director (section)…',
  sub_section_1: 'Select Deputy Director (DD)…',
  sub_section_2: 'Select AD unit (post) under this DD…',
}

const SIDEBAR_PLACEHOLDER: Record<OrgLevel, string> = {
  head: 'Select Head…',
  wing: 'Select wing…',
  section: 'Select section…',
  sub_section_1: 'Select Section 1 (DD)…',
  sub_section_2: 'Select Section 2 (AD)…',
}

/** Sidebar-aligned labels for Director / AD employee placement. */
function formLevelLabel(level: OrgLevel, roleLevelId?: string): string {
  if (roleLevelId === 'role-4' || roleLevelId === 'role-6') {
    return ORG_LEVEL_SIDEBAR_LABELS[level]
  }
  return ORG_LEVEL_LABELS[level]
}

function formLevelPlaceholder(level: OrgLevel, roleLevelId?: string): string {
  if (roleLevelId === 'role-4' || roleLevelId === 'role-6') {
    return SIDEBAR_PLACEHOLDER[level]
  }
  return PLACEHOLDER[level]
}

function levelKey(level: OrgLevel): keyof EmployeeOrgPlacement {
  const map: Record<OrgLevel, keyof EmployeeOrgPlacement> = {
    head: 'orgHeadId',
    wing: 'orgWingId',
    section: 'orgSectionId',
    sub_section_1: 'orgSubSection1Id',
    sub_section_2: 'orgSubSection2Id',
  }
  return map[level]
}

function levelValue(placement: EmployeeOrgPlacement, level: OrgLevel): string {
  const key = levelKey(level)
  if (key === 'orgSubSection1Id' || key === 'orgSubSection2Id') {
    return placement[key] ?? ''
  }
  return (placement[key] as string) ?? ''
}

function formatOptionLabel(node: NavttcOrgNode): string {
  const wing = getOrgAncestorAtLevel(node, 'wing')
  if (node.level === 'section' && wing) return `${node.name} · ${wing.name}`
  if (node.level === 'sub_section_1') {
    const section = getOrgNode(node.parentId ?? '')
    return section ? `${node.name} · ${section.name}` : node.name
  }
  if (node.level === 'sub_section_2') {
    const ss1 = getOrgNode(node.parentId ?? '')
    return ss1 ? `${node.name} · ${ss1.name}` : node.name
  }
  return node.code ? `${node.name} (${node.code})` : node.name
}

function formatAnchorPostLabel(node: NavttcOrgNode): string {
  const path = [
    getOrgAncestorAtLevel(node, 'wing')?.name,
    getOrgAncestorAtLevel(node, 'section')?.name,
    node.level === 'sub_section_2' ? getOrgNode(node.parentId ?? '')?.name : undefined,
  ]
    .filter(Boolean)
    .join(' › ')
  return path ? `${node.name} · ${path}` : formatOptionLabel(node)
}

function filterNodesByMappedWing(
  nodes: NavttcOrgNode[],
  legacyCentreId: string,
): NavttcOrgNode[] {
  const wingId = wingIdForLegacyDepartment(legacyCentreId)
  if (!wingId) return nodes
  return nodes.filter((n) => nodeIsUnderWing(n, wingId))
}

function parentIdForLevel(placement: EmployeeOrgPlacement, level: OrgLevel): string | null {
  const parentLevel = PARENT_LEVEL[level]
  if (!parentLevel) return null
  const id = levelValue(placement, parentLevel)
  return id || null
}

function optionsForLevel(
  placement: EmployeeOrgPlacement,
  level: OrgLevel,
  roleLevelId?: string,
): NavttcOrgNode[] {
  const filterRole = organogramFilterRoleForLevel(level, roleLevelId) ?? roleLevelId
  if (level === 'head') {
    return filterOrganogramNodesForRole(getOrgChildren(null, 'head'), filterRole)
  }
  const parentId = parentIdForLevel(placement, level)
  if (!parentId) return []
  let options = filterOrganogramNodesForRole(getOrgChildren(parentId, level), filterRole)
  if (level === 'wing') {
    options = getCanonicalWings(options)
  }
  return options
}

function parentReady(placement: EmployeeOrgPlacement, level: OrgLevel): boolean {
  const parentLevel = PARENT_LEVEL[level]
  if (!parentLevel) return true
  return Boolean(levelValue(placement, parentLevel))
}

export function EmployeeOrgPlacementFields({
  value,
  onChange,
  error,
  roleLevelId,
  legacyCentreId = '',
  onLegacyCentreChange,
}: Props) {
  const nodes = useOrganogramNodes()
  const pathPreview = useMemo(() => formatOrgPlacementPath(value), [value, nodes])
  const roleCfg = roleOrgUiConfig(roleLevelId)
  const entryMode = orgPlacementEntryMode(roleLevelId)
  const anchorLevel = organogramTargetLevel(roleLevelId)

  useEffect(() => {
    if (!roleCfg?.requiredLevels.includes('head')) return
    if (value.orgHeadId) return
    onChange({ ...value, orgHeadId: DEFAULT_ORG_HEAD_ID })
  }, [roleLevelId, roleCfg, value.orgHeadId])

  useEffect(() => {
    if (!onLegacyCentreChange || !value.orgWingId) return
    const mapped = legacyDepartmentIdForWingId(value.orgWingId)
    if (mapped && mapped !== legacyCentreId) onLegacyCentreChange(mapped)
  }, [value.orgWingId, onLegacyCentreChange, legacyCentreId])

  const showLevel = (level: OrgLevel) =>
    roleCfg ? roleCfg.visibleLevels.includes(level) : true

  const requireLevel = (level: OrgLevel) =>
    roleCfg ? roleCfg.requiredLevels.includes(level) : level !== 'sub_section_1' && level !== 'sub_section_2'

  function setLevel(level: OrgLevel, id: string) {
    const idx = LEVEL_ORDER.indexOf(level)
    const next: EmployeeOrgPlacement = { ...value }
    const key = levelKey(level)
    if (key === 'orgHeadId') next.orgHeadId = id || DEFAULT_ORG_HEAD_ID
    else if (key === 'orgWingId') {
      next.orgWingId = id
      if (id && onLegacyCentreChange) {
        const mappedDept = legacyDepartmentIdForWingId(id)
        if (mappedDept) onLegacyCentreChange(mappedDept)
      }
    } else if (key === 'orgSectionId') next.orgSectionId = id
    else if (key === 'orgSubSection1Id') next.orgSubSection1Id = id || undefined
    else if (key === 'orgSubSection2Id') next.orgSubSection2Id = id || undefined

    for (let i = idx + 1; i < LEVEL_ORDER.length; i++) {
      const childKey = levelKey(LEVEL_ORDER[i]!)
      if (childKey === 'orgSubSection1Id' || childKey === 'orgSubSection2Id') {
        delete next[childKey]
      } else {
        ;(next as Record<string, string>)[childKey] = ''
      }
    }
    onChange(next)
  }

  function applyPlacement(next: EmployeeOrgPlacement) {
    if (next.orgWingId && onLegacyCentreChange) {
      const mappedDept = legacyDepartmentIdForWingId(next.orgWingId)
      if (mappedDept) onLegacyCentreChange(mappedDept)
    }
    onChange(next)
  }

  function setAnchorPost(nodeId: string) {
    if (!nodeId) {
      onChange({
        orgHeadId: value.orgHeadId || DEFAULT_ORG_HEAD_ID,
        orgWingId: '',
        orgSectionId: '',
      })
      return
    }
    applyPlacement(placementFromOrgNode(nodeId))
  }

  function setDirectorSection(sectionId: string) {
    if (!sectionId) {
      onChange({
        orgHeadId: value.orgHeadId || DEFAULT_ORG_HEAD_ID,
        orgWingId: '',
        orgSectionId: '',
      })
      return
    }
    const next = placementFromOrgNode(sectionId)
    const dds = filterOrganogramNodesForRole(
      getOrgChildren(sectionId, 'sub_section_1'),
      roleLevelId,
    )
    if (dds.length === 1) next.orgSubSection1Id = dds[0]!.id
    applyPlacement(next)
  }

  function setDdPost(ddId: string) {
    if (!ddId) {
      const next = { ...value }
      delete next.orgSubSection1Id
      onChange(next)
      return
    }
    applyPlacement(placementFromOrgNode(ddId))
  }

  const anchorPostOptions = useMemo(() => {
    if (!anchorLevel) return []
    if (anchorLevel === 'wing') {
      return filterOrganogramNodesForRole(getCanonicalWings(orgNodesAtLevel('wing')), roleLevelId)
    }
    const all = filterOrganogramNodesForRole(orgNodesAtLevel(anchorLevel), roleLevelId)
    return filterNodesByMappedWing(all, value.orgWingId ? '' : legacyCentreId)
  }, [nodes, roleLevelId, anchorLevel, legacyCentreId, value.orgWingId])

  const directorSectionOptions = useMemo(() => {
    const sections = filterOrganogramNodesForRole(
      value.orgWingId
        ? getOrgChildren(value.orgWingId, 'section')
        : orgNodesAtLevel('section').filter((n) => {
            const name = n.name.toLowerCase()
            return /director/.test(name) && !/deputy|assistant/.test(name)
          }),
      'role-4',
    )
    return sections
  }, [nodes, value.orgWingId])

  const ddOptionsUnderSection = useMemo(() => {
    if (!value.orgSectionId) return []
    return filterOrganogramNodesForRole(
      getOrgChildren(value.orgSectionId, 'sub_section_1'),
      roleLevelId,
    )
  }, [value.orgSectionId, nodes, roleLevelId])

  const anchorPostValue = anchorLevel ? levelValue(value, anchorLevel) : ''

  const autoFilledLevels = useMemo(() => {
    if (entryMode === 'cascade') return []
    const targetIdx = anchorLevel ? LEVEL_ORDER.indexOf(anchorLevel) : -1
    return LEVEL_ORDER.filter((level) => {
      if (level === anchorLevel) return false
      if (entryMode === 'section_then_dd' && level === 'sub_section_1') return false
      const idx = LEVEL_ORDER.indexOf(level)
      if (entryMode === 'anchor_post' && targetIdx >= 0 && idx >= targetIdx) return false
      if (entryMode === 'section_then_dd') {
        return level !== 'section' && idx < LEVEL_ORDER.indexOf('section')
      }
      return idx < targetIdx
    }).filter((level) => Boolean(levelValue(value, level)))
  }, [value, entryMode, anchorLevel, nodes])

  const optionsByLevel = useMemo(
    () =>
      Object.fromEntries(
        LEVEL_ORDER.map((level) => [level, optionsForLevel(value, level, roleLevelId)]),
      ) as Record<OrgLevel, NavttcOrgNode[]>,
    [value, nodes, roleLevelId],
  )

  function renderLevelField(level: OrgLevel) {
    if (!showLevel(level)) return null

    const options = optionsByLevel[level]
    const ready = parentReady(value, level)
    const required = requireLevel(level)
    const optional = showLevel(level) && !required
    const current = levelValue(value, level)
    const disabled = level !== 'head' && !ready

    let hint: string | undefined
    if (!ready && level !== 'head') {
      hint = `Select ${formLevelLabel(PARENT_LEVEL[level]!, roleLevelId)} first`
    } else if (ready && options.length === 0) {
      hint = 'No units defined in organogram for this branch yet'
    }

    return (
      <CompactFormField
        key={level}
        label={
          <>
            {formLevelLabel(level, roleLevelId)} {required ? <CompactFormRequired /> : null}
          </>
        }
        hint={hint}
      >
        <CompactFormInputWrap icon={LEVEL_ICONS[level]}>
          <select
            value={current}
            onChange={(e) => setLevel(level, e.target.value)}
            required={required}
            disabled={disabled}
          >
            <option value="">{formLevelPlaceholder(level, roleLevelId)}</option>
            {options.map((n) => (
              <option key={n.id} value={n.id}>
                {formatOptionLabel(n)}
              </option>
            ))}
          </select>
        </CompactFormInputWrap>
        {optional && ready && options.length === 0 ? (
          <span className="text-sm" style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
            No {formLevelLabel(level, roleLevelId).toLowerCase()} listed — leave blank if not applicable.
          </span>
        ) : null}
      </CompactFormField>
    )
  }

  return (
    <div className="hrms-org-placement">
      {pathPreview ? (
        <p className="hrms-org-placement__path" aria-live="polite">
          <i className="ri-route-line" aria-hidden />
          {pathPreview}
        </p>
      ) : null}

      {error ? (
        <p className="hrms-org-placement__error" role="alert">
          {error}
        </p>
      ) : null}

      {entryMode === 'anchor_post' && anchorLevel ? (
        <CompactFormGrid>
          <CompactFormField
            full
            label={
              <>
                {formLevelLabel(anchorLevel, roleLevelId)} <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon={LEVEL_ICONS[anchorLevel]}>
              <select
                value={anchorPostValue}
                onChange={(e) => setAnchorPost(e.target.value)}
                required
              >
                <option value="">{formLevelPlaceholder(anchorLevel, roleLevelId)}</option>
                {anchorPostOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {formatAnchorPostLabel(n)}
                  </option>
                ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        </CompactFormGrid>
      ) : null}

      {entryMode === 'section_then_dd' ? (
        <CompactFormGrid>
          <CompactFormField
            full
            label={
              <>
                {formLevelLabel('section', roleLevelId)} <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon={LEVEL_ICONS.section}>
              <select
                value={value.orgSectionId}
                onChange={(e) => setDirectorSection(e.target.value)}
                required
              >
                <option value="">{formLevelPlaceholder('section', roleLevelId)}</option>
                {directorSectionOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {formatOptionLabel(n)}
                  </option>
                ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
          <CompactFormField
            full
            label={
              <>
                {formLevelLabel('sub_section_1', roleLevelId)} <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon={LEVEL_ICONS.sub_section_1}>
              <select
                value={value.orgSubSection1Id ?? ''}
                onChange={(e) => setDdPost(e.target.value)}
                required
                disabled={!value.orgSectionId}
              >
                <option value="">
                  {value.orgSectionId
                    ? formLevelPlaceholder('sub_section_1', roleLevelId)
                    : 'Select section first…'}
                </option>
                {ddOptionsUnderSection.map((n) => (
                  <option key={n.id} value={n.id}>
                    {formatOptionLabel(n)}
                  </option>
                ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        </CompactFormGrid>
      ) : null}

      {autoFilledLevels.length > 0 ? (
        <div className="hrms-org-placement__auto" style={{ marginTop: '0.75rem' }}>
          <p className="text-sm" style={{ color: '#64748b', marginBottom: '0.5rem' }}>
            <i className="ri-lock-line" aria-hidden /> Auto-filled from your selection
          </p>
          <CompactFormGrid>
            {autoFilledLevels.map((level) => {
              const id = levelValue(value, level)
              const node = getOrgNode(id)
              if (!node) return null
              return (
                <CompactFormField key={level} label={formLevelLabel(level, roleLevelId)}>
                  <CompactFormInputWrap icon={LEVEL_ICONS[level]}>
                    <input type="text" readOnly value={node.name} tabIndex={-1} />
                  </CompactFormInputWrap>
                </CompactFormField>
              )
            })}
          </CompactFormGrid>
        </div>
      ) : null}

      {entryMode === 'cascade' ? (
        <CompactFormGrid>
          {LEVEL_ORDER.map((level) => renderLevelField(level))}
        </CompactFormGrid>
      ) : null}
    </div>
  )
}

export function placementFromEmployee(emp: {
  orgHeadId?: string
  orgWingId?: string
  orgSectionId?: string
  orgSubSection1Id?: string
  orgSubSection2Id?: string
}): EmployeeOrgPlacement {
  return {
    orgHeadId: emp.orgHeadId ?? DEFAULT_ORG_HEAD_ID,
    orgWingId: emp.orgWingId ?? '',
    orgSectionId: emp.orgSectionId ?? '',
    orgSubSection1Id: emp.orgSubSection1Id,
    orgSubSection2Id: emp.orgSubSection2Id,
  }
}

export function validateOrgPlacement(
  placement: EmployeeOrgPlacement,
  roleLevelId?: string,
): string | null {
  const roleMsg = validateOrgPlacementForRole(placement, roleLevelId)
  if (roleMsg) return roleMsg
  if (roleLevelId) return null

  if (!placement.orgHeadId) return 'Select the organizational head.'
  if (!placement.orgWingId) return 'Select a wing.'
  if (!placement.orgSectionId) return 'Select a section under the selected wing.'
  return null
}
