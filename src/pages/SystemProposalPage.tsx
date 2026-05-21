import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { canAccessPath } from '../auth/routeAccess'
import './pages.css'

const flows = [
  {
    title: 'Core HR',
    steps: ['Master data import', 'Employee roster', 'Organogram / manager', 'RBAC login'],
    links: [
      { label: 'Employees', to: '/employees' },
      { label: 'RBAC', to: '/admin/rbac' },
    ],
  },
  {
    title: 'Time & leave',
    steps: ['Sheet import (8h day)', 'Attendance log', 'Leave request', 'Status tracking'],
    links: [
      { label: 'Attendance', to: '/attendance' },
      { label: 'Leave', to: '/leave' },
    ],
  },
  {
    title: 'Recruitment → onboarding',
    steps: ['Public job portal', 'Pipeline in HRMS', 'Offer', 'Onboarding checklist', 'Create EMP record'],
    links: [
      { label: 'Recruitment', to: '/recruitment' },
      { label: 'Onboarding', to: '/onboarding' },
    ],
  },
  {
    title: 'Employee self-service',
    steps: ['Staff portal login', 'Leave & attendance', 'Training & performance'],
    links: [{ label: 'ESS', to: '/ess' }],
  },
  {
    title: 'Performance & development',
    steps: ['HR opens cycle', 'Employee self-assessment', 'Manager rating', 'Training nomination'],
    links: [
      { label: 'Performance', to: '/performance' },
      { label: 'Training', to: '/training' },
    ],
  },
]

export function SystemProposalPage() {
  const { user } = useAuth()

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Proposed HRMS flows</h1>
      <p className="wf-lead">
        End-to-end proposal for NAVTTC: one system role (login) separate from designation (MasterList post). This
        wireframe demonstrates screens and hand-offs — not production data counts.
      </p>
      {flows.map((f) => (
        <section key={f.title} className="wf-section wf-card wf-card--flat">
          <h2 className="wf-h2">{f.title}</h2>
          <p className="wf-card-desc">{f.steps.join(' → ')}</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {f.links
              .filter((l) => user && canAccessPath(user.role, l.to))
              .map((l) => (
                <Link key={l.to} className="wf-card-link" to={l.to}>
                  {l.label} →
                </Link>
              ))}
          </div>
        </section>
      ))}
      <p className="wf-note">
        See also{' '}
        {user && canAccessPath(user.role, '/modules') ? (
          <Link to="/modules">Sprint modules</Link>
        ) : (
          'Sprint modules'
        )}
        {user && canAccessPath(user.role, '/admin/settings') ? (
          <>
            , <Link to="/admin/settings">Admin settings</Link>
          </>
        ) : null}
        {user && canAccessPath(user.role, '/master-data') ? (
          <>
            , and <Link to="/master-data">Client workbook</Link>
          </>
        ) : null}
        .
      </p>
    </div>
  )
}
