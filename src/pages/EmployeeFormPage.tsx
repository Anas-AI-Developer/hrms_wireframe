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
  legacyDepartmentIdForWingId,
  placementFromLegacyDepartment,
  wingIdForLegacyDepartment,
} from '../data/navttcOrgMapping'
import {
  isOrganogramPlacementComplete,
  organogramPlacementHint,
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
import { defaultDepartmentIdForOffice } from '../data/navttcOffices'
import {
  designationMatchesRoleLevel,
  designationsMatchingRoleLevel,
  formatRoleLevelLabel,
  getRoleLevelById,
  HQ_HIERARCHY_ROLE_IDS,
  inferRoleLevelId,
  isHqHierarchyRole,
  NAVTTC_ROLE_LEVELS,
  REGIONAL_STAFF_ROLE_ID,
  regionalOfficeDesignations,
  roleLevelIdFromLoginDemoTitle,
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
  const [address, setAddress] = useState(existing?.address ?? '')
  const [city, setCity] = useState(existing?.city ?? '')
  const [domicile, setDomicile] = useState(existing?.domicile ?? '')
  const [gender, setGender] = useState(existing?.gender ?? '')
  const [qualification, setQualification] = useState(existing?.qualification ?? '')
  const [specialization, setSpecialization] = useState(existing?.specialization ?? '')
  const [modeOfAppointment, setModeOfAppointment] = useState(
    existing?.modeOfAppointment ?? 'Regular',
  )
  const [emergencyContactName, setEmergencyContactName] = useState(
    existing?.emergencyContactName ?? '',
  )
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    existing?.emergencyContactPhone ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const [legacyCentreId, setLegacyCentreId] = useState(() => {
    if (!existing) return ''
    if (wingIdForLegacyDepartment(existing.departmentId)) return existing.departmentId
    if (existing.orgWingId) {
      return legacyDepartmentIdForWingId(existing.orgWingId) ?? ''
    }
    return ''
  })
  const [orgError, setOrgError] = useState<string | null>(null)
  const [officeError, setOfficeError] = useState<string | null>(null)

  const isHeadOffice =
    officePlacement.category === 'head_office' && officePlacement.officeId === NAVTTC_HEAD_OFFICE_ID
  const isRegionalOffice =
    officePlacement.category === 'regional_office' &&
    Boolean(officePlacement.officeId) &&
    officePlacement.officeId !== NAVTTC_HEAD_OFFICE_ID
  const showHqOrganogram = isHeadOffice && isHqHierarchyRole(roleLevelId)
  const showRegionalDesignations = isRegionalOffice && Boolean(officePlacement.officeId)

  const roleOptions = useMemo(() => {
    if (isRegionalOffice) {
      return NAVTTC_ROLE_LEVELS
    }
    if (isHeadOffice) {
      return NAVTTC_ROLE_LEVELS.filter((r) =>
        (HQ_HIERARCHY_ROLE_IDS as readonly string[]).includes(r.id),
      )
    }
    return NAVTTC_ROLE_LEVELS
  }, [isHeadOffice, isRegionalOffice])

  const resolvedDurationMonths = useMemo(() => {
    const n = Number.parseInt(durationMonths, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }, [durationMonths])

  const resolvedDepartmentId = useMemo(() => {
    if (isRegionalOffice) {
      return defaultDepartmentIdForOffice(officePlacement.officeId, departments)
    }
    if (!isHeadOffice) {
      return defaultDepartmentIdForOffice(officePlacement.officeId, departments)
    }
    if (legacyCentreId && wingIdForLegacyDepartment(legacyCentreId)) {
      return legacyCentreId
    }
    if (!orgPlacement.orgWingId) return 'c1'
    return legacyDepartmentIdForPlacement({
      orgHeadId: orgPlacement.orgHeadId,
      orgWingId: orgPlacement.orgWingId,
      orgSectionId: orgPlacement.orgSectionId,
    })
  }, [isHeadOffice, isRegionalOffice, officePlacement.officeId, orgPlacement, legacyCentreId, departments])

  const selectedRole = getRoleLevelById(roleLevelId)

  const organogramComplete =
    showHqOrganogram && isOrganogramPlacementComplete(orgPlacement, roleLevelId)

  const organogramHint = useMemo(
    () =>
      showHqOrganogram && roleLevelId
        ? organogramPlacementHint(orgPlacement, roleLevelId)
        : null,
    [showHqOrganogram, roleLevelId, orgPlacement],
  )

  const designationOptions = useMemo(() => {
    if (showRegionalDesignations) {
      return regionalOfficeDesignations(designations)
    }
    if (!roleLevelId) return []
    if (showHqOrganogram && !organogramComplete) return []
    return designationsMatchingRoleLevel(roleLevelId, designations, {
      departmentId: resolvedDepartmentId || undefined,
      officeId: officePlacement.officeId,
      departments,
      orgPlacement: showHqOrganogram ? orgPlacement : undefined,
    })
  }, [
    designations,
    resolvedDepartmentId,
    roleLevelId,
    officePlacement.officeId,
    departments,
    showHqOrganogram,
    orgPlacement,
    organogramComplete,
    showRegionalDesignations,
  ])

  useEffect(() => {
    if (!designationId || !roleLevelId) return
    const des =
      designations.find((d) => d.id === designationId) ??
      designationOptions.find((d) => d.id === designationId)
    if (
      !designationMatchesRoleLevel(des, roleLevelId, {
        regionalStaff: isRegionalOffice,
      })
    ) {
      setDesignationId('')
    }
  }, [designationId, roleLevelId, designations, designationOptions, isRegionalOffice])

  function onOrgPlacementChange(next: typeof orgPlacement) {
    setOrgPlacement(next)
    setOrgError(null)
    setDesignationId('')
    if (next.orgWingId && next.orgWingId !== orgPlacement.orgWingId) {
      const mapped = legacyDepartmentIdForWingId(next.orgWingId)
      if (mapped) setLegacyCentreId(mapped)
    }
    if (roleLevelId && isOrganogramPlacementComplete(next, roleLevelId)) {
      const dept =
        legacyCentreId && wingIdForLegacyDepartment(legacyCentreId)
          ? legacyCentreId
          : next.orgWingId
            ? legacyDepartmentIdForPlacement({
                orgHeadId: next.orgHeadId,
                orgWingId: next.orgWingId,
                orgSectionId: next.orgSectionId,
              })
            : undefined
      const opts = designationsMatchingRoleLevel(roleLevelId, designations, {
        departmentId: dept,
        officeId: officePlacement.officeId,
        departments,
        orgPlacement: next,
      })
      if (opts.length === 1) setDesignationId(opts[0]!.id)
    }
  }

  function onLegacyCentreChange(departmentId: string) {
    setLegacyCentreId(departmentId)
    if (!departmentId) return
    setOrgPlacement(placementFromLegacyDepartment(departmentId))
    setOrgError(null)
    setDesignationId('')
  }

  function onRoleLevelChange(nextRoleId: string) {
    setRoleLevelId(nextRoleId)
    setDesignationId('')
    setLegacyCentreId('')
    if (!nextRoleId) {
      setOfficePlacement(EMPTY_OFFICE_PLACEMENT)
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
    if (cfg?.forceHeadOffice && isHeadOffice) {
      setOfficePlacement({ category: 'head_office', officeId: NAVTTC_HEAD_OFFICE_ID })
      setOfficeError(null)
    }
    if (cfg) {
      setOrgPlacement(orgPlacementForRoleChange(nextRoleId, orgPlacement))
      setOrgError(null)
    }
  }

  function onOfficePlacementChange(next: typeof officePlacement) {
    setOfficePlacement(next)
    setOfficeError(null)
    const nextIsHead =
      next.category === 'head_office' && next.officeId === NAVTTC_HEAD_OFFICE_ID
    const nextIsRegional =
      next.category === 'regional_office' &&
      Boolean(next.officeId) &&
      next.officeId !== NAVTTC_HEAD_OFFICE_ID

    if (nextIsRegional) {
      setRoleLevelId('')
      setDesignationId('')
      setOrgPlacement({
        orgHeadId: DEFAULT_ORG_HEAD_ID,
        orgWingId: '',
        orgSectionId: '',
      })
      setOrgError(null)
    } else if (nextIsHead) {
      if (roleLevelId === REGIONAL_STAFF_ROLE_ID) {
        setRoleLevelId('')
        setDesignationId('')
      }
    } else if (next.officeId !== officePlacement.officeId) {
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
    }
    if (resolvedDurationMonths == null || !isValidPresetDurationMonths(resolvedDurationMonths)) {
      setError('Select an appointment duration (e.g. 12 months, 1 year, 2 years).')
      return
    }
    if (!roleLevelId) {
      setError(
        isRegionalOffice
          ? 'Select a designation / post.'
          : 'Select a role from the NAVTTC hierarchy.',
      )
      return
    }
    if (designationOptions.length > 0 && !designationId) {
      setError('Select a designation / post at the same BPS as the role level.')
      return
    }
    if (designationId) {
      const des =
        designations.find((d) => d.id === designationId) ??
        designationOptions.find((d) => d.id === designationId)
      if (
        !designationMatchesRoleLevel(des, roleLevelId, {
          regionalStaff: isRegionalOffice,
        })
      ) {
        setError(
          isRegionalOffice
            ? 'Select a designation from the regional staff list (same as login demo roles).'
            : `Designation must be at BPS ${selectedRole?.bps ?? '—'} to match the selected role level.`,
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
      address,
      city,
      domicile,
      gender,
      qualification,
      specialization,
      modeOfAppointment,
      emergencyContactName,
      emergencyContactPhone,
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
    : undefined

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
              {showRegionalDesignations ? (
                <div className="hrms-org-placement__follow">
                <CompactFormGrid>
                  <CompactFormField
                    full
                    label={
                      <>
                        Designation / post <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-briefcase-line">
                      <select
                        value={designationId}
                        onChange={(e) => {
                          const nextId = e.target.value
                          setDesignationId(nextId)
                          const picked = designationOptions.find((d) => d.id === nextId)
                          if (picked) {
                            setRoleLevelId(
                              roleLevelIdFromLoginDemoTitle(picked.title) ??
                                REGIONAL_STAFF_ROLE_ID,
                            )
                          }
                        }}
                        required={designationOptions.length > 0}
                      >
                        <option value="">— Select designation —</option>
                        {designationOptions.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.title}
                            {g.grade && g.grade !== '—' ? ` (${g.grade})` : ''}
                          </option>
                        ))}
                      </select>
                    </CompactFormInputWrap>
                    </CompactFormField>
                </CompactFormGrid>
                </div>
              ) : null}
            </CompactFormSection>

            {isHeadOffice && officePlacement.officeId ? (
            <CompactFormSection legend="Role (NAVTTC hierarchy)">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Role <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-vip-crown-line">
                    <select
                      value={roleLevelId}
                      onChange={(e) => onRoleLevelChange(e.target.value)}
                      required
                    >
                      <option value="">Select role…</option>
                      {roleOptions.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.id === REGIONAL_STAFF_ROLE_ID
                            ? formatRoleLevelLabel(role)
                            : `${formatRoleLevelLabel(role)} — ${role.levelCategory}`}
                        </option>
                      ))}
                    </select>
                  </CompactFormInputWrap>
                </CompactFormField>
              </CompactFormGrid>
            </CompactFormSection>
            ) : null}

            {isRegionalOffice && officePlacement.officeId && roleLevelId ? (
            <CompactFormSection legend="Role (from designation)">
              <CompactFormGrid>
                <CompactFormField full label="Role">
                  <CompactFormInputWrap icon="ri-vip-crown-line">
                    <input
                      type="text"
                      readOnly
                      tabIndex={-1}
                      value={
                        selectedRole
                          ? roleLevelId === REGIONAL_STAFF_ROLE_ID
                            ? formatRoleLevelLabel(selectedRole)
                            : `${formatRoleLevelLabel(selectedRole)} — ${selectedRole.levelCategory}`
                          : ''
                      }
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
              </CompactFormGrid>
            </CompactFormSection>
            ) : null}

            {showHqOrganogram && selectedRole ? (
              <CompactFormSection
                legend={`Organization — ${selectedRole.title}`}
              >
                <EmployeeOrgPlacementFields
                  value={orgPlacement}
                  onChange={onOrgPlacementChange}
                  error={orgError}
                  roleLevelId={roleLevelId}
                  legacyCentreId={legacyCentreId}
                  onLegacyCentreChange={onLegacyCentreChange}
                />
                <div className="hrms-org-placement__follow">
                  <CompactFormGrid>
                    <CompactFormField
                      full
                      label={
                        <>
                          Designation / post <CompactFormRequired />
                        </>
                      }
                      hint={organogramHint ?? undefined}
                    >
                      <CompactFormInputWrap icon="ri-briefcase-line">
                        <select
                          value={designationId}
                          onChange={(e) => setDesignationId(e.target.value)}
                          required={organogramComplete && designationOptions.length > 0}
                          disabled={!organogramComplete}
                        >
                          <option value="">
                            {!organogramComplete
                              ? 'Complete organization steps above…'
                              : designationOptions.length > 0
                                ? '— Select designation —'
                                : `— No BPS ${selectedRole.bps} posts for this branch —`}
                          </option>
                          {designationOptions.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title} ({g.grade})
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                  </CompactFormGrid>
                </div>
              </CompactFormSection>
            ) : null}

            <CompactFormSection legend="Contact & address">
              <CompactFormGrid>
                <CompactFormField full label="Residential address">
                  <CompactFormInputWrap icon="ri-home-4-line">
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House / street, sector, town"
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormGrid split>
                  <CompactFormField label="City">
                    <CompactFormInputWrap icon="ri-map-pin-line">
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Islamabad"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Domicile">
                    <CompactFormInputWrap icon="ri-flag-line">
                      <select value={domicile} onChange={(e) => setDomicile(e.target.value)}>
                        <option value="">— Select —</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Sindh">Sindh</option>
                        <option value="KPK">KPK</option>
                        <option value="Balochistan">Balochistan</option>
                        <option value="ICT">ICT</option>
                        <option value="AJK">AJK</option>
                        <option value="GB">Gilgit-Baltistan</option>
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormGrid split>
                  <CompactFormField label="Gender">
                    <CompactFormInputWrap icon="ri-user-line">
                      <select value={gender} onChange={(e) => setGender(e.target.value)}>
                        <option value="">— Select —</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Mode of appointment">
                    <CompactFormInputWrap icon="ri-file-shield-line">
                      <select
                        value={modeOfAppointment}
                        onChange={(e) => setModeOfAppointment(e.target.value)}
                      >
                        <option value="Regular">Regular</option>
                        <option value="Deputation">Deputation</option>
                        <option value="Contract">Contract</option>
                        <option value="Ad hoc">Ad hoc</option>
                      </select>
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormGrid split>
                  <CompactFormField label="Qualification">
                    <CompactFormInputWrap icon="ri-graduation-cap-line">
                      <input
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        placeholder="e.g. Masters, Bachelors"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Specialization">
                    <CompactFormInputWrap icon="ri-book-open-line">
                      <input
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        placeholder="e.g. HR, Engineering"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormGrid split>
                  <CompactFormField label="Emergency contact name">
                    <CompactFormInputWrap icon="ri-contacts-line">
                      <input
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="Next of kin"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Emergency contact phone">
                    <CompactFormInputWrap icon="ri-phone-line">
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="03xx-xxxxxxx"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
              </CompactFormGrid>
            </CompactFormSection>

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

                {roleLevelId && !showHqOrganogram && !showRegionalDesignations ? (
                  <CompactFormField
                    full
                    label={
                      <>
                        Designation / post <CompactFormRequired />
                      </>
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
