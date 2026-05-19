import { Link } from 'react-router-dom'
import './pages.css'

const phases = [
  {
    phase: 'Foundation (wireframe)',
    items: [
      { label: 'Employees & master data', to: '/employees' },
      { label: 'RBAC & admin settings', to: '/admin/rbac' },
      { label: 'Proposed end-to-end flows', to: '/proposal' },
    ],
  },
  {
    phase: 'Operations (wireframe)',
    items: [
      { label: 'Attendance import & logs', to: '/attendance' },
      { label: 'Leave request & approval', to: '/leave' },
      { label: 'Recruitment pipeline', to: '/recruitment' },
      { label: 'Onboarding → employee record', to: '/onboarding' },
    ],
  },
  {
    phase: 'Finance & ESS (wireframe)',
    items: [
      { label: 'Payroll runs (AAO)', to: '/payroll' },
      { label: 'Employee payslip', to: '/payslip' },
      { label: 'Self-service portal', to: '/ess' },
    ],
  },
]

export function RoadmapPage() {
  return (
    <div className="wf-page">
      <h1 className="wf-h1">Planned modules</h1>
      <p className="wf-lead">
        Click through live wireframe stubs by phase. Full sprint breakdown:{' '}
        <Link to="/modules">Sprint modules</Link>.
      </p>

      <div className="wf-roadmap">
        {phases.map((p) => (
          <section key={p.phase} className="wf-roadmap-block">
            <h2 className="wf-h2">{p.phase}</h2>
            <ul>
              {p.items.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
