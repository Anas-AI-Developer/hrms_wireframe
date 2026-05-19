import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { appraisalCycles, performanceGoals } from '../data/performanceMock'
import './pages.css'

export function PerformancePage() {
  const { can, user, actorEmployeeId } = useAuth()
  const canManage = can('page:performance:manage')
  const canAppraise = can('performance.appraise')
  const isEmployee = user?.role === 'employee'

  const myGoals = actorEmployeeId
    ? performanceGoals.filter((g) => g.employeeId === actorEmployeeId)
    : []

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Performance</h1>
      <p className="wf-lead">
        Annual cycle: HR opens appraisal → employee self-assessment → manager rating → HR sign-off. Access depends on
        your system role.
      </p>
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        <span className="wf-pill wf-pill--active">1. Cycle setup (HR)</span>
        <span>→</span>
        <span className="wf-pill">2. Self-assessment</span>
        <span>→</span>
        <span className="wf-pill">3. Manager appraisal</span>
        <span>→</span>
        <span className="wf-pill">4. Close cycle</span>
      </div>

      {canManage ? (
        <section className="wf-section">
          <h2 className="wf-h2">Appraisal cycles (HR)</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {appraisalCycles.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>
                      {c.startDate} – {c.endDate}
                    </td>
                    <td>
                      <span className={`wf-pill wf-pill--${c.status === 'open' ? 'active' : 'inactive'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: open cycle')}>
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="wf-btn wf-btn--primary"
            style={{ marginTop: '0.75rem' }}
            onClick={() => alert('Wireframe: new appraisal cycle')}
          >
            New cycle (mock)
          </button>
        </section>
      ) : null}

      {canAppraise && !isEmployee ? (
        <section className="wf-section">
          <h2 className="wf-h2">Team appraisals (manager)</h2>
          <p className="wf-card-desc">Rate direct reports in your scope after self-assessment is submitted.</p>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal</th>
                  <th>Self rating</th>
                  <th>Manager rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {performanceGoals.slice(0, 8).map((g) => (
                  <tr key={g.id}>
                    <td>
                      <Link to={`/employees/${g.employeeId}`}>{g.employeeName}</Link>
                    </td>
                    <td>{g.goalTitle}</td>
                    <td>{g.selfRating ?? '—'}</td>
                    <td>{g.managerRating ?? '—'}</td>
                    <td>
                      <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: submit rating')}>
                        Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {isEmployee || can('performance.self_review') ? (
        <section className="wf-section">
          <h2 className="wf-h2">My goals & self-assessment</h2>
          {myGoals.length === 0 ? (
            <p className="wf-note">No goals linked to your account in this demo.</p>
          ) : (
            <div className="wf-table-wrap">
              <table className="wf-table">
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Self rating</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {myGoals.map((g) => (
                    <tr key={g.id}>
                      <td>{g.goalTitle}</td>
                      <td>{g.target}</td>
                      <td>{g.selfRating ?? 'Pending'}</td>
                      <td>
                        <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: save self rating')}>
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {!canManage && !canAppraise && !isEmployee ? (
        <p className="wf-note wf-note--warn">Your role has read-only access to performance summaries via Reports.</p>
      ) : null}
    </div>
  )
}
