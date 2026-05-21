import { Link, Navigate } from 'react-router-dom'
import { useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { DashboardCharts } from '../components/dashboard/DashboardCharts'
import { DashboardContractsSection } from '../components/dashboard/DashboardContractsSection'
import { DashboardJobTypesSection } from '../components/dashboard/DashboardJobTypesSection'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { EmployeeDataCard } from '../components/dashboard/EmployeeDataCard'
import { PageBreadcrumb } from '../components/hrms/PageBreadcrumb'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { useWireframeData } from '../data/WireframeDataContext'
import { portalForUser } from '../portals/portalConfig'
import { homePathForRole } from '../portals/homePath'
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
  const { departments, getDepartment } = useWireframeData()

  if (!user) return null
  if (user.role === 'employee') {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  const portal = portalForUser(user.role)
  const canEmployees = can('page:employees')
  const canReports = can('page:reports:attendance')
  const scoped = visibleEmployees()
  const active = scoped.filter((e) => e.status === 'active').length
  const onLeave = scoped.filter((e) => e.status === 'on_leave').length
  const inactive = scoped.filter((e) => e.status === 'inactive').length

  const centreName = useMemo(
    () => (departmentId: string) => getDepartment(departmentId)?.name ?? '—',
    [getDepartment],
  )

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
          </div>
          <time className="hrms-dash-welcome__date" dateTime={new Date().toISOString().slice(0, 10)}>
            {todayLabel()}
          </time>
        </div>
      </header>

      <div className="hrms-dash-stack">
        <section className="hrms-dash-top" aria-label="Key metrics">
          <EmployeeDataCard employees={scoped} canViewList={canEmployees} />
          <div className="hrms-dash-top__kpis">
            <DashboardKpiCard
              static
              compact
              label="Active staff"
              value={active}
              subtext="In scope"
              icon={<i className="ri-user-follow-line" />}
              tone="success"
            />
            <DashboardKpiCard
              static
              compact
              label="On leave"
              value={onLeave}
              subtext="Current"
              icon={<i className="ri-calendar-check-line" />}
              tone="warning"
              footnote={
                can('page:leave') ? (
                  <Link to="/leave" className="hrms-kpi-card__link">
                    Leave →
                  </Link>
                ) : undefined
              }
            />
            <DashboardKpiCard
              static
              compact
              label="Centres"
              value={departments.length}
              subtext={`${inactive} inactive`}
              icon={<i className="ri-building-4-line" />}
              tone="info"
            />
          </div>
        </section>

        <DashboardJobTypesSection employees={scoped} canViewList={canEmployees} />

        <DashboardContractsSection employees={scoped} centreName={centreName} />

        <DashboardCharts
          scoped={scoped}
          active={active}
          onLeave={onLeave}
          inactive={inactive}
          canReports={canReports}
        />

        {canEmployees ? (
          <section className="hrms-dash-recent" aria-labelledby="recent-employees-title">
            <div className="hrms-dash-recent__head">
              <h2 id="recent-employees-title">Recent employees</h2>
              <Link to="/employees" className="hrms-dash-recent__link">
                View all →
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
                          <code className="hrms-dash-recent__code">{e.employeeNo}</code>
                        </td>
                        <td className="font-medium">
                          {e.firstName} {e.lastName}
                        </td>
                        <td>{e.sanctionedPost ?? '—'}</td>
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
  )
}
