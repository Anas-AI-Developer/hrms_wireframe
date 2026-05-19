# noqa - one-off generator
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "pages"

PAYROLL_RUNS = """
import { useAuth } from '../auth/AuthContext'
import { payrollRuns } from '../data/payrollMock'
import './pages.css'

function formatPkr(n: number) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function PayrollRunsPage() {
  const { can } = useAuth()
  const canRun = can('payroll.run')

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Payroll runs</h1>
      <p className="wf-lead">
        Monthly payroll: attendance and leave feed calculation, AAO posts the run, employees view payslip in ESS.
      </p>
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span className="wf-pill wf-pill--active">1. Draft</span>
        <span>→</span>
        <span className="wf-pill wf-pill--active">2. Calculate</span>
        <span>→</span>
        <span className="wf-pill wf-pill--active">3. Post</span>
        <span>→</span>
        <span className="wf-pill">4. Payslips</span>
      </motion.div>
      {canRun ? (
        <button type="button" className="wf-btn wf-btn--primary" style={{ marginBottom: '1rem' }} onClick={() => alert('Wireframe: payroll run')}>
          Start run (mock)
        </button>
      ) : null}
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Status</th>
              <th>Employees</th>
              <th>Gross</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((r) => (
              <tr key={r.id}>
                <td>{r.periodLabel}</td>
                <td><span className={`wf-pill wf-pill--${r.status === 'posted' ? 'active' : 'inactive'}`}>{r.status}</span></td>
                <td>{r.employeeCount}</td>
                <td>{formatPkr(r.grossTotal)}</td>
                <td>{formatPkr(r.netTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
""".replace("motion.", "")

PAYSLIP = """
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getEmployee } from '../data/mock'
import { getPayslipForEmployee } from '../data/payrollMock'
import './pages.css'

function formatPkr(n: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function PayslipPage() {
  const { actorEmployeeId } = useAuth()
  const profile = actorEmployeeId ? getEmployee(actorEmployeeId) : undefined
  const slip = getPayslipForEmployee(actorEmployeeId ?? 'm-1')

  return (
    <div className="wf-page">
      <div className="wf-breadcrumb">
        <Link to="/ess">Self-service</Link>
        <span> / </span>
        <span>Payslip</span>
      </motion.div>
      <h1 className="wf-h1">My payslip</h1>
      <p className="wf-lead">{slip.periodLabel} · Paid {slip.payDate}</p>
      {profile ? (
        <p className="wf-card-desc">
          {profile.firstName} {profile.lastName} · {profile.employeeNo} · {profile.sanctionedPost}
        </p>
      ) : null}
      <article className="wf-card wf-card--flat" style={{ maxWidth: '28rem' }}>
        <div className="wf-card-kicker">Net pay</div>
        <div className="wf-card-stat">{formatPkr(slip.netPay)}</motion.div>
        <table className="wf-table" style={{ marginTop: '1rem' }}>
          <tbody>
            {slip.lines.map((line) => (
              <tr key={line.label}>
                <td>{line.label}</td>
                <td style={{ textAlign: 'right' }}>{formatPkr(Math.abs(line.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <p className="wf-note">Wireframe sample only. Production payslips come from posted payroll runs.</p>
    </motion.div>
  )
}
""".replace("motion.", "")

RECRUITMENT = """
import { Link } from 'react-router-dom'
import { candidates, jobPostings, RECRUITMENT_STAGES } from '../data/recruitmentMock'
import './pages.css'

const stageLabel = Object.fromEntries(RECRUITMENT_STAGES.map((s) => [s.id, s.label]))

export function RecruitmentPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Recruitment</h1>
      <p className="wf-lead">
        HR publishes jobs to the public portal; candidates move through shortlist → interview → offer → onboarding.
      </p>
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {RECRUITMENT_STAGES.map((s, i) => (
          <span key={s.id}>
            {i > 0 ? ' → ' : null}
            <span className="wf-pill">{s.label}</span>
          </span>
        ))}
      </motion.div>
      <section className="wf-section">
        <h2 className="wf-h2">Job postings</h2>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Centre</th>
                <th>BPS</th>
                <th>Vacancies</th>
                <th>Status</th>
                <th>Portal</th>
              </tr>
            </thead>
            <tbody>
              {jobPostings.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td>{j.department}</td>
                  <td>{j.bps}</td>
                  <td>{j.vacancies}</td>
                  <td><span className={`wf-pill wf-pill--${j.status === 'published' ? 'active' : 'inactive'}`}>{j.status}</span></td>
                  <td>{j.portalVisible ? 'Public' : 'Internal draft'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
        <p style={{ marginTop: '0.75rem' }}>
          <button type="button" className="wf-btn wf-btn--primary" onClick={() => alert('Wireframe: publish to job portal')}>
            Publish job (mock)
          </button>
        </p>
      </section>
      <section className="wf-section">
        <h2 className="wf-h2">Candidates (pipeline)</h2>
        <motion.div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job</th>
                <th>Applied</th>
                <th>Stage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const job = jobPostings.find((j) => j.id === c.jobId)
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{job?.title ?? '—'}</td>
                    <td>{c.appliedAt}</td>
                    <td>{stageLabel[c.stage] ?? c.stage}</td>
                    <td>
                      {c.stage === 'offer' ? (
                        <Link className="wf-link-quiet" to="/onboarding">→ Onboarding</Link>
                      ) : (
                        <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: advance stage')}>
                          Advance
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      </section>
    </motion.div>
  )
}
""".replace("motion.", "")

ONBOARDING = """
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
      </motion.div>
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
      </motion.div>
    </motion.div>
  )
}
""".replace("motion.", "")

REPORTS = """
import { Link } from 'react-router-dom'
import './pages.css'

const reports = [
  { id: 'r1', title: 'Headcount by centre', desc: 'Active, on leave, vacant posts', href: '/employees' },
  { id: 'r2', title: 'Attendance summary', desc: 'Present, absent, late — by month', href: '/attendance' },
  { id: 'r3', title: 'Leave utilization', desc: 'By type and department', href: '/leave' },
  { id: 'r4', title: 'Payroll register', desc: 'Gross, deductions, net by run', href: '/payroll' },
  { id: 'r5', title: 'Recruitment funnel', desc: 'Applications to hire conversion', href: '/recruitment' },
]

export function ReportsPage() {
  return (
    <div className="wf-page">
      <h1 className="wf-h1">Reports</h1>
      <p className="wf-lead">Executive and module reports (wireframe links to live stubs where available).</p>
      <div className="wf-grid wf-grid--2">
        {reports.map((r) => (
          <article key={r.id} className="wf-card">
            <h2 className="wf-h2">{r.title}</h2>
            <p className="wf-card-desc">{r.desc}</p>
            <Link className="wf-card-link" to={r.href}>Open related module →</Link>
          </article>
        ))}
      </motion.div>
    </motion.div>
  )
}
""".replace("motion.", "")

PROPOSAL = """
import { Link } from 'react-router-dom'
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
    steps: ['Sheet import (8h day)', 'Attendance log', 'Leave request', 'Manager → HR approval'],
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
    title: 'Payroll & ESS',
    steps: ['Payroll run (AAO)', 'Post payslips', 'Employee self-service portal'],
    links: [
      { label: 'Payroll', to: '/payroll' },
      { label: 'ESS', to: '/ess' },
    ],
  },
]

export function SystemProposalPage() {
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
            {f.links.map((l) => (
              <Link key={l.to} className="wf-card-link" to={l.to}>
                {l.label} →
              </Link>
            ))}
          </motion.div>
        </section>
      ))}
      <p className="wf-note">
        See also <Link to="/modules">Sprint modules</Link>, <Link to="/admin/settings">Admin settings</Link>, and{' '}
        <Link to="/master-data">Client workbook</Link>.
      </p>
    </motion.div>
  )
}
""".replace("motion.", "")


def main() -> None:
    files = {
        "PayrollRunsPage.tsx": PAYROLL_RUNS,
        "PayslipPage.tsx": PAYSLIP,
        "RecruitmentPage.tsx": RECRUITMENT,
        "OnboardingPage.tsx": ONBOARDING,
        "ReportsPage.tsx": REPORTS,
        "SystemProposalPage.tsx": PROPOSAL,
    }
    for name, text in files.items():
        (ROOT / name).write_text(text.strip() + "\n", encoding="utf-8")
        print("wrote", name)


if __name__ == "__main__":
    main()
