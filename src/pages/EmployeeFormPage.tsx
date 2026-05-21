import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { EmployeeOfficeFields } from '../components/employees/EmployeeOfficeFields'
import {
  EmployeeOrgPlacementFields,
  placementFromEmployee,
} from '../components/employees/EmployeeOrgPlacementFields'
import { Link, useNavigate, useParams } from 'react-router-dom'
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
import { EMPLOYMENT_TYPES_FILTERABLE } from '../data/employmentTypes'
import {
  APPOINTMENT_DURATION_PRESETS,
  formatDurationMonths,
  initialDurationMonthsValue,
  isValidPresetDurationMonths,
} from '../utils/serviceDuration'
import { employmentTypeLabel } from '../data/employmentStats'
import {
  DEFAULT_ORG_HEAD_ID,
  legacyDepartmentIdForPlacement,
} from '../data/navttcHqOrganogram'
import {
  orgPlacementForRoleChange,
  roleOrgUiConfig,
  validateOrgPlacementForRole,
} from '../data/roleOrgPlacement'
import {
  NAVTTC_HEAD_OFFICE_ID,
  officePlacementFromEmployee,
  validateOfficePlacement,
  type EmployeeOfficePlacement,
} from '../data/navttcOfficeMapping'

const EMPTY_OFFICE_PLACEMENT: EmployeeOfficePlacement = { category: '', officeId: '' }
import { getDepartmentsForOffice, resolveDepartmentOfficeId } from '../data/navttcOffices'
import {
  designationMatchesRoleLevel,
  designationsMatchingRoleLevel,
  formatRoleLevelLabel,
  getRoleLevelById,
  inferRoleLevelId,
  NAVTTC_ROLE_LEVELS,
} from '../data/navttcRoleLevels'
import { useWireframeData } from '../data/WireframeDataContext'
import type { EmploymentType } from '../types/hrms'

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    departments,
    designations,
    employees,
    getEmployee,
    addEmployee,
    updateEmployee,
  } = useWireframeData()
  const existing = id ? getEmployee(id) : undefined
  const isEdit = Boolean(existing)

  const nextCode = useMemo(
    () => `EMP-${String(employees.length + 1).padStart(4, '0')}`,
    [employees.length],
  )

  const [firstName, setFirstName] = useState(existing?.firstName ?? '')
  const [lastName, setLastName] = useState(existing?.lastName ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [phone, setPhone] = useState(existing?.phone && existing.phone !== '—' ? existing.phone : '')
  const [cnic, setCnic] = useState(existing?.cnic ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(existing?.dateOfBirth ?? '')
  const [employeeNo, setEmployeeNo] = useState(existing?.employeeNo ?? nextCode)
  const [officePlacement, setOfficePlacement] = useState(() =>
    existing
      ? officePlacementFromEmployee(existing, departments)
      : EMPTY_OFFICE_PLACEMENT,
  )
  const [regionalCentreId, setRegionalCentreId] = useState(() => {
    if (!existing) return ''
    const placement = officePlacementFromEmployee(existing, departments)
    if (placement.category !== 'regional_office') return ''
    const dept = departments.find((d) => d.id === existing.departmentId)
    if (dept && resolveDepartmentOfficeId(dept) === placement.officeId) return existing.departmentId
    return ''
  })
  const [orgPlacement, setOrgPlacement] = useState(() =>
    existing?.orgWingId
      ? placementFromEmployee(existing)
      : {
          orgHeadId: DEFAULT_ORG_HEAD_ID,
          orgWingId: '',
          orgSectionId: '',
        },
  )
  const [designationId, setDesignationId] = useState(existing?.designationId ?? '')
  const [roleLevelId, setRoleLevelId] = useState(() => {
    if (!existing) return ''
    const des = designations.find((d) => d.id === existing.designationId)
    return inferRoleLevelId(existing, des?.title) ?? ''
  })
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    existing?.employmentType ?? 'regular',
  )
  const [joinDate, setJoinDate] = useState(
    existing?.joinDate && existing.joinDate !== '—' ? existing.joinDate : '',
  )
  const [durationMonths, setDurationMonths] = useState(() =>
    existing ? initialDurationMonthsValue(existing) : '',
  )
  const [error, setError] = useState<string | null>(null)
  const [orgError, setOrgError] = useState<string | null>(null)
  const [officeError, setOfficeError] = useState<string | null>(null)

  const isHeadOffice =
    officePlacement.category === 'head_office' && officePlacement.officeId === NAVTTC_HEAD_OFFICE_ID
  const roleOrgCfg = useMemo(() => roleOrgUiConfig(roleLevelId), [roleLevelId])
  const lockHeadOffice = Boolean(roleOrgCfg?.forceHeadOffice)
  const showHqOrganogram = Boolean(roleOrgCfg)

  const resolvedDurationMonths = useMemo(() => {
    const n = Number.parseInt(durationMonths, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [durationMonths])

  const regionalCentreOptions = useMemo(
    () =>
      isHeadOffice || !officePlacement.officeId
        ? []
        : getDepartmentsForOffice(officePlacement.officeId, departments),
    [isHeadOffice, officePlacement.officeId, departments],
  )

  const resolvedDepartmentId = useMemo(() => {
    if (!isHeadOffice) return regionalCentreId
    if (!orgPlacement.orgWingId) return 'c1'
    return legacyDepartmentIdForPlacement({
      orgHeadId: orgPlacement.orgHeadId,
      orgWingId: orgPlacement.orgWingId,
      orgSectionId: orgPlacement.orgSectionId,
    })
  }, [isHeadOffice, regionalCentreId, orgPlacement])

  const selectedRole = getRoleLevelById(roleLevelId)

  const designationOptions = useMemo(() => {
    if (!roleLevelId) return []
    return designationsMatchingRoleLevel(roleLevelId, designations, {
      departmentId: resolvedDepartmentId || undefined,
      officeId: officePlacement.officeId,
      departments,
    })
  }, [designations, resolvedDepartmentId, roleLevelId, officePlacement.officeId, departments])

  useEffect(() => {
    if (!designationId || !roleLevelId) return
    const des = designations.find((d) => d.id === designationId)
    if (!designationMatchesRoleLevel(des, roleLevelId)) {
      setDesignationId('')
    }
  }, [designationId, roleLevelId, designations])

  function onOrgPlacementChange(next: typeof orgPlacement) {
    setOrgPlacement(next)
    setOrgError(null)
    setDesignationId('')
  }

  function onRoleLevelChange(nextRoleId: string) {
    setRoleLevelId(nextRoleId)
    setDesignationId('')
    if (!nextRoleId) {
      setOfficePlacement(EMPTY_OFFICE_PLACEMENT)
      setRegionalCentreId('')
      setOrgPlacement({
        orgHeadId: DEFAULT_ORG_HEAD_ID,
        orgWingId: '',
        orgSectionId: '',
      })
      setOfficeError(null)
      setOrgError(null)
      return
    }
    const cfg = roleOrgUiConfig(nextRoleId)
    if (cfg?.forceHeadOffice) {
      setOfficePlacement({ category: 'head_office', officeId: NAVTTC_HEAD_OFFICE_ID })
      setRegionalCentreId('')
      setOfficeError(null)
    }
    if (cfg) {
      setOrgPlacement(orgPlacementForRoleChange(nextRoleId, orgPlacement))
      setOrgError(null)
    }
  }

  function onOfficePlacementChange(next: typeof officePlacement) {
    if (lockHeadOffice) return
    setOfficePlacement(next)
    setOfficeError(null)
    if (next.category === 'head_office') {
      setRegionalCentreId('')
    } else if (next.officeId !== officePlacement.officeId) {
      setRegionalCentreId('')
      setDesignationId('')
    }
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    setOrgError(null)
    setOfficeError(null)
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.')
      return
    }
    if (!phone.trim()) {
      setError('Phone number is required.')
      return
    }
    if (!cnic.trim()) {
      setError('CNIC is required.')
      return
    }
    if (!dateOfBirth) {
      setError('Date of birth is required.')
      return
    }
    const officeValidation = validateOfficePlacement(officePlacement)
    if (officeValidation) {
      setOfficeError(officeValidation)
      setError(null)
      return
    }
    if (showHqOrganogram) {
      const orgValidation = validateOrgPlacementForRole(orgPlacement, roleLevelId)
      if (orgValidation) {
        setOrgError(orgValidation)
        setError(null)
        return
      }
    } else if (officePlacement.category === 'regional_office' && !regionalCentreId) {
      setError('Select a centre / unit under the regional office.')
      return
    }
    if (resolvedDurationMonths == null || !isValidPresetDurationMonths(resolvedDurationMonths)) {
      setError('Select an appointment duration (e.g. 12 months, 1 year, 2 years).')
      return
    }
    if (!roleLevelId) {
      setError('Select a role from the NAVTTC hierarchy.')
      return
    }
    if (designationOptions.length > 0 && !designationId) {
      setError('Select a designation / post at the same BPS as the role level.')
      return
    }
    if (designationId) {
      const des = designations.find((d) => d.id === designationId)
      if (!designationMatchesRoleLevel(des, roleLevelId)) {
        setError(
          `Designation must be at BPS ${selectedRole?.bps ?? '—'} to match the selected role level.`,
        )
        return
      }
    }
    setError(null)

    const input = {
      employeeNo: isEdit ? employeeNo : nextCode,
      firstName,
      lastName,
      email,
      phone,
      cnic,
      dateOfBirth,
      departmentId: resolvedDepartmentId,
      officeId: officePlacement.officeId || undefined,
      orgHeadId: showHqOrganogram ? orgPlacement.orgHeadId : undefined,
      orgWingId: showHqOrganogram ? orgPlacement.orgWingId || undefined : undefined,
      orgSectionId: showHqOrganogram ? orgPlacement.orgSectionId || undefined : undefined,
      orgSubSection1Id: showHqOrganogram ? orgPlacement.orgSubSection1Id : undefined,
      orgSubSection2Id: showHqOrganogram ? orgPlacement.orgSubSection2Id : undefined,
      designationId,
      roleLevelId,
      employmentType,
      status: existing?.status ?? 'active',
      joinDate: joinDate || '—',
      serviceDurationMonths: resolvedDurationMonths,
    }
    if (isEdit && id) {
      updateEmployee(id, input)
      navigate(`/employees/${id}`)
      return
    }
    const created = addEmployee(input)
    navigate(`/employees/${created.id}`)
  }

  const heading = isEdit ? 'Edit employee' : 'Create employee'
  const sub = isEdit
    ? 'Update roster details. Changes are saved for this browser session.'
    : `New code ${nextCode}. Select role first — HQ organogram (2026) steps follow automatically.`

  return (
    <HrmsListShell
      current={isEdit ? `Edit · ${existing?.employeeNo}` : 'New employee'}
      dashboardHref="/employees"
    >
      <CompactFormPage wide>
        <CompactFormCard icon="ri-user-add-line" title={heading} description={sub}>
          <form onSubmit={onSubmit}>
            {error ? <CompactFormAlert>{error}</CompactFormAlert> : null}

            <CompactFormSection legend="Personal details">
              <CompactFormGrid>
                <CompactFormGrid split>
                  <CompactFormField
                    label={
                      <>
                        First name <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-user-line">
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        autoFocus
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField
                    label={
                      <>
                        Last name <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-user-line">
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Email <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-mail-line">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormGrid split>
                  <CompactFormField
                    label={
                      <>
                        Phone <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-phone-line">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="03xx-xxxxxxx"
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField
                    label={
                      <>
                        CNIC <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-id-card-line">
                      <input
                        value={cnic}
                        onChange={(e) => setCnic(e.target.value)}
                        placeholder="xxxxx-xxxxxxx-x"
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormField
                  label={
                    <>
                      Date of birth <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-cake-2-line">
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormSection legend="Role (NAVTTC hierarchy)">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Role <CompactFormRequired />
                    </>
                  }
                  hint="Choose first — Head Office and organogram steps depend on this role"
                >
                  <CompactFormInputWrap icon="ri-vip-crown-line">
                    <select
                      value={roleLevelId}
                      onChange={(e) => onRoleLevelChange(e.target.value)}
                      required
                    >
                      <option value="">Select role…</option>
                      {NAVTTC_ROLE_LEVELS.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.id === 'role-8'
                            ? formatRoleLevelLabel(role)
                            : `${formatRoleLevelLabel(role)} — ${role.levelCategory}`}
                        </option>
                      ))}
                    </select>
                  </CompactFormInputWrap>
                </CompactFormField>

                {selectedRole ? (
                  <CompactFormField full label="BPS scale">
                    <CompactFormInputWrap icon="ri-bar-chart-horizontal-line">
                      <input readOnly value={`BPS ${selectedRole.bps}`} aria-readonly="true" />
                    </CompactFormInputWrap>
                  </CompactFormField>
                ) : null}
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormSection legend="Office location">
              <EmployeeOfficeFields
                value={officePlacement}
                onChange={onOfficePlacementChange}
                error={officeError}
                lockHeadOffice={lockHeadOffice}
                disabledUntilRole={!isEdit}
              />
              {lockHeadOffice ? (
                <p className="wf-note" style={{ marginTop: '0.5rem' }}>
                  Head Office is set automatically for the selected HQ role (Organogram 2026).
                </p>
              ) : !roleLevelId ? (
                <p className="wf-note" style={{ marginTop: '0.5rem' }}>
                  Select a role above first — headquarters roles will set Head Office automatically.
                </p>
              ) : null}
              {!isHeadOffice && officePlacement.category === 'regional_office' && officePlacement.officeId ? (
                <CompactFormGrid>
                  <CompactFormField
                    full
                    label={
                      <>
                        Centre / unit <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-building-line">
                      <select
                        value={regionalCentreId}
                        onChange={(e) => {
                          setRegionalCentreId(e.target.value)
                          setDesignationId('')
                        }}
                        required
                      >
                        <option value="">Select centre…</option>
                        {regionalCentreOptions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
              ) : null}
            </CompactFormSection>

            {showHqOrganogram && selectedRole ? (
              <CompactFormSection
                legend={`Organization — ${selectedRole.title}`}
              >
                <EmployeeOrgPlacementFields
                  value={orgPlacement}
                  onChange={onOrgPlacementChange}
                  error={orgError}
                  roleLevelId={roleLevelId}
                />
              </CompactFormSection>
            ) : roleLevelId ? (
              <p className="wf-note">
                Select a headquarters role to place this employee on the NAVTTC organogram, or use a
                regional office without HQ placement.
              </p>
            ) : null}

            <CompactFormSection legend="Post & appointment">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label="Employment type"
                >
                  <CompactFormInputWrap icon="ri-file-list-3-line">
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    >
                      {EMPLOYMENT_TYPES_FILTERABLE.map((t) => (
                        <option key={t} value={t}>
                          {employmentTypeLabel(t)}
                        </option>
                      ))}
                    </select>
                  </CompactFormInputWrap>
                </CompactFormField>

                {roleLevelId ? (
                  <CompactFormField
                    full
                    label={
                      <>
                        Designation / post <CompactFormRequired />
                      </>
                    }
                    hint={
                      selectedRole
                        ? `BPS ${selectedRole.bps} — filtered by wing/section you selected above`
                        : undefined
                    }
                  >
                    <CompactFormInputWrap icon="ri-briefcase-line">
                      <select
                        value={designationId}
                        onChange={(e) => setDesignationId(e.target.value)}
                        required={designationOptions.length > 0}
                      >
                        <option value="">
                          {designationOptions.length > 0
                            ? '— Select designation —'
                            : `— No BPS ${selectedRole?.bps} designations in catalog —`}
                        </option>
                        {designationOptions.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title} ({g.grade})
                          </option>
                        ))}
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                ) : null}
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormSection legend="Record">
              <CompactFormGrid split>
                  <CompactFormField label="Employee code">
                    <CompactFormInputWrap icon="ri-barcode-line">
                      <input
                        value={isEdit ? employeeNo : nextCode}
                        readOnly={!isEdit}
                        onChange={(e) => setEmployeeNo(e.target.value)}
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Join date">
                    <CompactFormInputWrap icon="ri-calendar-line">
                      <input
                        type="date"
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField
                    label={
                      <>
                        Duration <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-hourglass-line">
                      <select
                        value={durationMonths}
                        onChange={(e) => setDurationMonths(e.target.value)}
                        required
                      >
                        <option value="">Select duration…</option>
                        {APPOINTMENT_DURATION_PRESETS.map((opt) => (
                          <option key={opt.months} value={opt.months}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                  {resolvedDurationMonths != null ? (
                    <CompactFormField label="Appointment ends">
                      <CompactFormInputWrap icon="ri-calendar-check-line">
                        <input
                          readOnly
                          value={
                            joinDate
                              ? `${formatDurationMonths(resolvedDurationMonths)} from join date`
                              : formatDurationMonths(resolvedDurationMonths)
                          }
                          aria-readonly="true"
                        />
                      </CompactFormInputWrap>
                    </CompactFormField>
                  ) : null}
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormFooter>
              <Link
                to={existing ? `/employees/${existing.id}` : '/employees'}
                className="hrms-ref-btn-secondary"
              >
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                <i className={isEdit ? 'ri-save-line' : 'ri-add-line'} aria-hidden />
                {isEdit ? 'Save changes' : 'Create employee'}
              </button>
            </CompactFormFooter>
          </form>
        </CompactFormCard>
      </CompactFormPage>
    </HrmsListShell>
  )
}
