import { Link } from 'react-router-dom'
import type { Employee } from '../../types/hrms'
import { getDepartment } from '../../data/mock'
import { attendanceByCentre } from '../../data/reportsAnalyticsMock'

type BarRow = { label: string; value: number; tone?: 'primary' | 'success' | 'warning' | 'muted' }

function BarChart({ rows, unit = '' }: { rows: BarRow[]; unit?: string }) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="hrms-dash-bar-chart" aria-hidden={rows.length === 0}>
      {rows.map((row) => (
        <li key={row.label} className="hrms-dash-bar-chart__row">
          <span className="hrms-dash-bar-chart__label" title={row.label}>
            {row.label}
          </span>
          <span className="hrms-dash-bar-chart__track">
            <span
              className={`hrms-dash-bar-chart__fill hrms-dash-bar-chart__fill--${row.tone ?? 'primary'}`}
              style={{ width: `${Math.round((row.value / max) * 100)}%` }}
            />
          </span>
          <span className="hrms-dash-bar-chart__value">
            {row.value}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  )
}

const ATTENDANCE_TREND = [
  { month: 'Jan', rate: 94 },
  { month: 'Feb', rate: 95 },
  { month: 'Mar', rate: 93 },
  { month: 'Apr', rate: 96 },
]

function TrendChart() {
  const max = 100
  return (
    <div className="hrms-dash-trend" role="img" aria-label="Attendance rate trend January to April">
      <div className="hrms-dash-trend__bars">
        {ATTENDANCE_TREND.map((point) => (
          <div key={point.month} className="hrms-dash-trend__col">
            <span
              className="hrms-dash-trend__bar"
              style={{ height: `${(point.rate / max) * 100}%` }}
              title={`${point.rate}%`}
            />
            <span className="hrms-dash-trend__pct">{point.rate}%</span>
            <span className="hrms-dash-trend__month">{point.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusDonut({
  active,
  onLeave,
  inactive,
}: {
  active: number
  onLeave: number
  inactive: number
}) {
  const total = active + onLeave + inactive || 1
  const aPct = (active / total) * 100
  const lPct = (onLeave / total) * 100
  const aEnd = aPct
  const lEnd = aEnd + lPct

  return (
    <div className="hrms-dash-donut-wrap">
      <div
        className="hrms-dash-donut"
        style={{
          background: `conic-gradient(
            #059669 0% ${aEnd}%,
            #d97706 ${aEnd}% ${lEnd}%,
            #94a3b8 ${lEnd}% 100%
          )`,
        }}
        role="img"
        aria-label={`Active ${active}, on leave ${onLeave}, inactive ${inactive}`}
      >
        <div className="hrms-dash-donut__hole">
          <span className="hrms-dash-donut__total">{total}</span>
          <span className="hrms-dash-donut__caption">Staff</span>
        </div>
      </div>
      <ul className="hrms-dash-donut-legend">
        <li>
          <span className="hrms-dash-donut-legend__swatch hrms-dash-donut-legend__swatch--active" />
          Active <strong>{active}</strong>
        </li>
        <li>
          <span className="hrms-dash-donut-legend__swatch hrms-dash-donut-legend__swatch--leave" />
          On leave <strong>{onLeave}</strong>
        </li>
        <li>
          <span className="hrms-dash-donut-legend__swatch hrms-dash-donut-legend__swatch--inactive" />
          Inactive <strong>{inactive}</strong>
        </li>
      </ul>
    </div>
  )
}

function centreBarsFromEmployees(scoped: Employee[]): BarRow[] {
  const counts = new Map<string, number>()
  for (const e of scoped) {
    const name = getDepartment(e.departmentId)?.name ?? 'Other'
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value }))
}

type DashboardChartsProps = {
  scoped: Employee[]
  active: number
  onLeave: number
  inactive: number
  canReports: boolean
}

export function DashboardCharts({
  scoped,
  active,
  onLeave,
  inactive,
  canReports,
}: DashboardChartsProps) {
  const centreRows = centreBarsFromEmployees(scoped)
  const attendanceRows: BarRow[] = attendanceByCentre.map((r) => ({
    label: r.centre.replace('Regional — ', ''),
    value: parseFloat(r.attendanceRate),
    tone: 'success' as const,
  }))

  return (
    <section className="hrms-dash-charts" aria-label="Analytics overview">
      <article className="hrms-ref-panel hrms-dash-chart-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Employee status</h2>
        </header>
        <div className="hrms-ref-panel-body">
          <StatusDonut active={active} onLeave={onLeave} inactive={inactive} />
        </div>
      </article>

      <article className="hrms-ref-panel hrms-dash-chart-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Staff by centre</h2>
        </header>
        <div className="hrms-ref-panel-body">
          {centreRows.length > 0 ? (
            <BarChart rows={centreRows} />
          ) : (
            <p className="hrms-dash-chart-empty">No roster data in your scope.</p>
          )}
        </div>
      </article>

      <article className="hrms-ref-panel hrms-dash-chart-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Attendance rate by centre</h2>
          <p className="hrms-ref-panel-desc">April 2026 (sample)</p>
        </header>
        <div className="hrms-ref-panel-body">
          <BarChart rows={attendanceRows} unit="%" />
        </div>
      </article>

      <article className="hrms-ref-panel hrms-dash-chart-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Attendance trend</h2>
          <p className="hrms-ref-panel-desc">Monthly rate (%)</p>
        </header>
        <div className="hrms-ref-panel-body">
          <TrendChart />
          {canReports ? (
            <Link to="/reports/attendance" className="hrms-dash-chart-link">
              Open attendance report →
            </Link>
          ) : null}
        </div>
      </article>
    </section>
  )
}

