import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { ATTENDANCE_POLICY, attendanceLogs, WIREFRAME_TODAY } from '../data/attendanceMock'
import { employmentTypeLabel } from '../data/employmentStats'
import { getEmployee } from '../data/mock'
import { useListControls, type StatusFilter } from '../hooks/useListControls'
import {
  attendanceRatePercent,
  isAttended,
  logsInLastDays,
  summarizeWorkforceToday,
} from '../utils/attendanceStats'
import '../styles/dashboard.css'
import './pages.css'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half day' },
  { value: 'absent', label: 'Absent' },
  { value: 'on_leave', label: 'On leave' },
]

export function AttendanceListPage() {
  const { can, visibleEmployees } = useAuth()
  const canImport = can('page:attendance:import')
  const scoped = visibleEmployees()
  const scopedIds = useMemo(() => new Set(scoped.map((e) => e.id)), [scoped])

  const scopedLogs = useMemo(
    () => attendanceLogs.filter((l) => scopedIds.has(l.employeeId)),
    [scopedIds],
  )

  const [viewDate, setViewDate] = useState(WIREFRAME_TODAY)

  const todayLogs = useMemo(
    () => scopedLogs.filter((l) => l.date === WIREFRAME_TODAY),
    [scopedLogs],
  )
  const last7Logs = useMemo(() => logsInLastDays(scopedLogs, WIREFRAME_TODAY, 7), [scopedLogs])
  const last30Logs = useMemo(() => logsInLastDays(scopedLogs, WIREFRAME_TODAY, 30), [scopedLogs])

  const todaySummary = summarizeWorkforceToday(scoped.length, todayLogs)
  const rate7 = attendanceRatePercent(last7Logs)
  const rate30 = attendanceRatePercent(last30Logs)

  const dateFiltered = useMemo(
    () => (viewDate ? scopedLogs.filter((l) => l.date === viewDate) : scopedLogs),
    [scopedLogs, viewDate],
  )

  const list = useListControls(dateFiltered, {
    searchFn: (l, q) => {
      const emp = getEmployee(l.employeeId)
      if (!emp) return false
      const name = `${emp.firstName} ${emp.lastName}`.toLowerCase()
      return (
        name.includes(q) ||
        emp.employeeNo.toLowerCase().includes(q) ||
        l.date.includes(q) ||
        l.status.includes(q) ||
        (l.note?.toLowerCase().includes(q) ?? false)
      )
    },
    statusFn: (l, f) => {
      if (f === 'all') return true
      return l.status === f
    },
    sortFns: {
      date: (a, b) => b.date.localeCompare(a.date),
      employee: (a, b) => {
        const ea = getEmployee(a.employeeId)
        const eb = getEmployee(b.employeeId)
        const na = ea ? `${ea.firstName} ${ea.lastName}` : ''
        const nb = eb ? `${eb.firstName} ${eb.lastName}` : ''
        return na.localeCompare(nb)
      },
      status: (a, b) => a.status.localeCompare(b.status),
    },
    defaultSortColumn: 'employee',
  })

  const hasDateFilter = viewDate !== WIREFRAME_TODAY
  const hasActiveFilters = list.hasActiveFilters || hasDateFilter

  function resetAll() {
    list.resetFilters()
    setViewDate(WIREFRAME_TODAY)
  }

  return (
    <HrmsListShell
      current="Attendance"
      actions={
        canImport ? (
          <Link className="hrms-btn-primary" to="/attendance/import">
            <i className="ri-upload-2-line" aria-hidden /> Import sheet
          </Link>
        ) : undefined
      }
    >
      <p className="wf-lead" style={{ marginTop: 0, marginBottom: '1rem' }}>
        Fixed <strong>{ATTENDANCE_POLICY.standardHours}h</strong> day ({ATTENDANCE_POLICY.coreStart}–
        {ATTENDANCE_POLICY.coreEnd}). Demo date: <strong>{WIREFRAME_TODAY}</strong>.
      </p>

      <section className="hrms-kpi-grid" style={{ marginBottom: '1.25rem' }} aria-label="Attendance summary">
        <DashboardKpiCard
          static
          label="Today"
          value={`${todaySummary.percent}%`}
          subtext={`${todaySummary.attended} of ${todaySummary.total} staff in scope`}
          icon={<i className="ri-calendar-check-line" />}
          tone="primary"
        />
        <DashboardKpiCard
          static
          label="Last 7 days"
          value={`${rate7}%`}
          subtext={`${last7Logs.filter((l) => isAttended(l.status)).length} of ${last7Logs.length} records`}
          icon={<i className="ri-bar-chart-grouped-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="Last 30 days"
          value={`${rate30}%`}
          subtext={`${last30Logs.length} employee-day records in scope`}
          icon={<i className="ri-line-chart-line" />}
          tone="info"
        />
      </section>

      <DataListPanel
        title={viewDate === WIREFRAME_TODAY ? "Today's attendance log" : `Attendance for ${viewDate}`}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search employee, code, status, or note..."
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
                <th>Employee</th>
                <th>Type</th>
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
                  <td colSpan={9} className="hrms-empty">
                    No attendance records for this date and filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((l) => {
                  const emp = getEmployee(l.employeeId)
                  return (
                    <tr key={l.id}>
                      <td>{l.date}</td>
                      <td>
                        {emp ? (
                          <Link to={`/employees/${emp.id}`} style={{ color: '#2f4798', fontWeight: 500 }}>
                            {emp.firstName} {emp.lastName}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{emp ? employmentTypeLabel(emp.employmentType) : '—'}</td>
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
                          {l.secondaryJob ? ' · 2nd job' : ''}
                        </span>
                      </td>
                      <td>{l.source}</td>
                      <td>{l.note ?? '—'}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>
    </HrmsListShell>
  )
}
