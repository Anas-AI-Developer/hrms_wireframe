import type { FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EMPLOYMENT_TYPES_FILTERABLE } from '../data/employmentTypes'
import { employmentTypeLabel } from '../data/employmentStats'
import { departments, designations, employees, getEmployee } from '../data/mock'
import './pages.css'

export function EmployeeFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const existing = id ? getEmployee(id) : undefined
  const isEdit = Boolean(existing)
  const nextCode = `EMP-${String(employees.length + 1).padStart(4, '0')}`

  const managerOptions = employees.filter(
    (e) => e.status === 'active' && !/^vacant$/i.test(e.firstName) && e.id !== existing?.id,
  )

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    alert('Wireframe: form submit is disabled (no persistence).')
    if (existing) navigate(`/employees/${existing.id}`)
    else navigate('/employees')
  }

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-breadcrumb">
        <Link to="/employees">Employees</Link>
        <span aria-hidden> / </span>
        <span>{isEdit ? `Edit · ${existing?.employeeNo}` : 'New'}</span>
      </div>
      <h1 className="wf-h1">{isEdit ? 'Edit employee' : 'Create employee'}</h1>
      <p className="wf-lead">
        Auto code on create: <code>{nextCode}</code>. One department, one reporting manager (client rules).
      </p>

      <form className="wf-form" onSubmit={onSubmit}>
        <div className="wf-form-grid">
          <label className="wf-field">
            <span>First name</span>
            <input name="firstName" defaultValue={existing?.firstName} />
          </label>
          <label className="wf-field">
            <span>Last name</span>
            <input name="lastName" defaultValue={existing?.lastName} />
          </label>
          <label className="wf-field wf-field--full">
            <span>Email</span>
            <input type="email" name="email" defaultValue={existing?.email} />
          </label>
          <label className="wf-field">
            <span>Employee code</span>
            <input
              name="employeeNo"
              defaultValue={existing?.employeeNo ?? nextCode}
              readOnly={!isEdit}
              placeholder="EMP-0001"
            />
          </label>
          <label className="wf-field">
            <span>Employment type</span>
            <select name="employmentType" defaultValue={existing?.employmentType ?? 'regular'}>
              {EMPLOYMENT_TYPES_FILTERABLE.map((t) => (
                <option key={t} value={t}>
                  {employmentTypeLabel(t)}
                </option>
              ))}
            </select>
          </label>
          <label className="wf-field">
            <span>Department (centre)</span>
            <select name="departmentId" defaultValue={existing?.departmentId ?? departments[0]?.id}>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="wf-field">
            <span>Designation</span>
            <select name="designationId" defaultValue={existing?.designationId ?? designations[0]?.id}>
              {designations.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </label>
          <label className="wf-field">
            <span>Reporting manager</span>
            <select name="managerId" defaultValue={existing?.managerId ?? ''}>
              <option value="">— None —</option>
              {managerOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} · {m.sanctionedPost}
                </option>
              ))}
            </select>
          </label>
          <label className="wf-field">
            <span>Status</span>
            <select name="status" defaultValue={existing?.status ?? 'active'}>
              <option value="active">active</option>
              <option value="on_leave">on_leave</option>
              <option value="inactive">inactive</option>
            </select>
          </label>
          <label className="wf-field">
            <span>Join date</span>
            <input type="date" name="joinDate" defaultValue={existing?.joinDate} />
          </label>
        </div>
        <div className="wf-form-actions">
          <Link className="wf-btn wf-btn--ghost" to={existing ? `/employees/${existing.id}` : '/employees'}>
            Cancel
          </Link>
          <button type="submit" className="wf-btn wf-btn--primary">
            Save (mock)
          </button>
        </div>
      </form>
    </div>
  )
}
