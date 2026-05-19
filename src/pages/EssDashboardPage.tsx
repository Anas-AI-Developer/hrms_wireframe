import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getEmployee } from '../data/mock'
import './pages.css'

export function EssDashboardPage() {
  const { user, actorEmployeeId } = useAuth()
  const profile = actorEmployeeId ? getEmployee(actorEmployeeId) : undefined

  return (
    <div className="wf-page">
      <h1 className="wf-h1">Employee self-service</h1>
      <p className="wf-lead">
        Portal for staff designations — profile, leave, attendance, and payslip (modules coming in next phases).
      </p>

      {profile ? (
        <div className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Your profile</div>
          <p className="wf-card-stat" style={{ fontSize: '1.25rem' }}>
            {profile.firstName} {profile.lastName}
          </p>
          <p className="wf-card-desc">
            {profile.employeeNo} · {profile.sanctionedPost ?? '—'} · {profile.location}
          </p>
        </div>
      ) : null}

      <div className="wf-grid wf-grid--3" style={{ marginTop: '1.25rem' }}>
        <article className="wf-card">
          <h2 className="wf-h2">My leave</h2>
          <p className="wf-card-desc">Request Casual, Sick, Annual, or Emergency leave.</p>
          <span className="wf-pill">Planned</span>
        </article>
        <article className="wf-card">
          <h2 className="wf-h2">My attendance</h2>
          <p className="wf-card-desc">View logs and mark attendance (sheet import for HR).</p>
          <span className="wf-pill">Planned</span>
        </article>
        <article className="wf-card">
          <h2 className="wf-h2">My payslip</h2>
          <p className="wf-card-desc">UI payslip — monthly after payroll run.</p>
          <span className="wf-pill">Planned</span>
        </article>
      </div>

      <p className="wf-note" style={{ marginTop: '1rem' }}>
        Signed in as <strong>{user?.displayName}</strong>. Leadership and HR use the{' '}
        <Link to="/dashboard">main dashboard</Link>.
      </p>
    </div>
  )
}
