import { Link } from 'react-router-dom'
import { ONBOARDING_TASKS, onboardingCases } from '../data/onboardingMock'
import './pages.css'

export function OnboardingPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Onboarding</h1>
      <p className="wf-lead">
        After offer acceptance, HR completes pre-join tasks then creates the employee record (EMP-####) with manager and
        department.
      </p>
      <div className="wf-grid wf-grid--2" style={{ marginBottom: '1.25rem' }}>
        <article className="wf-card wf-card--flat">
          <h2 className="wf-h2">Checklist template</h2>
          <ol className="wf-list wf-list--ordered">
            {ONBOARDING_TASKS.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
        </article>
        <article className="wf-card wf-card--flat">
          <h2 className="wf-h2">Hand-off</h2>
          <p className="wf-card-desc">
            Completed onboarding opens <Link to="/employees/new">New employee</Link> with pre-filled name and post.
            Exits use inactive status — records are not deleted.
          </p>
        </article>
      </div>
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Post</th>
              <th>Centre</th>
              <th>Join date</th>
              <th>Progress</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {onboardingCases.map((o) => (
              <tr key={o.id}>
                <td>{o.candidateName}</td>
                <td>{o.jobTitle}</td>
                <td>{o.department}</td>
                <td>{o.expectedJoinDate}</td>
                <td>
                  {o.tasksCompleted}/{o.tasksTotal}
                </td>
                <td><span className={`wf-pill wf-pill--${o.status === 'completed' ? 'active' : 'inactive'}`}>{o.status}</span></td>
                <td>
                  {o.employeeId ? (
                    <Link to={`/employees/${o.employeeId}`}>View employee</Link>
                  ) : (
                    <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: create employee')}>
                      Create record
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
