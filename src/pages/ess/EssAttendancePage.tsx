import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { DashboardKpiCard } from '../../components/dashboard/DashboardKpiCard'
import { DataListPanel } from '../../components/hrms/DataListPanel'
import { ATTENDANCE_POLICY, WIREFRAME_TODAY } from '../../data/attendanceMock'
import { getEssAttendance } from '../../data/essSeed'
import { useListControls } from '../../hooks/useListControls'
import type { StatusFilter } from '../../hooks/useListControls'
import {
  attendanceRatePercent,
  formatTodayStatus,
  isAttended,
  logsInLastDays,
} from '../../utils/attendanceStats'
import '../../styles/dashboard.css'
import '../pages.css'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half day' },
  { value: 'absent', label: 'Absent' },
  { value: 'on_leave', label: 'On leave' },
]

export function EssAttendancePage() {
  const { actorEmployeeId } = useAuth()
  const allLogs = actorEmployeeId ? getEssAttendance(actorEmployeeId) : []
  const [viewDate, setViewDate] = useState(WIREFRAME_TODAY)

  const todayLogs = useMemo(() => allLogs.filter((l) => l.date === WIREFRAME_TODAY), [allLogs])
  const last7Logs = useMemo(() => logsInLastDays(allLogs, WIREFRAME_TODAY, 7), [allLogs])
  const last30Logs = useMemo(() => logsInLastDays(allLogs, WIREFRAME_TODAY, 30), [allLogs])

  const rate7 = attendanceRatePercent(last7Logs)
  const rate30 = attendanceRatePercent(last30Logs)
  const attended7 = last7Logs.filter((l) => isAttended(l.status)).length
  const attended30 = last30Logs.filter((l) => isAttended(l.status)).length

  const dateFiltered = useMemo(
    () => (viewDate ? allLogs.filter((l) => l.date === viewDate) : allLogs),
    [allLogs, viewDate],
  )

  const list = useListControls(dateFiltered, {
    searchFn: (l, q) =>
      l.date.includes(q) ||
      l.status.includes(q) ||
      l.source.includes(q) ||
      (l.note?.toLowerCase().includes(q) ?? false),
    statusFn: (l, f) => (f === 'all' ? true : l.status === f),
    sortFns: {
      date: (a, b) => b.date.localeCompare(a.date),
      status: (a, b) => a.status.localeCompare(b.status),
    },
    defaultSortColumn: 'date',
  })

  const hasDateFilter = viewDate !== WIREFRAME_TODAY
  const hasActiveFilters = list.hasActiveFilters || hasDateFilter

  function resetAll() {
    list.resetFilters()
    setViewDate(WIREFRAME_TODAY)
  }

  return (
    <div>
      <h2 className="wf-h2">My attendance</h2>
      <p className="wf-lead">
        Standard day {ATTENDANCE_POLICY.standardHours}h ({ATTENDANCE_POLICY.coreStart}–
        {ATTENDANCE_POLICY.coreEnd}). Demo today: <strong>{WIREFRAME_TODAY}</strong>.
      </p>

      <section className="hrms-kpi-grid" style={{ marginBottom: '1.25rem' }} aria-label="My attendance summary">
        <DashboardKpiCard
          static
          label="Today"
          value={formatTodayStatus(todayLogs)}
          subtext={
            todayLogs[0]
              ? `${todayLogs[0].checkIn} – ${todayLogs[0].checkOut} · ${todayLogs[0].hoursWorked}h`
              : 'No punch recorded'
          }
          icon={<i className="ri-calendar-check-line" />}
          tone="primary"
        />
        <DashboardKpiCard
          static
          label="Last 7 days"
          value={`${rate7}%`}
          subtext={`${attended7} of ${last7Logs.length} days attended`}
          icon={<i className="ri-bar-chart-grouped-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="Last 30 days"
          value={`${rate30}%`}
          subtext={`${attended30} of ${last30Logs.length} days attended`}
          icon={<i className="ri-line-chart-line" />}
          tone="info"
        />
      </section>

      <DataListPanel
        title={viewDate === WIREFRAME_TODAY ? "Today's log" : `Log for ${viewDate}`}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search date, status, source, or note..."
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        statusOptions={STATUS_OPTIONS}
        extraFilters={
          <label className="hrms-ref-date-field">
            <span className="hrms-sr-only">View date</span>
            <input
              type="date"
              className="hrms-ref-select hrms-ref-date-input"
              value={viewDate}
              max={WIREFRAME_TODAY}
              onChange={(e) => {
                setViewDate(e.target.value || WIREFRAME_TODAY)
                list.setPage(1)
              }}
              aria-label="Attendance date"
            />
          </label>
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetAll}
        firstItem={list.firstItem}
        lastItem={list.lastItem}
        total={list.total}
        page={list.page}
        totalPages={list.totalPages}
        pageSize={list.pageSize}
        onPageSizeChange={list.setPageSize}
        onPageChange={list.setPage}
      >
        <div className="hrms-data-table-wrap">
          <table className="hrms-data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>In</th>
                <th>Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Source</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="hrms-empty">
                    No records for this date and filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((l) => (
                  <tr key={l.id}>
                    <td>{l.date}</td>
                    <td>{l.checkIn}</td>
                    <td>{l.checkOut}</td>
                    <td>{l.hoursWorked}</td>
                    <td>
                      <span
                        className={`wf-pill wf-pill--${
                          l.status === 'present' || l.status === 'late' ? 'active' : 'inactive'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td>{l.source}</td>
                    <td>{l.note ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>

      <button
        type="button"
        className="wf-btn wf-btn--ghost"
        style={{ marginTop: '1rem' }}
        onClick={() => alert('Wireframe: mark attendance for today')}
      >
        Mark today (mock)
      </button>
    </div>
  )
}
