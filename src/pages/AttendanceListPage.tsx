import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { AttendanceStatusBadge } from '../components/hrms/AttendanceStatusBadge'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import {
  ATTENDANCE_POLICY,
  type AttendanceLog,
  type AttendanceStatus,
  attendanceLogs,
  WIREFRAME_TODAY,
} from '../data/attendanceMock'
import { getEmployee } from '../data/mock'
import { employmentTypeLabel } from '../data/employmentStats'
import { useListControls } from '../hooks/useListControls'
import { isDateInRange } from '../utils/attendanceStats'

type AttendanceStatusFilter = 'all' | AttendanceStatus

function employeeLabel(employeeId: string) {
  const emp = getEmployee(employeeId)
  if (!emp) return ''
  return `${emp.firstName} ${emp.lastName} ${emp.employeeNo}`.toLowerCase()
}

function resolveDateBounds(from: string, to: string, todayOnly: boolean) {
  if (todayOnly) return { from: WIREFRAME_TODAY, to: WIREFRAME_TODAY }
  if (from && !to) return { from, to: from }
  if (!from && to) return { from: to, to }
  return { from, to }
}

function attendanceDateFilterLabel(from: string, to: string, todayOnly: boolean): string | null {
  if (todayOnly) return `Today (${WIREFRAME_TODAY})`
  if (!from && !to) return null
  const bounds = resolveDateBounds(from, to, false)
  if (bounds.from === bounds.to) return bounds.from
  return `${bounds.from} – ${bounds.to}`
}

export function AttendanceListPage() {
  const { can, visibleEmployees } = useAuth()
  const canImport = can('page:attendance:import')
  const scopedLogs = useMemo(() => {
    const scopedIds = new Set(visibleEmployees().map((e) => e.id))
    return attendanceLogs.filter((l) => scopedIds.has(l.employeeId))
  }, [visibleEmployees])

  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusFilter>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)
  const dateFiltered = useMemo(() => {
    if (!todayOnly && !dateFrom && !dateTo) return scopedLogs
    const { from, to } = resolveDateBounds(dateFrom, dateTo, todayOnly)
    return scopedLogs.filter((l) => isDateInRange(l.date, from, to))
  }, [scopedLogs, todayOnly, dateFrom, dateTo])

  const statusFiltered = useMemo(() => {
    if (attendanceStatus === 'all') return dateFiltered
    return dateFiltered.filter((l) => l.status === attendanceStatus)
  }, [dateFiltered, attendanceStatus])

  const hasDateFilter = todayOnly || Boolean(dateFrom || dateTo)

  const todayLogs = useMemo(
    () => scopedLogs.filter((l) => l.date === WIREFRAME_TODAY),
    [scopedLogs],
  )
  const presentCount = todayLogs.filter((l) => l.status === 'present').length
  const lateCount = todayLogs.filter((l) => l.status === 'late').length
  const todayTotal = todayLogs.length

  const list = useListControls(statusFiltered, {
    searchFn: (l, q) => {
      const emp = getEmployee(l.employeeId)
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ''
      return (
        name.includes(q) ||
        l.date.includes(q) ||
        l.status.includes(q) ||
        l.source.includes(q) ||
        employeeLabel(l.employeeId).includes(q)
      )
    },
    sortFns: {
      date: (a, b) => {
        const byDate = a.date.localeCompare(b.date)
        if (byDate !== 0) return byDate
        return employeeLabel(a.employeeId).localeCompare(employeeLabel(b.employeeId))
      },
      employee: (a, b) => employeeLabel(a.employeeId).localeCompare(employeeLabel(b.employeeId)),
      checkIn: (a, b) => a.checkIn.localeCompare(b.checkIn),
      hours: (a, b) => a.hoursWorked - b.hoursWorked,
      status: (a, b) => a.status.localeCompare(b.status),
    },
    defaultSortColumn: 'date',
    defaultSortDir: 'asc',
    defaultPageSize: 15,
  })

  useEffect(() => {
    list.setSort('date', hasDateFilter ? 'desc' : 'asc')
  }, [hasDateFilter, list.setSort])
  const hasActiveFilters =
    list.hasActiveFilters || attendanceStatus !== 'all' || hasDateFilter

  function applyTodayFilter() {
    setTodayOnly(true)
    setDateFrom(WIREFRAME_TODAY)
    setDateTo(WIREFRAME_TODAY)
    list.setPage(1)
  }

  function onDateFromChange(value: string) {
    setTodayOnly(false)
    setDateFrom(value)
    list.setPage(1)
  }

  function onDateToChange(value: string) {
    setTodayOnly(false)
    setDateTo(value)
    list.setPage(1)
  }

  function resetAllFilters() {
    list.resetFilters()
    setAttendanceStatus('all')
    setDateFrom('')
    setDateTo('')
    setTodayOnly(false)
  }

  const dateFilterLabel = attendanceDateFilterLabel(dateFrom, dateTo, todayOnly)
  const logsPanelTitle = dateFilterLabel ? `Attendance logs · ${dateFilterLabel}` : 'Attendance logs'

  return (
    <HrmsListShell
      current="Attendance"
      actions={
        canImport ? (
          <Link to="/attendance/import" className="hrms-btn-primary">
            <i className="ri-upload-2-line" aria-hidden /> Import sheet
          </Link>
        ) : undefined
      }
    >
      <section className="hrms-kpi-grid hrms-attendance-kpis" aria-label="Attendance summary">
        <DashboardKpiCard
          static
          label="Standard day"
          value={`${ATTENDANCE_POLICY.standardHours}h`}
          subtext={`${ATTENDANCE_POLICY.coreStart} – ${ATTENDANCE_POLICY.coreEnd} core hours`}
          icon={<i className="ri-time-line" />}
          tone="primary"
        />
        <DashboardKpiCard
          static
          label="Present today"
          value={presentCount}
          subtext={`${todayTotal} log${todayTotal === 1 ? '' : 's'} on ${WIREFRAME_TODAY}`}
          icon={<i className="ri-user-follow-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="Late arrivals today"
          value={lateCount}
          subtext={lateCount > 0 ? 'After core start' : 'No late punches today'}
          icon={<i className="ri-alarm-warning-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Policy"
          value={ATTENDANCE_POLICY.flexibleTiming ? 'Flexible' : 'Fixed hours'}
          subtext={`Shifts ${ATTENDANCE_POLICY.shiftBased ? 'enabled' : 'not used'} · demo ${WIREFRAME_TODAY}`}
          icon={<i className="ri-shield-check-line" />}
          tone="info"
        />
      </section>

      <DataListPanel
        title={logsPanelTitle}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by employee, date, or status..."
        showStatusFilter={false}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetAllFilters}
        extraFilters={
          <div className="hrms-attendance-date-filters">
            <button
              type="button"
              className={`hrms-ref-btn-today${todayOnly ? ' hrms-ref-btn-today--active' : ''}`}
              onClick={applyTodayFilter}
              aria-pressed={todayOnly}
            >
              <i className="ri-calendar-todo-line" aria-hidden /> Today
            </button>
            <label className="hrms-ref-date-field">
              <span className="hrms-ref-date-field__label">From</span>
              <input
                type="date"
                className="hrms-ref-select hrms-ref-date-input"
                value={dateFrom}
                max={dateTo || WIREFRAME_TODAY}
                onChange={(e) => onDateFromChange(e.target.value)}
                aria-label="From date"
              />
            </label>
            <span className="hrms-attendance-date-sep" aria-hidden>
              –
            </span>
            <label className="hrms-ref-date-field">
              <span className="hrms-ref-date-field__label">To</span>
              <input
                type="date"
                className="hrms-ref-select hrms-ref-date-input"
                value={dateTo}
                min={dateFrom || undefined}
                max={WIREFRAME_TODAY}
                onChange={(e) => onDateToChange(e.target.value)}
                aria-label="To date"
              />
            </label>
          </div>
        }
        toolbarExtra={
          <select
            className="hrms-ref-select"
            value={attendanceStatus}
            onChange={(e) => {
              setAttendanceStatus(e.target.value as AttendanceStatusFilter)
              list.setPage(1)
            }}
            aria-label="Attendance status filter"
          >
            <option value="all">All statuses</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="on_leave">On leave</option>
            <option value="half_day">Half day</option>
          </select>
        }
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
                <SortableTh
                  label="Date"
                  column="date"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Employee"
                  column="employee"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <th>Employment type</th>
                <SortableTh
                  label="In"
                  column="checkIn"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <th>Out</th>
                <SortableTh
                  label="Hours"
                  column="hours"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Status"
                  column="status"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="hrms-empty">
                    No attendance logs match your filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((l) => <AttendanceRow key={l.id} log={l} />)
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>
    </HrmsListShell>
  )
}

function AttendanceRow({ log: l }: { log: AttendanceLog }) {
  const emp = getEmployee(l.employeeId)
  return (
    <tr>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {l.date}
      </td>
      <td className="font-medium">
        {emp ? (
          <Link to={`/employees/${emp.id}`} style={{ color: '#2f4798', textDecoration: 'none' }}>
            {emp.firstName} {emp.lastName}
          </Link>
        ) : (
          '—'
        )}
        {emp ? (
          <div className="hrms-table-subtext">
            <code>{emp.employeeNo}</code>
          </div>
        ) : null}
      </td>
      <td>{emp ? employmentTypeLabel(emp.employmentType) : '—'}</td>
      <td>{l.checkIn}</td>
      <td>{l.checkOut}</td>
      <td>{l.hoursWorked}</td>
      <td>
        <AttendanceStatusBadge status={l.status} secondaryJob={l.secondaryJob} />
      </td>
      <td>
        <span className="hrms-source-pill">{l.source}</span>
      </td>
      <td>
        {emp ? (
          <RowActionsMenu
            id={l.id}
            actions={[
              {
                label: 'View attendance',
                href: `/attendance/employee/${emp.id}?date=${encodeURIComponent(l.date)}`,
              },
            ]}
          />
        ) : (
          '—'
        )}
      </td>
    </tr>
  )
}
