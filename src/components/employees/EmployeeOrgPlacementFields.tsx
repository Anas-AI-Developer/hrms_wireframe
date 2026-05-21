import { useMemo } from 'react'
import {
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormRequired,
} from '../hrms/HrmsCompactForm'
import { roleOrgUiConfig, validateOrgPlacementForRole } from '../../data/roleOrgPlacement'
import {
  DEFAULT_ORG_HEAD_ID,
  formatOrgPlacementPath,
  getOrgAncestorAtLevel,
  getOrgChildren,
  getOrgNode,
  ORG_LEVEL_LABELS,
  type EmployeeOrgPlacement,
  type NavttcOrgNode,
  type OrgLevel,
} from '../../data/navttcHqOrganogram'

type Props = {
  value: EmployeeOrgPlacement
  onChange: (next: EmployeeOrgPlacement) => void
  error?: string | null
  roleLevelId?: string
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
  head: 'Select head…',
  wing: 'Select Director General…',
  section: 'Select directorate (Section)…',
  sub_section_1: 'Select Section 1 (DD)…',
  sub_section_2: 'Select Section 2 (AD)…',
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

function parentIdForLevel(placement: EmployeeOrgPlacement, level: OrgLevel): string | null {
  const parentLevel = PARENT_LEVEL[level]
  if (!parentLevel) return null
  const id = levelValue(placement, parentLevel)
  return id || null
}

function optionsForLevel(placement: EmployeeOrgPlacement, level: OrgLevel): NavttcOrgNode[] {
  if (level === 'head') return getOrgChildren(null, 'head')
  const parentId = parentIdForLevel(placement, level)
  if (!parentId) return []
  return getOrgChildren(parentId, level)
}

function parentReady(placement: EmployeeOrgPlacement, level: OrgLevel): boolean {
  const parentLevel = PARENT_LEVEL[level]
  if (!parentLevel) return true
  return Boolean(levelValue(placement, parentLevel))
}

export function EmployeeOrgPlacementFields({ value, onChange, error, roleLevelId }: Props) {
  const pathPreview = useMemo(() => formatOrgPlacementPath(value), [value])
  const roleCfg = roleOrgUiConfig(roleLevelId)

  const showLevel = (level: OrgLevel) =>
    roleCfg ? roleCfg.visibleLevels.includes(level) : true

  const requireLevel = (level: OrgLevel) =>
    roleCfg ? roleCfg.requiredLevels.includes(level) : level !== 'sub_section_1' && level !== 'sub_section_2'

  function setLevel(level: OrgLevel, id: string) {
    const idx = LEVEL_ORDER.indexOf(level)
    const next: EmployeeOrgPlacement = { ...value }
    const key = levelKey(level)
    if (key === 'orgHeadId') next.orgHeadId = id || DEFAULT_ORG_HEAD_ID
    else if (key === 'orgWingId') next.orgWingId = id
    else if (key === 'orgSectionId') next.orgSectionId = id
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

  const optionsByLevel = useMemo(
    () =>
      Object.fromEntries(
        LEVEL_ORDER.map((level) => [level, optionsForLevel(value, level)]),
      ) as Record<OrgLevel, NavttcOrgNode[]>,
    [value],
  )

  function renderLevelField(level: OrgLevel) {
    if (!showLevel(level)) return null

    const options = optionsByLevel[level]
    const ready = parentReady(value, level)
    const required = requireLevel(level)
    const optional = showLevel(level) && !required
    const current = levelValue(value, level)
    const disabled = level !== 'head' && !ready

    let hint = ''
    if (level === 'wing') hint = 'P&D · A&F · A&C · S&C'
    else if (level === 'section') hint = 'Directorates under the selected wing'
    else if (level === 'sub_section_1') hint = 'Deputy Director (DD) units'
    else if (level === 'sub_section_2') hint = 'Assistant Director (AD) units under DD'
    else hint = 'NAVTTC Headquarters'

    if (!ready && level !== 'head') {
      hint = `Select ${ORG_LEVEL_LABELS[PARENT_LEVEL[level]!]} first`
    } else if (ready && options.length === 0) {
      hint = 'No units defined in organogram for this branch yet'
    }

    return (
      <CompactFormField
        key={level}
        label={
          <>
            {ORG_LEVEL_LABELS[level]} {required ? <CompactFormRequired /> : null}
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
            <option value="">{PLACEHOLDER[level]}</option>
            {options.map((n) => (
              <option key={n.id} value={n.id}>
                {formatOptionLabel(n)}
              </option>
            ))}
          </select>
        </CompactFormInputWrap>
        {optional && ready && options.length === 0 ? (
          <span className="text-sm" style={{ color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
            No {ORG_LEVEL_LABELS[level].toLowerCase()} listed — leave blank if not applicable.
          </span>
        ) : null}
      </CompactFormField>
    )
  }

  return (
    <div className="hrms-org-placement">
      {roleCfg?.formHint ? (
        <p className="wf-note" style={{ marginBottom: '0.75rem' }}>
          {roleCfg.formHint}
        </p>
      ) : null}

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

      <CompactFormGrid>{LEVEL_ORDER.map((level) => renderLevelField(level))}</CompactFormGrid>
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
  if (!placement.orgWingId) return 'Select a Director General.'
  if (!placement.orgSectionId) return 'Select a section under the Director General.'
  return null
}
