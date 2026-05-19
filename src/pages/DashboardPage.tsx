import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { departments } from '../data/mock'
import './pages.css'

const flowCards = [
  { title: 'Core HR', desc: 'Roster, centres, RBAC', to: '/employees', permission: 'page:employees' as const },
  { title: 'Attendance & leave', desc: 'Import, requests, approvals', to: '/attendance', permission: 'page:attendance' as const },
  { title: 'Recruitment', desc: 'Jobs → candidates → offer', to: '/recruitment', permission: 'page:recruitment' as const },
  { title: 'Onboarding', desc: 'Checklist → employee record', to: '/onboarding', permission: 'page:onboarding' as const },
  { title: 'Payroll', desc: 'Monthly run → payslips', to: '/payroll', permission: 'page:payroll' as const },
  { title: 'Performance', desc: 'Cycles, goals, appraisals', to: '/performance', permission: 'page:performance' as const },
  { title: 'Training', desc: 'Catalogue & nominations', to: '/training', permission: 'page:training' as const },
  { title: 'Benefits', desc: 'Plans & enrollment', to: '/benefits', permission: 'page:benefits' as const },
  { title: 'Compliance', desc: 'Statutory registers', to: '/compliance', permission: 'page:compliance' as const },
  { title: 'System proposal', desc: 'End-to-end flows', to: '/proposal', permission: 'page:proposal' as const },
]

export function DashboardPage() {
  const { can, visibleEmployees, user } = useAuth()
  const scoped = visibleEmployees()
  const active = scoped.filter((e) => e.status === 'active').length

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
        NAVTTC HRMS wireframe — proposed modules and role-based flows. Demo data from client MasterList; focus is on
        screens and hand-offs, not record totals.
      </p>

      <div className="wf-grid wf-grid--3">
        <article className="wf-card">
          <div className="wf-card-kicker">Workforce (your scope)</div>
          <div className="wf-card-stat">{scoped.length}</div>
          <div className="wf-card-desc">Active {active} in scope</div>
          {can('page:employees') ? (
            <Link className="wf-card-link" to="/employees">
              Open roster →
            </Link>
          ) : null}
        </article>
        <article className="wf-card">
          <div className="wf-card-kicker">Organisation</div>
          <div className="wf-card-stat">{departments.length}</div>
          <div className="wf-card-desc">Centres from master data</div>
          {can('page:departments') ? (
            <Link className="wf-card-link" to="/departments">
              Centres & sections →
            </Link>
          ) : null}
        </article>
        <article className="wf-card">
          <div className="wf-card-kicker">Proposed system</div>
          <div className="wf-card-desc">How modules connect</div>
          {can('page:proposal') ? (
            <Link className="wf-card-link" to="/proposal">
              View flows →
            </Link>
          ) : (
            <Link className="wf-card-link" to="/modules">
              Sprint modules →
            </Link>
          )}
        </article>
      </div>

      <section className="wf-section">
        <h2 className="wf-h2">Module flows (quick links)</h2>
        <div className="wf-grid wf-grid--3">
          {flowCards.map(
            (c) =>
              can(c.permission) && (
                <article key={c.to} className="wf-card wf-card--flat">
                  <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
                    {c.title}
                  </h3>
                  <p className="wf-card-desc">{c.desc}</p>
                  <Link className="wf-card-link" to={c.to}>
                    Open →
                  </Link>
                </article>
              ),
          )}
        </div>
      </section>

      {can('page:employees') ? (
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
                {scoped.slice(0, 5).map((e) => (
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
    </div>
  )
}
