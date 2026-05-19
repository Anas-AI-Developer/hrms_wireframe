import { executiveKpis } from '../data/reportsAnalyticsMock'
import { DashboardKpiCard } from './dashboard/DashboardKpiCard'
import '../styles/dashboard.css'
import '../pages/pages.css'

export function ExecutiveDashboardPanel() {
  const k = executiveKpis

  return (
    <section className="wf-section">
      <h2 className="wf-h2">Executive overview</h2>
      <p className="wf-card-desc" style={{ marginBottom: '1rem' }}>
        Cross-module KPIs for leadership (Sprint 4 wireframe).
      </p>
      <section className="hrms-kpi-grid" aria-label="Executive KPIs">
        <DashboardKpiCard
          static
          label="Workforce"
          value={k.totalActive}
          subtext="Active employees (demo)"
          icon={<i className="ri-team-line" />}
          tone="primary"
        />
        <DashboardKpiCard
          static
          label="Leave pipeline"
          value={k.leavePendingApproval}
          subtext="Pending approvals"
          icon={<i className="ri-calendar-check-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Recruitment"
          value={k.openRecruitment}
          subtext="Open positions"
          icon={<i className="ri-briefcase-line" />}
          tone="info"
        />
        <DashboardKpiCard
          static
          label="Payroll"
          value={k.payrollLastPosted}
          subtext="Last posted period"
          icon={<i className="ri-money-dollar-circle-line" />}
          tone="secondary"
        />
        <DashboardKpiCard
          static
          label="Compliance"
          value={k.complianceDueSoon}
          subtext="Due soon"
          icon={<i className="ri-shield-check-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="Performance"
          value={k.appraisalCycleOpen}
          subtext="Open appraisal cycle"
          icon={<i className="ri-bar-chart-line" />}
          tone="primary"
        />
      </section>
    </section>
  )
}
