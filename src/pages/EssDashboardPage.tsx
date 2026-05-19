import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Permission } from '../auth/types'
import { getEmployee } from '../data/mock'
import './pages.css'

const essLinks: { title: string; desc: string; to: string; permission: Permission }[] = [
  { title: 'My leave', desc: 'Request Casual, Sick, Annual, or Emergency leave.', to: '/leave', permission: 'page:leave' },
  { title: 'My attendance', desc: 'View logs and mark attendance.', to: '/attendance', permission: 'page:attendance' },
  { title: 'My payslip', desc: 'View salary slip after monthly payroll run.', to: '/payslip', permission: 'page:payslip' },
  { title: 'My performance', desc: 'Goals and self-assessment for open cycle.', to: '/performance', permission: 'page:performance' },
  { title: 'My training', desc: 'Nominate for open courses.', to: '/training', permission: 'page:training' },
  { title: 'My benefits', desc: 'View enrolled plans and allowances.', to: '/benefits', permission: 'page:benefits' },
]

export function EssDashboardPage() {
  const { user, actorEmployeeId, can } = useAuth()
  const profile = actorEmployeeId ? getEmployee(actorEmployeeId) : undefined

  return (
    <div className="wf-page">
      <h1 className="wf-h1">Employee self-service</h1>
      <p className="wf-lead">
        Portal for staff — profile, leave, attendance, payslip, performance, training, and benefits.
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
          <Link className="wf-card-link" to={`/employees/${profile.id}`}>
            View full profile →
          </Link>
        </div>
      ) : null}

      <div className="wf-grid wf-grid--3" style={{ marginTop: '1.25rem' }}>
        {essLinks
          .filter((l) => can(l.permission))
          .map((l) => (
            <article key={l.to} className="wf-card">
              <h2 className="wf-h2">{l.title}</h2>
              <p className="wf-card-desc">{l.desc}</p>
              <Link className="wf-card-link" to={l.to}>
                Open →
              </Link>
            </article>
          ))}
      </div>

      <p className="wf-note" style={{ marginTop: '1rem' }}>
        Signed in as <strong>{user?.displayName}</strong>. Leadership and HR use the{' '}
        <Link to="/dashboard">main dashboard</Link>.
      </p>
    </div>
  )
}
