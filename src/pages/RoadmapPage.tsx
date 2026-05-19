import { Link } from 'react-router-dom'
import './pages.css'

const phases = [
  {
    phase: 'Phase 1 — done in wireframe',
    items: [
      'Shell layout & navigation',
      'Login (NVQF colours) + mock RBAC in sessionStorage',
      'Dashboard snapshot',
      'Employees / departments / designations driven from client MasterList sample',
      'Sprint module catalogue, HQ organogram (PDF), workbook tab index',
    ],
  },
  {
    phase: 'Phase 2 — align with Laravel HRMS',
    items: [
      'Employee documents (see hrms migrations: hrms_employee_documents)',
      'Payroll / projects / centres (hrms_pay_projects_centres)',
      'User management screens (mirror Filament User resources)',
    ],
  },
  {
    phase: 'Phase 3 — your upcoming materials',
    items: ['Leave & attendance', 'Recruitment', 'Reporting', 'Any GIZ-specific workflows you specify'],
  },
]

export function RoadmapPage() {
  return (
    <div className="wf-page">
      <h1 className="wf-h1">Planned modules</h1>
      <p className="wf-lead">
        This page tracks what is stubbed in the wireframe versus what still lives only in the{' '}
        <code>hrms</code> reference project. For the full four-sprint breakdown from the developer guide, open{' '}
        <Link to="/modules">Sprint modules</Link>. Client Excel tabs are indexed under{' '}
        <Link to="/master-data">Client workbook</Link>; HQ structure is under{' '}
        <Link to="/organogram">HQ organogram</Link>.
      </p>

      <div className="wf-roadmap">
        {phases.map((p) => (
          <section key={p.phase} className="wf-roadmap-block">
            <h2 className="wf-h2">{p.phase}</h2>
            <ul>
              {p.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
