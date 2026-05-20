import { type FormEvent, useMemo, useState } from 'react'
import { EmployeeBenefitsFields } from '../components/benefits/EmployeeBenefitsFields'
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
  CompactFormStatus,
} from '../components/hrms/HrmsCompactForm'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { EMPLOYMENT_TYPES_FILTERABLE, employmentTypeRequiresEndDate } from '../data/employmentTypes'
import { employmentTypeLabel } from '../data/employmentStats'
import { getOfficeById, resolveDepartmentOfficeId } from '../data/navttcOffices'
import { useWireframeData } from '../data/WireframeDataContext'
import type { EmployeeStatus, EmploymentType } from '../types/hrms'

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    offices,
    departments,
    designations,
    employees,
    getDepartment,
    getEmployee,
    addEmployee,
    updateEmployee,
    getDepartmentsForOffice,
    benefitDefinitions,
    employmentTypeBenefitDefaults,
    getEmployeeBenefitIds,
  } = useWireframeData()
  const existing = id ? getEmployee(id) : undefined
  const isEdit = Boolean(existing)

  const existingDept = existing ? getDepartment(existing.departmentId) : undefined

  const nextCode = useMemo(
    () => `EMP-${String(employees.length + 1).padStart(4, '0')}`,
    [employees.length],
  )

  const [firstName, setFirstName] = useState(existing?.firstName ?? '')
  const [lastName, setLastName] = useState(existing?.lastName ?? '')
  const [email, setEmail] = useState(existing?.email ?? '')
  const [employeeNo, setEmployeeNo] = useState(existing?.employeeNo ?? nextCode)
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    existing?.employmentType ?? 'regular',
  )
  const [officeId, setOfficeId] = useState(
    existingDept ? resolveDepartmentOfficeId(existingDept) : '',
  )
  const [departmentId, setDepartmentId] = useState(existing?.departmentId ?? '')
  const [designationId, setDesignationId] = useState(existing?.designationId ?? '')
  const [managerId, setManagerId] = useState(existing?.managerId ?? '')
  const [status, setStatus] = useState<EmployeeStatus>(existing?.status ?? 'active')
  const [joinDate, setJoinDate] = useState(
    existing?.joinDate && existing.joinDate !== '—' ? existing.joinDate : '',
  )
  const [endDate, setEndDate] = useState(
    existing?.endDate && existing.endDate !== '—' ? existing.endDate : '',
  )
  const [error, setError] = useState<string | null>(null)

  const defaultBenefitIds = useMemo(
    () => employmentTypeBenefitDefaults[employmentType] ?? [],
    [employmentTypeBenefitDefaults, employmentType],
  )

  const [selectedBenefitIds, setSelectedBenefitIds] = useState<string[]>(() => {
    if (existing?.id) return getEmployeeBenefitIds(existing.id)
    return employmentTypeBenefitDefaults[existing?.employmentType ?? 'regular'] ?? []
  })

  const showEndDate = employmentTypeRequiresEndDate(employmentType)
  const selectedOffice = officeId ? getOfficeById(officeId) : undefined

  const departmentOptions = useMemo(
    () => getDepartmentsForOffice(officeId),
    [officeId, getDepartmentsForOffice, departments],
  )

  const designationOptions = useMemo(
    () =>
      designations.filter(
        (g) => g.status === 'active' && (!departmentId || g.departmentId === departmentId),
      ),
    [designations, departmentId],
  )

  const managerOptions = employees.filter(
    (e) => e.status === 'active' && !/^vacant$/i.test(e.firstName) && e.id !== existing?.id,
  )

  function onEmploymentTypeChange(type: EmploymentType) {
    const prevDefaults = employmentTypeBenefitDefaults[employmentType] ?? []
    const nextDefaults = employmentTypeBenefitDefaults[type] ?? []
    const extras = selectedBenefitIds.filter((id) => !prevDefaults.includes(id))
    setEmploymentType(type)
    setSelectedBenefitIds([...new Set([...nextDefaults, ...extras])])
    if (!employmentTypeRequiresEndDate(type)) {
      setEndDate('')
    }
  }

  function onOfficeChange(nextOfficeId: string) {
    setOfficeId(nextOfficeId)
    setDepartmentId('')
    setDesignationId('')
  }

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.')
      return
    }
    if (!officeId) {
      setError('Select a NAVTTC office.')
      return
    }
    if (!departmentId) {
      setError('Select a department for the chosen office.')
      return
    }
    if (showEndDate && !endDate.trim()) {
      setError('End date is required for deputation, contract, DPL, and short-term appointments.')
      return
    }
    const input = {
      employeeNo: isEdit ? employeeNo : nextCode,
      firstName,
      lastName,
      email,
      departmentId,
      designationId,
      managerId: managerId || undefined,
      employmentType,
      status,
      joinDate: joinDate || '—',
      endDate: showEndDate ? endDate || '—' : '—',
      benefitIds: selectedBenefitIds,
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
    : `New code ${nextCode}. Saved to the wireframe roster for this session.`

  const employmentHint = showEndDate
    ? 'This appointment type requires an end date below.'
    : 'Regular and vacant posts are open-ended — no end date.'

  return (
    <HrmsListShell
      current={isEdit ? `Edit · ${existing?.employeeNo}` : 'New employee'}
      dashboardHref="/employees"
    >
      <CompactFormPage wide>
        <CompactFormCard icon="ri-user-add-line" title={heading} description={sub}>
          <form onSubmit={onSubmit}>
            {error ? <CompactFormAlert>{error}</CompactFormAlert> : null}

            <CompactFormSection legend="Personal">
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
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormSection legend="Assignment">
              <CompactFormGrid>
                <CompactFormField full label="Employment type" hint={employmentHint}>
                  <CompactFormInputWrap icon="ri-file-list-3-line">
                    <select
                      value={employmentType}
                      onChange={(e) => onEmploymentTypeChange(e.target.value as EmploymentType)}
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
                  label={
                    <>
                      Office <CompactFormRequired />
                    </>
                  }
                  hint="NAVTTC HQ or regional office — departments are listed under the office you pick."
                >
                  <CompactFormInputWrap icon="ri-map-pin-line">
                    <select
                      value={officeId}
                      onChange={(e) => onOfficeChange(e.target.value)}
                      required
                    >
                      <option value="">Select office…</option>
                      {offices.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.name} ({o.code})
                        </option>
                      ))}
                    </select>
                  </CompactFormInputWrap>
                </CompactFormField>

                {officeId ? (
                  <CompactFormField
                    label={
                      <>
                        Department <CompactFormRequired />
                      </>
                    }
                    hint={
                      selectedOffice
                        ? `Functional units at ${selectedOffice.name}.`
                        : undefined
                    }
                  >
                    {departmentOptions.length === 0 ? (
                      <p className="hrms-compact-form-field__hint" style={{ margin: 0 }}>
                        No departments are set up for this office yet.
                      </p>
                    ) : (
                      <CompactFormInputWrap icon="ri-building-line">
                        <select
                          value={departmentId}
                          onChange={(e) => {
                            setDepartmentId(e.target.value)
                            setDesignationId('')
                          }}
                          required
                        >
                          <option value="">Select department…</option>
                          {departmentOptions.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    )}
                  </CompactFormField>
                ) : null}

                {officeId && departmentId ? (
                  <CompactFormGrid split>
                    <CompactFormField label="Designation">
                      <CompactFormInputWrap icon="ri-briefcase-line">
                        <select
                          value={designationId}
                          onChange={(e) => setDesignationId(e.target.value)}
                        >
                          {designationOptions.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title} ({g.grade})
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                    <CompactFormField label="Reporting manager">
                      <CompactFormInputWrap icon="ri-team-line">
                        <select value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                          <option value="">— None —</option>
                          {managerOptions.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.firstName} {m.lastName} · {m.sanctionedPost}
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                  </CompactFormGrid>
                ) : null}
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormSection legend="Record">
              <CompactFormGrid>
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
                  {showEndDate ? (
                    <CompactFormField
                      label={
                        <>
                          End date <CompactFormRequired />
                        </>
                      }
                      hint="Required for deputation, contract, DPL, and short-term project staff."
                    >
                      <CompactFormInputWrap icon="ri-calendar-close-line">
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          required
                        />
                      </CompactFormInputWrap>
                    </CompactFormField>
                  ) : null}
                </CompactFormGrid>
                <CompactFormField label="Status">
                  <CompactFormStatus
                    name="employee-status"
                    value={status}
                    onChange={setStatus}
                    ariaLabel="Employee status"
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'on_leave', label: 'On leave' },
                      { value: 'inactive', label: 'Inactive' },
                    ]}
                  />
                </CompactFormField>
              </CompactFormGrid>
            </CompactFormSection>

            <CompactFormSection legend="Benefits">
              <EmployeeBenefitsFields
                employmentType={employmentType}
                defaultBenefitIds={defaultBenefitIds}
                selectedBenefitIds={selectedBenefitIds}
                onChange={setSelectedBenefitIds}
                definitions={benefitDefinitions}
              />
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
