import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Permission } from '../auth/types'
import './pages.css'

const reports: { id: string; title: string; desc: string; href: string; permission: Permission }[] = [
  { id: 'r1', title: 'Headcount by centre', desc: 'Active, on leave, vacant posts', href: '/employees', permission: 'page:employees' },
  { id: 'r2', title: 'Attendance summary', desc: 'Present, absent, late — by month', href: '/attendance', permission: 'page:attendance' },
  { id: 'r3', title: 'Leave utilization', desc: 'By type and department', href: '/leave', permission: 'page:leave' },
  { id: 'r4', title: 'Payroll register', desc: 'Gross, deductions, net by run', href: '/payroll', permission: 'page:payroll' },
  { id: 'r5', title: 'Recruitment funnel', desc: 'Applications to hire conversion', href: '/recruitment', permission: 'page:recruitment' },
  { id: 'r6', title: 'Appraisal status', desc: 'Open cycles and completion', href: '/performance', permission: 'page:performance' },
  { id: 'r7', title: 'Training uptake', desc: 'Nominations and completions', href: '/training', permission: 'page:training' },
  { id: 'r8', title: 'Compliance calendar', desc: 'Due filings and status', href: '/compliance', permission: 'page:compliance' },
]

export function ReportsPage() {
  const { can } = useAuth()
  const visible = reports.filter((r) => can(r.permission))

  return (
    <div className="wf-page">
      <h1 className="wf-h1">Reports</h1>
      <p className="wf-lead">Executive and module reports (wireframe links to live stubs where available).</p>
      <div className="wf-grid wf-grid--2">
        {visible.map((r) => (
          <article key={r.id} className="wf-card">
            <h2 className="wf-h2">{r.title}</h2>
            <p className="wf-card-desc">{r.desc}</p>
            <Link className="wf-card-link" to={r.href}>
              Open related module →
            </Link>
          </article>
        ))}
      </div>
    </div>
  )
}
