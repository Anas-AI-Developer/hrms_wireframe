import { type FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { EMPLOYMENT_TYPES_FILTERABLE } from '../data/employmentTypes'
import { employmentTypeLabel } from '../data/employmentStats'
import { useWireframeData } from '../data/WireframeDataContext'
import type { EmployeeStatus, EmploymentType } from '../types/hrms'

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
  const [employeeNo, setEmployeeNo] = useState(existing?.employeeNo ?? nextCode)
  const [employmentType, setEmploymentType] = useState<EmploymentType>(
    existing?.employmentType ?? 'regular',
  )
  const [departmentId, setDepartmentId] = useState(
    existing?.departmentId ?? departments[0]?.id ?? '',
  )
  const [designationId, setDesignationId] = useState(
    existing?.designationId ?? designations[0]?.id ?? '',
  )
  const [managerId, setManagerId] = useState(existing?.managerId ?? '')
  const [status, setStatus] = useState<EmployeeStatus>(existing?.status ?? 'active')
  const [joinDate, setJoinDate] = useState(
    existing?.joinDate && existing.joinDate !== '—' ? existing.joinDate : '',
  )
  const [error, setError] = useState<string | null>(null)

  const managerOptions = employees.filter(
    (e) => e.status === 'active' && !/^vacant$/i.test(e.firstName) && e.id !== existing?.id,
  )

  const designationOptions = useMemo(
    () =>
      designations.filter(
        (g) => g.status === 'active' && (!departmentId || g.departmentId === departmentId),
      ),
    [designations, departmentId],
  )

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('First name, last name, and email are required.')
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
    }
    if (isEdit && id) {
      updateEmployee(id, input)
      navigate(`/employees/${id}`)
      return
    }
    const created = addEmployee(input)
    navigate(`/employees/${created.id}`)
  }

  return (
    <HrmsListShell
      current={isEdit ? `Edit · ${existing?.employeeNo}` : 'New employee'}
      dashboardHref="/employees"
    >
      <article className="hrms-ref-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">{isEdit ? 'Edit employee' : 'Create employee'}</h2>
          <p className="hrms-ref-panel-desc">
            {isEdit
              ? 'Update roster details. Changes are saved for this browser session.'
              : `New code: ${nextCode}. Saved to the wireframe roster for this session.`}
          </p>
        </header>
        <div className="hrms-ref-panel-body">
          <form className="hrms-ref-form-grid" onSubmit={onSubmit}>
            {error ? <p className="hrms-ref-form-alert hrms-ref-form-alert--warn">{error}</p> : null}
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">
                First name <span className="hrms-ref-required">*</span>
              </span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">
                Last name <span className="hrms-ref-required">*</span>
              </span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
            <label className="hrms-ref-field hrms-ref-field--full">
              <span className="hrms-ref-field-label">
                Email <span className="hrms-ref-required">*</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Employee code</span>
              <input
                value={isEdit ? employeeNo : nextCode}
                readOnly={!isEdit}
                onChange={(e) => setEmployeeNo(e.target.value)}
              />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Employment type</span>
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
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Department (centre)</span>
              <select
                value={departmentId}
                onChange={(e) => {
                  setDepartmentId(e.target.value)
                  setDesignationId('')
                }}
              >
                {departments
                  .filter((d) => d.status === 'active')
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </select>
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Designation</span>
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
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Reporting manager</span>
              <select value={managerId} onChange={(e) => setManagerId(e.target.value)}>
                <option value="">— None —</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.firstName} {m.lastName} · {m.sanctionedPost}
                  </option>
                ))}
              </select>
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as EmployeeStatus)}>
                <option value="active">Active</option>
                <option value="on_leave">On leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Join date</span>
              <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
            </label>
            <div className="hrms-ref-form-footer hrms-ref-field--full">
              <Link
                to={existing ? `/employees/${existing.id}` : '/employees'}
                className="hrms-ref-btn-secondary"
              >
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                {isEdit ? 'Save changes' : 'Create employee'}
              </button>
            </div>
          </form>
        </div>
      </article>
    </HrmsListShell>
  )
}
