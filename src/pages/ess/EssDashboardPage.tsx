import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { userRoleLabel } from '../../auth/roleLabels'
import { DashboardKpiCard } from '../../components/dashboard/DashboardKpiCard'
import { getEmployee } from '../../data/mock'
import { useEssSession } from '../../ess/EssSessionContext'
import { LEAVE_TYPE_LABELS } from '../../data/leaveMock'
import '../../styles/dashboard.css'
import '../pages.css'

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatPkr(n: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function EssDashboardPage() {
  const { user, can } = useAuth()
  const { employeeId, metrics, leaveRequests, employeeRequests } = useEssSession()
  const profile = employeeId ? getEmployee(employeeId) : undefined

  if (!profile) {
    return (
      <div className="hrms-dash-page">
        <p className="wf-note wf-note--warn">
          No employee record linked to this login. Use any demo employee account (e.g.{' '}
          <strong>emp.chowkidar</strong> or <strong>emp.deo</strong>) with password{' '}
          <strong>11223344</strong>, then refresh the page.
        </p>
      </div>
    )
  }

  return (
    <div className="hrms-dash-page ess-dash-page">
      <header className="hrms-dash-page-header">
        <div className="hrms-dash-welcome">
          <div>
            <span className="hrms-dash-welcome__badge">Employee self-service</span>
            <h1 className="hrms-dash-welcome__title">Dashboard</h1>
            <p className="hrms-dash-welcome__lead">
              Welcome, <strong>
                {profile.firstName} {profile.lastName}
              </strong>{' '}
              — {user ? userRoleLabel(user.role, user.designation) : 'Employee'}. Cards update live when you submit
              leave or training nominations.
            </p>
          </div>
          <time className="hrms-dash-welcome__date" dateTime={new Date().toISOString().slice(0, 10)}>
            {todayLabel()}
          </time>
        </div>
      </header>

      <div className="hrms-dash-stack">
        <section className="hrms-kpi-grid" aria-label="Self-service summary">
          {can('page:leave') ? (
            <DashboardKpiCard
              static
              label="Pending leave"
              value={metrics.pendingLeave}
              subtext={`${metrics.approvedLeave} approved`}
              icon={<i className="ri-calendar-check-line" />}
              tone="warning"
            />
          ) : null}
          {can('page:attendance') ? (
            <DashboardKpiCard
              static
              label="Attendance (log)"
              value={metrics.presentDays}
              subtext={`${metrics.lateDays} late`}
              icon={<i className="ri-time-line" />}
              tone="success"
            />
          ) : null}
          {can('page:training') ? (
            <DashboardKpiCard
              static
              label="Training"
              value={metrics.trainingTotal}
              subtext={`${metrics.trainingNominated} nominated`}
              icon={<i className="ri-graduation-cap-line" />}
              tone="info"
            />
          ) : null}
          {can('page:payslip') && metrics.payslipPeriod ? (
            <DashboardKpiCard
              static
              label="Last payslip"
              value={metrics.payslipNet != null ? formatPkr(metrics.payslipNet) : '—'}
              subtext={metrics.payslipPeriod}
              icon={<i className="ri-money-dollar-circle-line" />}
              tone="primary"
            />
          ) : null}
          {can('page:performance') ? (
            <DashboardKpiCard
              static
              label="Goals"
              value={metrics.goalsCount}
              subtext={metrics.appraisalCycle}
              icon={<i className="ri-bar-chart-line" />}
              tone="secondary"
            />
          ) : null}
          {can('page:benefits') ? (
            <DashboardKpiCard
              static
              label="Benefits"
              value={metrics.benefitsCount}
              subtext="Active enrollments"
              icon={<i className="ri-heart-pulse-line" />}
              tone="success"
            />
          ) : null}
          {can('page:ess_requests') ? (
            <Link to="/ess/requests" className="hrms-kpi-card-link">
              <DashboardKpiCard
                static
                label="My requests"
                value={employeeRequests.length}
                subtext="Subject · details · dates"
                icon={<i className="ri-file-list-3-line" />}
                tone="primary"
              />
            </Link>
          ) : null}
        </section>

        {leaveRequests.length > 0 ? (
          <section className="hrms-dash-recent" aria-labelledby="ess-recent-leave">
            <div className="hrms-dash-recent__head">
              <h2 id="ess-recent-leave">Recent leave</h2>
            </div>
            <div className="hrms-dash-recent__body">
              <div className="hrms-data-table-wrap">
                <table className="hrms-data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveRequests.slice(0, 4).map((r) => (
                      <tr key={r.id}>
                        <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                        <td>
                          {r.fromDate} → {r.toDate}
                        </td>
                        <td>{r.days}</td>
                        <td>
                          <span className="wf-pill">{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        <p className="wf-note">
          {profile.employeeNo} · {profile.sanctionedPost ?? '—'} ·{' '}
          <Link className="wf-link-quiet" to={`/employees/${profile.id}`}>
            Full profile
          </Link>
        </p>
      </div>
    </div>
  )
}
