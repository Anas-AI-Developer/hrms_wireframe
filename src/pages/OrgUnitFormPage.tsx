import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  CompactFormAlert,
  CompactFormCard,
  CompactFormField,
  CompactFormFooter,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormPage,
  CompactFormRequired,
  CompactFormSection,
} from '../components/hrms/HrmsCompactForm'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import {
  addOrgNode,
  canCreateAtLevel,
  getOrgChildrenFromStore,
  getOrgNodeFromStore,
  updateOrgNode,
  type OrgNodeInput,
} from '../data/organogramStore'
import {
  ORG_STRUCTURE_ROUTES,
  getOrgAncestorAtLevel,
  type OrgStructureRouteKey,
} from '../data/navttcHqOrganogram'
import { ORG_LEVEL_LABELS, type OrgLevel } from '../data/navttcOrgTypes'
import { useWireframeData } from '../data/WireframeDataContext'
import { useOrganogramNodes } from '../hooks/useOrganogramNodes'

function isOrgStructureRouteKey(key: string | undefined): key is OrgStructureRouteKey {
  return key != null && key in ORG_STRUCTURE_ROUTES
}

const AUTO_CODE_LEVELS: OrgLevel[] = ['section', 'sub_section_1', 'sub_section_2']

function usesAutoCode(level: OrgLevel): boolean {
  return AUTO_CODE_LEVELS.includes(level)
}

function slugifyCodePart(text: string): string {
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

/** Build unit code from immediate parent's code (WING-* → SEC-*, SEC-* → SS1-*, SS1-* → SS2-*). */
function deriveOrgUnitCode(
  level: OrgLevel,
  parents: {
    wing?: { code?: string }
    section?: { code?: string }
    section1?: { code?: string }
  },
  name: string,
): string {
  let parentCode: string | undefined
  if (level === 'section') parentCode = parents.wing?.code
  else if (level === 'sub_section_1') parentCode = parents.section?.code
  else if (level === 'sub_section_2') parentCode = parents.section1?.code
  if (!parentCode?.trim()) return ''

  const slug = name.trim() ? slugifyCodePart(name) : ''
  const suffix = slug ? `-${slug}` : ''

  if (level === 'section') {
    const base = parentCode.replace(/^WING-/i, 'SEC-')
    return `${base}${suffix}`
  }
  if (level === 'sub_section_1') {
    const secSuffix = parentCode.replace(/^SEC-/i, '')
    const base = `SS1-DD-${secSuffix}`
    return `${base}${suffix}`
  }
  if (level === 'sub_section_2') {
    const ss1Suffix = parentCode.replace(/^SS1(-DD)?-/i, '')
    const base = `SS2-AD-${ss1Suffix}`
    return `${base}${suffix}`
  }
  return parentCode
}

const CODE_PLACEHOLDER: Partial<Record<OrgLevel, string>> = {
  section: 'Wing code',
  sub_section_1: 'Section code',
  sub_section_2: 'Section 1 code',
}

/** Read-only code field: parent code when selected; full derived code once name is entered. */
function codeFieldDisplay(
  level: OrgLevel,
  autoCode: string,
  name: string,
  parents: {
    wing?: { code?: string }
    section?: { code?: string }
    section1?: { code?: string }
  },
): string {
  if (name.trim() && autoCode) return autoCode
  if (level === 'section') return parents.wing?.code?.trim() ?? ''
  if (level === 'sub_section_1') return parents.section?.code?.trim() ?? ''
  if (level === 'sub_section_2') return parents.section1?.code?.trim() ?? ''
  return autoCode || ''
}

/** Derive cascade selections from an existing node (edit mode). */
function initialCascadeFromNode(level: OrgLevel, nodeId: string | undefined) {
  const empty = { wingId: '', sectionId: '', section1Id: '' }
  if (!nodeId) return empty
  const node = getOrgNodeFromStore(nodeId)
  if (!node) return empty

  if (level === 'section') {
    return { wingId: node.parentId ?? '', sectionId: '', section1Id: '' }
  }
  if (level === 'sub_section_1') {
    const section = node.parentId ? getOrgNodeFromStore(node.parentId) : undefined
    const wing = section ? getOrgAncestorAtLevel(section, 'wing') : undefined
    return {
      wingId: wing?.id ?? '',
      sectionId: section?.id ?? '',
      section1Id: '',
    }
  }
  if (level === 'sub_section_2') {
    const ss1 = node.parentId ? getOrgNodeFromStore(node.parentId) : undefined
    const section = ss1?.parentId ? getOrgNodeFromStore(ss1.parentId) : undefined
    const wing = section ? getOrgAncestorAtLevel(section, 'wing') : undefined
    return {
      wingId: wing?.id ?? '',
      sectionId: section?.id ?? '',
      section1Id: ss1?.id ?? '',
    }
  }
  return empty
}

export function OrgUnitFormPage() {
  const { levelKey, id } = useParams<{ levelKey: string; id?: string }>()
  useOrganogramNodes()

  if (!isOrgStructureRouteKey(levelKey)) {
    return <Navigate to="/org/wings" replace />
  }

  return <OrgUnitFormBody levelKey={levelKey} id={id} />
}

function OrgUnitFormBody({ levelKey, id }: { levelKey: OrgStructureRouteKey; id?: string }) {
  const navigate = useNavigate()
  const { can } = useAuth()
  const { departments } = useWireframeData()
  const nodes = useOrganogramNodes()

  const config = ORG_STRUCTURE_ROUTES[levelKey]
  const level = config.level
  const isEdit = Boolean(id)
  const existing = id ? getOrgNodeFromStore(id) : undefined
  const redirectTo =
    (isEdit && id && !existing) ||
    (isEdit && existing && existing.level !== level) ||
    (!isEdit && !canCreateAtLevel(level))
      ? `/org/${levelKey}`
      : null

  const headId = useMemo(
    () => getOrgChildrenFromStore(null, 'head')[0]?.id ?? null,
    [nodes],
  )

  const initialCascade = useMemo(
    () => initialCascadeFromNode(level, existing?.id),
    [level, existing?.id, nodes],
  )

  const [name, setName] = useState(existing?.name ?? '')
  const [code, setCode] = useState(existing?.code ?? '')
  const [wingId, setWingId] = useState(initialCascade.wingId)
  const [sectionId, setSectionId] = useState(initialCascade.sectionId)
  const [section1Id, setSection1Id] = useState(initialCascade.section1Id)
  const [legacyDepartmentId, setLegacyDepartmentId] = useState(existing?.legacyDepartmentId ?? '')
  const [error, setError] = useState<string | null>(null)

  const wings = useMemo(
    () => getOrgChildrenFromStore(headId, 'wing'),
    [headId, nodes],
  )

  const sectionsForWing = useMemo(
    () => (wingId ? getOrgChildrenFromStore(wingId, 'section') : []),
    [wingId, nodes],
  )

  const section1ForSection = useMemo(
    () => (sectionId ? getOrgChildrenFromStore(sectionId, 'sub_section_1') : []),
    [sectionId, nodes],
  )

  const selectedWing = useMemo(() => (wingId ? getOrgNodeFromStore(wingId) : undefined), [wingId, nodes])
  const selectedSection = useMemo(
    () => (sectionId ? getOrgNodeFromStore(sectionId) : undefined),
    [sectionId, nodes],
  )
  const selectedSection1 = useMemo(
    () => (section1Id ? getOrgNodeFromStore(section1Id) : undefined),
    [section1Id, nodes],
  )

  const autoCode = useMemo(
    () =>
      usesAutoCode(level)
        ? deriveOrgUnitCode(
            level,
            { wing: selectedWing, section: selectedSection, section1: selectedSection1 },
            name,
          )
        : '',
    [level, selectedWing, selectedSection, selectedSection1, name],
  )

  const codeDisplay = useMemo(
    () =>
      usesAutoCode(level)
        ? codeFieldDisplay(level, autoCode, name, {
            wing: selectedWing,
            section: selectedSection,
            section1: selectedSection1,
          })
        : code,
    [level, autoCode, name, selectedWing, selectedSection, selectedSection1, code],
  )

  useEffect(() => {
    setWingId(initialCascade.wingId)
    setSectionId(initialCascade.sectionId)
    setSection1Id(initialCascade.section1Id)
  }, [initialCascade.wingId, initialCascade.sectionId, initialCascade.section1Id])

  useEffect(() => {
    if (!usesAutoCode(level)) return
    if (autoCode) setCode(autoCode)
  }, [level, autoCode])

  const showWing = level === 'section' || level === 'sub_section_1' || level === 'sub_section_2'
  const showSection = level === 'sub_section_1' || level === 'sub_section_2'
  const showSection1 = level === 'sub_section_2'

  function resolveParentId(): string | null {
    if (level === 'head' || level === 'wing') return headId
    if (level === 'section') return wingId || null
    if (level === 'sub_section_1') return sectionId || null
    if (level === 'sub_section_2') return section1Id || null
    return null
  }

  function onWingChange(nextWingId: string) {
    setWingId(nextWingId)
    setSectionId('')
    setSection1Id('')
  }

  function onSectionChange(nextSectionId: string) {
    setSectionId(nextSectionId)
    setSection1Id('')
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!can('page:departments:write')) {
      setError('You do not have permission to edit the organogram.')
      return
    }

    const parentId = resolveParentId()
    if (level === 'section' && !wingId) {
      setError('Select a Wing.')
      return
    }
    if (level === 'sub_section_1' && (!wingId || !sectionId)) {
      setError('Select Wing and Section.')
      return
    }
    if (level === 'sub_section_2' && (!wingId || !sectionId || !section1Id)) {
      setError('Select Wing, Section, and Section 1 (DD).')
      return
    }

    const finalCode =
      usesAutoCode(level) && autoCode
        ? autoCode
        : code.trim()

    if (!finalCode) {
      setError(
        level === 'section'
          ? 'Select a Wing to generate the code.'
          : level === 'sub_section_1'
            ? 'Select Wing and Section to generate the code.'
            : 'Select Wing, Section, and Section 1 (DD) to generate the code.',
      )
      return
    }

    const input: OrgNodeInput = {
      name,
      code: finalCode,
      parentId,
      legacyDepartmentId: level === 'wing' ? legacyDepartmentId || undefined : undefined,
    }
    if (isEdit && id) {
      const result = updateOrgNode(id, input)
      if (!result) {
        setError('Unit not found.')
        return
      }
      if ('error' in result) {
        setError(result.error)
        return
      }
      navigate(`/org/${levelKey}`)
      return
    }
    const result = addOrgNode(level, input)
    if ('error' in result) {
      setError(result.error)
      return
    }
    navigate(`/org/${levelKey}`)
  }

  const unitLabel = ORG_LEVEL_LABELS[level]
  const heading = isEdit ? `Edit ${unitLabel}` : `Add ${unitLabel}`
  const listPath = `/org/${levelKey}`

  return (
    <HrmsListShell current={heading} dashboardHref={listPath}>
      <CompactFormPage>
        <CompactFormCard icon="ri-node-tree" title={heading}>
          <form onSubmit={onSubmit}>
            {error ? <CompactFormAlert>{error}</CompactFormAlert> : null}

            {showWing || showSection || showSection1 ? (
              <CompactFormSection legend="Organogram placement">
                <CompactFormGrid>
                  {showWing ? (
                    <CompactFormField
                      full
                      label={
                        <>
                          Wing <CompactFormRequired />
                        </>
                      }
                      hint="Choose the parent wing for this unit"
                    >
                      <CompactFormInputWrap icon="ri-git-branch-line">
                        <select
                          value={wingId}
                          onChange={(e) => onWingChange(e.target.value)}
                          required
                        >
                          <option value="">Select wing…</option>
                          {wings.map((w) => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                              {w.code ? ` (${w.code})` : ''}
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                  ) : null}

                  {showSection ? (
                    <CompactFormField
                      full
                      label={
                        <>
                          Section <CompactFormRequired />
                        </>
                      }
                      hint={wingId ? 'Sections under the selected wing' : 'Select a wing first'}
                    >
                      <CompactFormInputWrap icon="ri-organization-chart">
                        <select
                          value={sectionId}
                          onChange={(e) => onSectionChange(e.target.value)}
                          required
                          disabled={!wingId}
                        >
                          <option value="">
                            {wingId ? 'Select section…' : 'Select wing first…'}
                          </option>
                          {sectionsForWing.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                              {s.code ? ` (${s.code})` : ''}
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                  ) : null}

                  {showSection1 ? (
                    <CompactFormField
                      full
                      label={
                        <>
                          Section 1 (DD) <CompactFormRequired />
                        </>
                      }
                      hint={
                        sectionId
                          ? 'Deputy Director unit under the selected section'
                          : 'Select wing and section first'
                      }
                    >
                      <CompactFormInputWrap icon="ri-node-tree">
                        <select
                          value={section1Id}
                          onChange={(e) => setSection1Id(e.target.value)}
                          required
                          disabled={!sectionId}
                        >
                          <option value="">
                            {sectionId ? 'Select Section 1 (DD)…' : 'Select section first…'}
                          </option>
                          {section1ForSection.map((n) => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                              {n.code ? ` (${n.code})` : ''}
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                  ) : null}
                </CompactFormGrid>
              </CompactFormSection>
            ) : null}

            <CompactFormSection legend="Unit details">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Name <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-text">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus={!showWing}
                      placeholder={
                        level === 'wing'
                          ? 'e.g. HQ Wing — Operations'
                          : level === 'head'
                            ? 'e.g. Executive Director'
                            : level === 'sub_section_2'
                              ? 'e.g. Assistant Director (Admin)'
                              : level === 'sub_section_1'
                                ? 'e.g. Deputy Director (Planning)'
                                : 'e.g. Director (Planning)'
                      }
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                {usesAutoCode(level) ? (
                  <CompactFormField
                    full
                    label="Code"
                    hint={
                      level === 'section'
                        ? 'From selected wing (WING-* → SEC-*) plus name suffix when provided'
                        : level === 'sub_section_1'
                          ? 'From selected section (SEC-* → SS1-*) plus name suffix when provided'
                          : 'From selected Section 1 (SS1-* → SS2-*) plus name suffix when provided'
                    }
                  >
                    <CompactFormInputWrap icon="ri-barcode-line">
                      <input
                        value={codeDisplay}
                        readOnly
                        placeholder={CODE_PLACEHOLDER[level] ?? 'Code'}
                        style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                ) : (
                  <CompactFormField
                    full
                    label={
                      <>
                        Code <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-barcode-line">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                        placeholder="e.g. WING-PD"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                )}

                {level === 'wing' ? (
                  <CompactFormField
                    full
                    label="Legacy department (roster)"
                    hint="Links employees / designations to this wing"
                  >
                    <CompactFormInputWrap icon="ri-building-line">
                      <select
                        value={legacyDepartmentId}
                        onChange={(e) => setLegacyDepartmentId(e.target.value)}
                      >
                        <option value="">— Default (HQ) —</option>
                        {departments
                          .filter((d) => d.status === 'active')
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                ) : null}
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormFooter>
              <Link to={listPath} className="hrms-ref-btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary" disabled={!can('page:departments:write')}>
                <i className={isEdit ? 'ri-save-line' : 'ri-add-line'} aria-hidden />
                {isEdit ? 'Save' : 'Create'}
              </button>
            </CompactFormFooter>
          </form>
        </CompactFormCard>
      </CompactFormPage>
    </HrmsListShell>
  )
}
