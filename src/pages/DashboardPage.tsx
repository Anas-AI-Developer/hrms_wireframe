import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { userRoleLabel } from '../auth/roleLabels'
import { PageBreadcrumb } from '../components/hrms/PageBreadcrumb'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { DASHBOARD_QUICK_HR } from '../components/dashboard/dashboardQuickLinks'
import { QuickAccessGrid } from '../components/dashboard/QuickAccessGrid'
import { PortalHomePanel } from '../components/PortalHomePanel'
import { departments, employees } from '../data/mock'
import {
  PORTAL_ADMIN_LINKS,
  PORTAL_HR_LINKS,
  PORTAL_PLANNING_LINKS,
  portalForUser,
} from '../portals/portalConfig'
import { homePathForRole } from '../portals/homePath'
import '../components/PortalHomePanel.css'
import '../styles/dashboard.css'

function todayLabel(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const { can, visibleEmployees, user } = useAuth()

  if (!user) return null
  if (user.role === 'employee') {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  const portal = portalForUser(user.role)
  const canEmployees = can('page:employees')
  const canDepartments = can('page:departments')
  const canPayroll = can('payroll.view')
  const scoped = visibleEmployees()
  const active = scoped.filter((e) => e.status === 'active').length
  const onLeave = scoped.filter((e) => e.status === 'on_leave').length
  const inactive = scoped.filter((e) => e.status === 'inactive').length
  const fillRate =
    scoped.length > 0 ? Math.round((active / scoped.length) * 100) : 0

  return (
    <div className="hrms-ref-page hrms-dash-page">
      <header className="hrms-dash-page-header">
        <PageBreadcrumb current="Dashboard" />
        <div className="hrms-dash-welcome">
          <div>
            {portal?.tagline ? (
              <span className="hrms-dash-welcome__badge">{portal.tagline}</span>
            ) : null}
            <h1 className="hrms-dash-welcome__title">Dashboard</h1>
            <p className="hrms-dash-welcome__lead">
              Welcome back, <strong>{user.displayName}</strong> â€”{' '}
              {userRoleLabel(user.role, user.designation)}. Overview of workforce and HR modules
              (wireframe data from client MasterList).
            </p>
          </div>
          <time className="hrms-dash-welcome__date" dateTime={new Date().toISOString().slice(0, 10)}>
            {todayLabel()}
          </time>
        </div>
      </header>

      <div className="hrms-dash-stack">
        <section className="hrms-kpi-grid" aria-label="Key metrics">
          <DashboardKpiCard
            label="Workforce (your scope)"
            value={scoped.length}
            subtext={`${departments.length} centres in sample data`}
            icon={<i className="ri-team-line" />}
            tone="primary"
            footnote={
              <span>
                <span className="hrms-trend-up">{fillRate}% active</span>
                <span className="hrms-trend-muted"> Â· wireframe scope</span>
              </span>
            }
            to={canEmployees ? '/employees' : undefined}
            linkLabel={canEmployees ? 'View roster' : undefined}
          />
          <DashboardKpiCard
            label="Active staff"
            value={active}
            subtext="Filled posts in scope"
            icon={<i className="ri-user-follow-line" />}
            tone="success"
            footnote={<span className="hrms-trend-muted">Status: active</span>}
          />
          <DashboardKpiCard
            label="On leave"
            value={onLeave}
            subtext="Approved / current leave"
            icon={<i className="ri-calendar-check-line" />}
            tone="warning"
            footnote={
              can('page:leave') ? (
                <Link to="/leave" className="hrms-kpi-card__link" style={{ marginTop: 0 }}>
                  Leave requests â†’
                </Link>
              ) : (
                <span className="hrms-trend-muted">Leave module</span>
              )
            }
          />
          <DashboardKpiCard
            label={canPayroll ? 'Payroll sample' : 'Organisation'}
            value={canPayroll ? employees.length : departments.length}
            subtext={
              canPayroll
                ? 'Roster rows for registers'
                : `${inactive} inactive in scope`
            }
            icon={<i className={canPayroll ? 'ri-money-dollar-circle-line' : 'ri-building-4-line'} />}
            tone="info"
            to={canPayroll ? '/master-data' : canDepartments ? '/departments' : undefined}
            linkLabel={canPayroll ? 'Workbook' : canDepartments ? 'Departments' : undefined}
          />
        </section>

        <QuickAccessGrid title="Human Resources" items={DASHBOARD_QUICK_HR} />

        <div className="hrms-dash-columns">
          <div className="hrms-dash-panel-wrap">
            <PortalHomePanel
              panelTitle="Human Resources"
              panelSubtitle="Choose a section to manage HR records, attendance, and leave."
              sections={[
                { title: 'Core HR', accent: 'administration', links: PORTAL_HR_LINKS },
                { title: 'Planning', accent: 'overview', links: PORTAL_PLANNING_LINKS },
                { title: 'Configuration', accent: 'administration', links: PORTAL_ADMIN_LINKS },
              ]}
            />
          </div>

          {canEmployees ? (
            <section className="hrms-dash-recent" aria-labelledby="recent-employees-title">
              <div className="hrms-dash-recent__head">
                <h2 id="recent-employees-title">Recent employees</h2>
                <Link to="/employees" className="hrms-dash-recent__link">
                  View all â†’
                </Link>
              </div>
              <div className="hrms-dash-recent__body">
                <div className="hrms-data-table-wrap">
                  <table className="hrms-data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Post</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scoped.slice(0, 8).map((e) => (
                        <tr key={e.id}>
                          <td>
                            <Link to={`/employees/${e.id}`} style={{ color: '#2f4798', fontWeight: 500 }}>
                              {e.employeeNo}
                            </Link>
                          </td>
                          <td className="font-medium">
                            {e.firstName} {e.lastName}
                          </td>
                          <td>{e.sanctionedPost ?? 'â€”'}</td>
                          <td>
                            <StatusBadge status={e.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  )
}
