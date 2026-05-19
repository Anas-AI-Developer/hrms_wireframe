import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { employees, getDepartment, getDesignation, getEmployee } from '../data/mock'
import './pages.css'

export function EmployeeListPage() {
  const { can, visibleEmployees, user } = useAuth()
  const canWrite = can('page:employees:write')
  const list = visibleEmployees()
  const total = employees.length

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">Employees</h1>
          <p className="wf-lead">
            <strong>{list.length}</strong> of {total} roster rows from client <strong>MasterList</strong> (full
            import). Codes use <code>EMP-####</code> aligned with S.#. Reporting manager derived from organogram
            order + BPS.
          </p>
        </div>
        {canWrite ? (
          <Link className="wf-btn wf-btn--primary" to="/employees/new">
            New employee
          </Link>
        ) : null}
      </div>

      {user?.role === 'employee' ? (
        <p className="wf-note wf-note--warn">Use the Employee self-service portal for your own record.</p>
      ) : null}

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Centre</th>
              <th>Section</th>
              <th>Post</th>
              <th>Manager</th>
              <th>Type</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((e) => {
              const dept = getDepartment(e.departmentId)
              const des = getDesignation(e.designationId)
              const mgr = e.managerId ? getEmployee(e.managerId) : undefined
              return (
                <tr key={e.id}>
                  <td>
                    <code>{e.employeeNo}</code>
                  </td>
                  <td>
                    <Link to={`/employees/${e.id}`}>
                      {e.firstName} {e.lastName}
                    </Link>
                  </td>
                  <td>{dept?.name ?? '—'}</td>
                  <td>{e.section ?? '—'}</td>
                  <td>{e.sanctionedPost ?? des?.title ?? '—'}</td>
                  <td>
                    {mgr ? (
                      <Link className="wf-link-quiet" to={`/employees/${mgr.id}`}>
                        {mgr.firstName} {mgr.lastName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{e.employmentType}</td>
                  <td>
                    <span className={`wf-pill wf-pill--${e.status}`}>{e.status}</span>
                  </td>
                  <td className="wf-table-actions">
                    <Link className="wf-link-quiet" to={`/employees/${e.id}`}>
                      View
                    </Link>
                    {canWrite ? (
                      <Link className="wf-link-quiet" to={`/employees/${e.id}/edit`}>
                        Edit
                      </Link>
                    ) : null}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
