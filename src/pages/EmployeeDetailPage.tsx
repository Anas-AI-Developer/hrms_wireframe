import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { homePathForRole } from '../portals/homePath'
import { employmentTypeLabel } from '../data/employmentStats'
import {
  getDepartment,
  getDesignation,
  getDirectReports,
  getEmployee,
  getEmployeeHistory,
} from '../data/mock'
import './pages.css'

export function EmployeeDetailPage() {
  const { user, can, canViewEmployee } = useAuth()
  const canWrite = can('page:employees:write')
  const { id } = useParams<{ id: string }>()
  const e = id ? getEmployee(id) : undefined

  if (!e) {
    return (
      <div className="wf-page">
        <p>Employee not found in roster data.</p>
        <Link to="/employees">Back to list</Link>
      </div>
    )
  }

  if (!canViewEmployee(e)) {
    const fallback = user && can('page:employees') ? '/employees' : user ? homePathForRole(user.role) : '/login'
    return <Navigate to={fallback} replace />
  }

  const dept = getDepartment(e.departmentId)
  const des = getDesignation(e.designationId)
  const manager = e.managerId ? getEmployee(e.managerId) : undefined
  const reports = getDirectReports(e.id)
  const history = getEmployeeHistory(e.id)

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-breadcrumb">
        <Link to="/employees">Employees</Link>
        <span aria-hidden> / </span>
        <span>{e.employeeNo}</span>
      </div>
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">
            {e.firstName} {e.lastName}
          </h1>
          <p className="wf-lead">{e.email}</p>
        </div>
        <div className="wf-actions">
          <Link className="wf-btn wf-btn--ghost" to="/employees">
            List
          </Link>
          {canWrite ? (
            <Link className="wf-btn wf-btn--primary" to={`/employees/${e.id}/edit`}>
              Edit
            </Link>
          ) : null}
        </div>
      </div>

      <div className="wf-dl-grid">
        <dl className="wf-dl">
          <dt>Employee code</dt>
          <dd>
            <code>{e.employeeNo}</code>
          </dd>
          {e.masterSerial != null ? (
            <>
              <dt>MasterList S.#</dt>
              <dd>{e.masterSerial}</dd>
            </>
          ) : null}
          <dt>Employment type</dt>
          <dd>
            {employmentTypeLabel(e.employmentType)}
            {e.modeOfAppointment ? (
              <span className="wf-card-desc"> · {e.modeOfAppointment}</span>
            ) : null}
          </dd>
          <dt>Phone</dt>
          <dd>{e.phone}</dd>
          <dt>Centre</dt>
          <dd>{e.location}</dd>
          <dt>Join date</dt>
          <dd>{e.joinDate}</dd>
        </dl>
        <dl className="wf-dl">
          <dt>Department (centre)</dt>
          <dd>{dept ? `${dept.name} (${dept.code})` : '—'}</dd>
          <dt>Section</dt>
          <dd>{e.section ?? '—'}</dd>
          <dt>Sanctioned post</dt>
          <dd>{e.sanctionedPost ?? des?.title ?? '—'}</dd>
          <dt>Working as</dt>
          <dd>{e.workingAs ?? '—'}</dd>
          <dt>Actual post</dt>
          <dd>{e.actualPost ?? '—'}</dd>
          <dt>BPS</dt>
          <dd>{e.bps ?? '—'}</dd>
          <dt>Reporting manager</dt>
          <dd>
            {manager ? (
              <Link to={`/employees/${manager.id}`}>
                {manager.firstName} {manager.lastName} ({manager.employeeNo})
              </Link>
            ) : (
              '—'
            )}
          </dd>
          <dt>Status</dt>
          <dd>
            <span className={`wf-pill wf-pill--${e.status}`}>{e.status}</span>
          </dd>
        </dl>
        <dl className="wf-dl">
          <dt>Qualification</dt>
          <dd>{e.qualification ?? '—'}</dd>
          <dt>Mode of appointment</dt>
          <dd>{e.modeOfAppointment ?? '—'}</dd>
          <dt>Parent department</dt>
          <dd>{e.parentDepartment ?? '—'}</dd>
          <dt>Tenure in NAVTTC</dt>
          <dd>{e.tenureInNavttc ?? '—'}</dd>
          <dt>Domicile</dt>
          <dd>{e.domicile ?? '—'}</dd>
        </dl>
      </div>

      {reports.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Direct reports ({reports.length})</h2>
          <ul className="wf-list">
            {reports.slice(0, 12).map((r) => (
              <li key={r.id}>
                <Link to={`/employees/${r.id}`}>
                  {r.firstName} {r.lastName}
                </Link>
                {' — '}
                {r.sanctionedPost ?? '—'}
              </li>
            ))}
            {reports.length > 12 ? <li>…and {reports.length - 12} more</li> : null}
          </ul>
        </section>
      ) : null}

      {history.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Change history (sample)</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Field</th>
                  <th>From</th>
                  <th>To</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.date}</td>
                    <td>{h.field}</td>
                    <td>{h.fromLabel}</td>
                    <td>{h.toLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  )
}
