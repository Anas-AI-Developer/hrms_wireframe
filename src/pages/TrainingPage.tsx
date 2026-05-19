import { useAuth } from '../auth/AuthContext'
import { trainingCatalog, trainingEnrollments } from '../data/trainingMock'
import './pages.css'

export function TrainingPage() {
  const { can, user, actorEmployeeId } = useAuth()
  const canManage = can('page:training:manage')
  const canEnroll = can('training.enroll')
  const isEmployee = user?.role === 'employee'

  const myEnrollments = actorEmployeeId
    ? trainingEnrollments.filter((e) => e.employeeId === actorEmployeeId)
    : []

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Training</h1>
      <p className="wf-lead">
        HR maintains the catalogue; employees and managers nominate seats; completions sync to the employee record.
      </p>

      {canManage ? (
        <section className="wf-section">
          <h2 className="wf-h2">Training catalogue (HR)</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Provider</th>
                  <th>Seats</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trainingCatalog.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.provider}</td>
                    <td>
                      {t.enrolled}/{t.capacity}
                    </td>
                    <td>
                      <span className={`wf-pill wf-pill--${t.status === 'open' ? 'active' : 'inactive'}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: add course')}>
            Add course (mock)
          </button>
        </section>
      ) : null}

      {canEnroll ? (
        <section className="wf-section">
          <h2 className="wf-h2">{isEmployee ? 'Nominate training' : 'Nominations (your scope)'}</h2>
          <div className="wf-grid wf-grid--2">
            {trainingCatalog
              .filter((t) => t.status === 'open')
              .slice(0, 4)
              .map((t) => (
                <article key={t.id} className="wf-card wf-card--flat">
                  <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
                    {t.title}
                  </h3>
                  <p className="wf-card-desc">
                    {t.provider} · {t.durationDays} days
                  </p>
                  <button type="button" className="wf-btn wf-btn--ghost" onClick={() => alert(`Wireframe: nominated for ${t.title}`)}>
                    Nominate (mock)
                  </button>
                </article>
              ))}
          </div>
          {myEnrollments.length > 0 ? (
            <>
              <h3 className="wf-h2" style={{ marginTop: '1.25rem', fontSize: '1rem' }}>
                My nominations
              </h3>
              <ul className="wf-list">
                {myEnrollments.map((e) => (
                  <li key={e.id}>
                    {e.courseTitle} — <span className="wf-pill">{e.status}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      {!canManage && !canEnroll ? (
        <p className="wf-note wf-note--warn">Training administration is restricted to HR roles.</p>
      ) : null}
    </div>
  )
}
