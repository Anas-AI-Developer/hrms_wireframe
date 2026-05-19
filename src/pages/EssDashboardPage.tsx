import { useAuth } from '../auth/AuthContext'
import { userRoleLabel } from '../auth/roleLabels'
import { getEmployee } from '../data/mock'
import './pages.css'
import '../components/PortalHomePanel.css'

const ESS_MODULES = [
  {
    title: 'My leave',
    desc: 'Request Casual, Sick, Annual, or Emergency leave.',
    status: 'Planned',
  },
  {
    title: 'My attendance',
    desc: 'View logs and mark attendance (sheet import for HR).',
    status: 'Planned',
  },
  {
    title: 'My payslip',
    desc: 'UI payslip — monthly after payroll run.',
    status: 'Planned',
  },
  {
    title: 'My profile',
    desc: 'Personal details, documents, and contact information.',
    status: 'Planned',
  },
] as const

export function EssDashboardPage() {
  const { user, actorEmployeeId, can } = useAuth()
  const profile = actorEmployeeId ? getEmployee(actorEmployeeId) : undefined

  return (
    <div className="hrms-ref-page wf-page--portal">
      <header className="hrms-portal-hero">
        <span className="hrms-portal-hero__badge">Employee self-service</span>
        <h1 className="hrms-portal-hero__title">Staff portal</h1>
        <p className="hrms-portal-hero__lead">
          Portal for operational designations — profile, leave, attendance, and payslip. Signed in as{' '}
          <strong>{user ? userRoleLabel(user.role, user.designation) : '—'}</strong>.
        </p>
      </header>

      {profile ? (
        <div className="hrms-portal-panel" style={{ maxWidth: '42rem', marginBottom: '1.25rem' }}>
          <header className="hrms-portal-panel__header">
            <h2 className="hrms-portal-panel__title">Your profile</h2>
            <p className="hrms-portal-panel__subtitle">
              {profile.firstName} {profile.lastName} · {profile.employeeNo} ·{' '}
              {profile.sanctionedPost ?? '—'} · {profile.location}
            </p>
          </header>
        </div>
      ) : null}

      <div className="wf-grid wf-grid--3">
        {ESS_MODULES.map((mod) => (
          <article key={mod.title} className="wf-card">
            <h2 className="wf-h2">{mod.title}</h2>
            <p className="wf-card-desc">{mod.desc}</p>
            <span className="wf-pill">{mod.status}</span>
          </article>
        ))}
      </div>

      <p className="wf-note" style={{ marginTop: '1.25rem' }}>
        Leadership and HR roles use separate portals — sign in with a directorate or executive account to
        open the main HR dashboard.
      </p>
    </div>
  )
}
