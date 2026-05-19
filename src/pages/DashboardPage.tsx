import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { departments, employees } from '../data/mock'
import './pages.css'

export function DashboardPage() {
  const { can, visibleEmployees, user } = useAuth()
  const canEmployees = can('page:employees')
  const canDepartments = can('page:departments')
  const canAdmin = can('page:admin_settings')
  const scoped = visibleEmployees()

  const active = scoped.filter((e) => e.status === 'active').length
  const onLeave = scoped.filter((e) => e.status === 'on_leave').length
  const inactive = scoped.filter((e) => e.status === 'inactive').length

  if (user?.role === 'employee') {
    return (
      <div className="wf-page">
        <h1 className="wf-h1">Dashboard</h1>
        <p className="wf-lead">Your account uses the employee self-service portal.</p>
        <Link className="wf-btn wf-btn--primary" to="/ess">
          Open self-service →
        </Link>
      </div>
    )
  }

  return (
    <div className="wf-page">
      <h1 className="wf-h1">Dashboard</h1>
      <p className="wf-lead">
        NAVTTC HRMS wireframe — {employees.length} roster rows from MasterList, {departments.length} centres.
      </p>

      <div className="wf-grid wf-grid--3">
        <article className="wf-card">
          <motion.div className="wf-card-kicker">Workforce (your scope)</div>
          <div className="wf-card-stat">{scoped.length}</div>
          <div className="wf-card-desc">
            Active {active} · On leave {onLeave} · Inactive {inactive}
          </div>
          {canEmployees ? (
            <Link className="wf-card-link" to="/employees">
              Open roster →
            </Link>
          ) : (
            <span className="wf-card-desc">Restricted for your role</span>
          )}
        </article>
        <article className="wf-card">
          <div className="wf-card-kicker">Organisation</div>
          <div className="wf-card-stat">{departments.length}</div>
          <div className="wf-card-desc">Centres / departments from master data</motion.div>
          {canDepartments ? (
            <Link className="wf-card-link" to="/departments">
              Centres & sections →
            </Link>
          ) : (
            <span className="wf-card-desc">Restricted for your role</span>
          )}
        </article>
        <article className="wf-card">
          <div className="wf-card-kicker">Configuration</div>
          <motion.div className="wf-card-desc">Leave types, office hours, recruitment pipeline</motion.div>
          {canAdmin ? (
            <Link className="wf-card-link" to="/admin/settings">
              Admin settings →
            </Link>
          ) : (
            <Link className="wf-card-link" to="/admin/rbac">
              View RBAC matrix →
            </Link>
          )}
        </article>
      </div>

      {canEmployees ? (
        <section className="wf-section">
          <h2 className="wf-h2">Recent employees (scope)</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Post</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {scoped.slice(0, 6).map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link to={`/employees/${e.id}`}>{e.employeeNo}</Link>
                    </td>
                    <td>
                      {e.firstName} {e.lastName}
                    </td>
                    <td>{e.sanctionedPost ?? '—'}</td>
                    <td>
                      <span className={`wf-pill wf-pill--${e.status}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </motion.div>
  )
}
