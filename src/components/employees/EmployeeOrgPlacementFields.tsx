import { useMemo } from 'react'
import {
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormRequired,
} from '../hrms/HrmsCompactForm'
import {
  DEFAULT_ORG_HEAD_ID,
  formatOrgPlacementPath,
  getOrgChildren,
  getOrgNode,
  ORG_LEVEL_LABELS,
  type EmployeeOrgPlacement,
  type OrgLevel,
} from '../../data/navttcHqOrganogram'

type Props = {
  value: EmployeeOrgPlacement
  onChange: (next: EmployeeOrgPlacement) => void
  error?: string | null
}

const LEVEL_ORDER: OrgLevel[] = ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2']

const LEVEL_ICONS: Record<OrgLevel, string> = {
  head: 'ri-user-star-line',
  wing: 'ri-git-branch-line',
  section: 'ri-organization-chart',
  sub_section_1: 'ri-node-tree',
  sub_section_2: 'ri-stack-line',
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

export function EmployeeOrgPlacementFields({ value, onChange, error }: Props) {
  const pathPreview = useMemo(() => formatOrgPlacementPath(value), [value])

  function setLevel(level: OrgLevel, id: string) {
    const idx = LEVEL_ORDER.indexOf(level)
    const next: EmployeeOrgPlacement = { ...value }
    const key = levelKey(level)
    if (key === 'orgHeadId') next.orgHeadId = id
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

  const headOptions = getOrgChildren(null, 'head')
  const wingParent = value.orgHeadId || DEFAULT_ORG_HEAD_ID
  const wingOptions = getOrgChildren(wingParent, 'wing')
  const sectionOptions = getOrgChildren(value.orgWingId || null, 'section')
  const ss1Options = getOrgChildren(value.orgSectionId || null, 'sub_section_1')
  const ss2Options = value.orgSubSection1Id
    ? getOrgChildren(value.orgSubSection1Id, 'sub_section_2')
    : []

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

      <CompactFormGrid>
        <CompactFormField
          label={
            <>
              {ORG_LEVEL_LABELS.head} <CompactFormRequired />
            </>
          }
          hint="Top leadership — NAVTTC HQs"
        >
          <CompactFormInputWrap icon={LEVEL_ICONS.head}>
            <select
              value={value.orgHeadId || DEFAULT_ORG_HEAD_ID}
              onChange={(e) => setLevel('head', e.target.value)}
              required
            >
              {headOptions.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.code ? `${n.name} (${n.code})` : n.name}
                </option>
              ))}
            </select>
          </CompactFormInputWrap>
        </CompactFormField>

        <CompactFormField
          label={
            <>
              {ORG_LEVEL_LABELS.wing} <CompactFormRequired />
            </>
          }
        >
          <CompactFormInputWrap icon={LEVEL_ICONS.wing}>
            <select
              value={value.orgWingId}
              onChange={(e) => setLevel('wing', e.target.value)}
              required
              disabled={!value.orgHeadId}
            >
              <option value="">Select wing…</option>
              {wingOptions.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.code ? `${n.name} (${n.code})` : n.name}
                </option>
              ))}
            </select>
          </CompactFormInputWrap>
        </CompactFormField>

        {value.orgWingId ? (
          <CompactFormField
            label={
              <>
                {ORG_LEVEL_LABELS.section} <CompactFormRequired />
              </>
            }
            hint="Director-level unit under the selected wing"
          >
            <CompactFormInputWrap icon={LEVEL_ICONS.section}>
              <select
                value={value.orgSectionId}
                onChange={(e) => setLevel('section', e.target.value)}
                required
              >
                <option value="">Select section…</option>
                {sectionOptions.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.code ? `${n.name} (${n.code})` : n.name}
                  </option>
                ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        ) : null}

        {value.orgSectionId && ss1Options.length > 0 ? (
          <CompactFormField
            label={ORG_LEVEL_LABELS.sub_section_1}
            hint="Optional — first sub-unit under the section"
          >
            <CompactFormInputWrap icon={LEVEL_ICONS.sub_section_1}>
              <select
                value={value.orgSubSection1Id ?? ''}
                onChange={(e) => setLevel('sub_section_1', e.target.value)}
              >
                <option value="">— None —</option>
            {ss1Options.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.name} (${n.code})` : n.name}
              </option>
            ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        ) : null}

        {ss2Options.length > 0 ? (
          <CompactFormField
            label={ORG_LEVEL_LABELS.sub_section_2}
            hint="Optional — Deputy Director / second-tier unit"
          >
            <CompactFormInputWrap icon={LEVEL_ICONS.sub_section_2}>
              <select
                value={value.orgSubSection2Id ?? ''}
                onChange={(e) => setLevel('sub_section_2', e.target.value)}
              >
                <option value="">— None —</option>
            {ss2Options.map((n) => (
              <option key={n.id} value={n.id}>
                {n.code ? `${n.name} (${n.code})` : n.name}
              </option>
            ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        ) : null}
      </CompactFormGrid>
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

export function validateOrgPlacement(placement: EmployeeOrgPlacement): string | null {
  if (!placement.orgHeadId) return 'Select the organizational head.'
  if (!placement.orgWingId) return 'Select a wing under the head.'
  if (!placement.orgSectionId) return 'Select a section under the wing.'
  if (!getOrgNode(placement.orgWingId)) return 'Invalid wing selection.'
  if (!getOrgNode(placement.orgSectionId)) return 'Invalid section selection.'
  const parentWing = getOrgNode(placement.orgSectionId)?.parentId
  if (parentWing !== placement.orgWingId) return 'Section must belong to the selected wing.'
  return null
}
