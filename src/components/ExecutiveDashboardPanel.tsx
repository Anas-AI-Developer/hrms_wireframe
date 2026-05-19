import { Link } from 'react-router-dom'
import { executiveKpis } from '../data/reportsAnalyticsMock'
import '../pages/pages.css'

export function ExecutiveDashboardPanel() {
  const k = executiveKpis

  return (
    <section className="wf-section">
      <h2 className="wf-h2">Executive overview</h2>
      <p className="wf-card-desc" style={{ marginBottom: '1rem' }}>
        Cross-module KPIs for leadership (Sprint 4 wireframe).
      </p>
      <div className="wf-grid wf-grid--3">
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Workforce</div>
          <div className="wf-card-stat">{k.totalActive}</div>
          <div className="wf-card-desc">Active employees (demo)</div>
          <Link className="wf-card-link" to="/reports/employees">
            Employee analytics →
          </Link>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Leave pipeline</div>
          <div className="wf-card-stat">{k.leavePendingApproval}</div>
          <div className="wf-card-desc">Pending approvals</div>
          <Link className="wf-card-link" to="/leave/approvals">
            Leave approvals →
          </Link>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Recruitment</div>
          <div className="wf-card-stat">{k.openRecruitment}</div>
          <Link className="wf-card-link" to="/recruitment">
            Open jobs →
          </Link>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Payroll</div>
          <div className="wf-card-desc">Last posted: {k.payrollLastPosted}</div>
          <Link className="wf-card-link" to="/reports/payroll">
            Payroll report →
          </Link>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Compliance</div>
          <div className="wf-card-stat">{k.complianceDueSoon}</div>
          <div className="wf-card-desc">Due soon</div>
          <Link className="wf-card-link" to="/compliance">
            Registers →
          </Link>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Performance</div>
          <div className="wf-card-desc">Cycle: {k.appraisalCycleOpen}</div>
          <Link className="wf-card-link" to="/performance">
            Appraisals →
          </Link>
        </article>
      </div>
      <div className="wf-grid wf-grid--3" style={{ marginTop: '1rem' }}>
        <Link className="wf-btn wf-btn--ghost" to="/reports/attendance">
          Attendance report
        </Link>
        <Link className="wf-btn wf-btn--ghost" to="/reports">
          All reports
        </Link>
        <Link className="wf-btn wf-btn--ghost" to="/proposal">
          System flows
        </Link>
      </div>
    </section>
  )
}
