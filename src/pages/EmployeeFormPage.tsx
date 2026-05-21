import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { EmployeeOfficeFields } from '../components/employees/EmployeeOfficeFields'
import {
  EmployeeOrgPlacementFields,
  placementFromEmployee,
  validateOrgPlacement,
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
  NAVTTC_HEAD_OFFICE_ID,
  officePlacementFromEmployee,
  validateOfficePlacement,
} from '../data/navttcOfficeMapping'
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
      : { category: 'head_office' as const, officeId: NAVTTC_HEAD_OFFICE_ID },
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

  const isHeadOffice = officePlacement.category === 'head_office'

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
    if (!orgPlacement.orgWingId || !orgPlacement.orgSectionId) return ''
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

  function onOfficePlacementChange(
    next: typeof officePlacement,
  ) {
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
    if (isHeadOffice) {
      const orgValidation = validateOrgPlacement(orgPlacement)
      if (orgValidation) {
        setOrgError(orgValidation)
        setError(null)
        return
      }
    } else if (!regionalCentreId) {
      setError('Select a centre / unit under the regional office.')
      return
    }
    if (resolvedDurationMonths == null || !isValidPresetDurationMonths(resolvedDurationMonths)) {
      setError('Select an appointment duration (e.g. 12 months, 1 year, 2 years).')
      return
    }
    if (!roleLevelId) {
      setError('Select a role level (1–7) from the NAVTTC designation hierarchy.')
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
      officeId: officePlacement.officeId,
      orgHeadId: isHeadOffice ? orgPlacement.orgHeadId : undefined,
      orgWingId: isHeadOffice ? orgPlacement.orgWingId : undefined,
      orgSectionId: isHeadOffice ? orgPlacement.orgSectionId : undefined,
      orgSubSection1Id: isHeadOffice ? orgPlacement.orgSubSection1Id : undefined,
      orgSubSection2Id: isHeadOffice ? orgPlacement.orgSubSection2Id : undefined,
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
    : `New code ${nextCode}. Placement follows NAVTTC HQ organogram (2026).`

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

            <CompactFormSection legend="Office location">
              <EmployeeOfficeFields
                value={officePlacement}
                onChange={onOfficePlacementChange}
                error={officeError}
              />
              {!isHeadOffice && officePlacement.officeId ? (
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

            {isHeadOffice ? (
              <CompactFormSection legend="Organization (NAVTTC HQ organogram)">
                <EmployeeOrgPlacementFields
                  value={orgPlacement}
                  onChange={setOrgPlacement}
                  error={orgError}
                />
              </CompactFormSection>
            ) : null}

            <CompactFormSection legend="Post & reporting">
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

                <CompactFormField
                  full
                  label={
                    <>
                      Role level (1–7) <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-vip-crown-line">
                    <select
                      value={roleLevelId}
                      onChange={(e) => {
                        setRoleLevelId(e.target.value)
                        setDesignationId('')
                      }}
                      required
                    >
                      <option value="">Select role…</option>
                      {NAVTTC_ROLE_LEVELS.map((role) => (
                        <option key={role.id} value={role.id}>
                          {formatRoleLevelLabel(role)} — {role.levelCategory}
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
                        ? `BPS ${selectedRole.bps} only — same unit first, then other centres in this office`
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
