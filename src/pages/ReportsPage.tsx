import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { Permission } from '../auth/types'
import './pages.css'

type ReportCard = {
  id: string
  title: string
  desc: string
  href: string
  permission: Permission
  sprint4?: boolean
}

const reports: ReportCard[] = [
  {
    id: 's4-att',
    title: 'Attendance analytics',
    desc: 'Monthly present, absent, late — by centre',
    href: '/reports/attendance',
    permission: 'page:reports:attendance',
    sprint4: true,
  },
  {
    id: 's4-pay',
    title: 'Payroll register',
    desc: 'Gross, deductions, net by centre',
    href: '/reports/payroll',
    permission: 'page:reports:payroll',
    sprint4: true,
  },
  {
    id: 's4-emp',
    title: 'Employee analytics',
    desc: 'Headcount, vacant posts, employment mix',
    href: '/reports/employees',
    permission: 'page:reports:employees',
    sprint4: true,
  },
  { id: 'r1', title: 'Headcount (roster)', desc: 'Active, on leave, vacant posts', href: '/employees', permission: 'page:employees' },
  { id: 'r2', title: 'Attendance log', desc: 'Daily logs and import', href: '/attendance', permission: 'page:attendance' },
  { id: 'r3', title: 'Leave utilization', desc: 'By type and department', href: '/leave', permission: 'page:leave' },
  { id: 'r4', title: 'Payroll runs', desc: 'Process and post monthly payroll', href: '/payroll', permission: 'page:payroll' },
  { id: 'r5', title: 'Recruitment funnel', desc: 'Applications to hire conversion', href: '/recruitment', permission: 'page:recruitment' },
  { id: 'r6', title: 'Appraisal status', desc: 'Open cycles and completion', href: '/performance', permission: 'page:performance' },
  { id: 'r7', title: 'Training uptake', desc: 'Nominations and completions', href: '/training', permission: 'page:training' },
  { id: 'r8', title: 'Compliance calendar', desc: 'Due filings and status', href: '/compliance', permission: 'page:compliance' },
]

export function ReportsPage() {
  const { can } = useAuth()
  const visible = reports.filter((r) => can(r.permission))
  const sprint4 = visible.filter((r) => r.sprint4)
  const modules = visible.filter((r) => !r.sprint4)

  return (
    <div className="wf-page">
      <h1 className="wf-h1">Reports</h1>
      <p className="wf-lead">Sprint 4 analytics and links to operational modules (filtered by your role).</p>

      {sprint4.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Analytics (Sprint 4)</h2>
          <div className="wf-grid wf-grid--2">
            {sprint4.map((r) => (
              <article key={r.id} className="wf-card">
                <h3 className="wf-h2">{r.title}</h3>
                <p className="wf-card-desc">{r.desc}</p>
                <Link className="wf-card-link" to={r.href}>
                  Open report →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {modules.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Module screens</h2>
          <div className="wf-grid wf-grid--2">
            {modules.map((r) => (
              <article key={r.id} className="wf-card wf-card--flat">
                <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
                  {r.title}
                </h3>
                <p className="wf-card-desc">{r.desc}</p>
                <Link className="wf-card-link" to={r.href}>
                  Open module →
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

