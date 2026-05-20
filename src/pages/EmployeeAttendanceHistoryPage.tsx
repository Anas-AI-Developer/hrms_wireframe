import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { AttendanceStatusBadge } from '../components/hrms/AttendanceStatusBadge'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { StatusBadge } from '../components/hrms/StatusBadge'
import {
  ATTENDANCE_POLICY,
  getAttendanceForEmployee,
  type AttendanceLog,
  type AttendanceStatus,
  WIREFRAME_TODAY,
} from '../data/attendanceMock'
import { getDepartment, getDesignation, getEmployee } from '../data/mock'
import { employmentTypeLabel } from '../data/employmentStats'
import { useListControls } from '../hooks/useListControls'
import {
  attendanceRatePercent,
  formatTodayStatus,
  isDateInRange,
  logsInLastDays,
} from '../utils/attendanceStats'
import '../styles/attendance-history-page.css'

type AttendanceStatusFilter = 'all' | AttendanceStatus
type SourceFilter = 'all' | AttendanceLog['source']
type PeriodPreset = 'all' | 'last7' | 'last30' | 'today' | 'custom'

function resolveDateBounds(from: string, to: string, todayOnly: boolean) {
  if (todayOnly) return { from: WIREFRAME_TODAY, to: WIREFRAME_TODAY }
  if (from && !to) return { from, to: from }
  if (!from && to) return { from: to, to }
  return { from, to }
}

function periodLabel(preset: PeriodPreset, from: string, to: string, todayOnly: boolean): string {
  if (preset === 'all') return 'All dates'
  if (preset === 'last7') return 'Last 7 days'
  if (preset === 'last30') return 'Last 30 days'
  if (preset === 'today' || todayOnly) return `Today (${WIREFRAME_TODAY})`
  if (!from && !to) return 'All dates'
  const bounds = resolveDateBounds(from, to, false)
  if (bounds.from === bounds.to) return bounds.from
  return `${bounds.from} – ${bounds.to}`
}

function employeeInitials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

export function EmployeeAttendanceHistoryPage() {
  const { employeeId } = useParams<{ employeeId: string }>()
  const [searchParams] = useSearchParams()
  const focusDate = searchParams.get('date') ?? undefined
  const { canViewEmployee, user, can } = useAuth()

  const emp = employeeId ? getEmployee(employeeId) : undefined
  const dept = emp ? getDepartment(emp.departmentId) : undefined
  const des = emp ? getDesignation(emp.designationId) : undefined

  const allLogs = useMemo(
    () => (employeeId ? getAttendanceForEmployee(employeeId) : []),
    [employeeId],
  )

  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('last30')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusFilter>('all')
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized || !employeeId) return
    if (focusDate) {
      setPeriodPreset('custom')
      setDateFrom(focusDate)
      setDateTo(focusDate)
      setTodayOnly(false)
    }
    setInitialized(true)
  }, [employeeId, focusDate, initialized])

  const periodFiltered = useMemo(() => {
    if (periodPreset === 'all') return allLogs
    if (periodPreset === 'last7') return logsInLastDays(allLogs, WIREFRAME_TODAY, 7)
    if (periodPreset === 'last30') return logsInLastDays(allLogs, WIREFRAME_TODAY, 30)
    if (periodPreset === 'today') {
      return allLogs.filter((l) => l.date === WIREFRAME_TODAY)
    }
    if (!todayOnly && !dateFrom && !dateTo) return allLogs
    const { from, to } = resolveDateBounds(dateFrom, dateTo, todayOnly)
    return allLogs.filter((l) => isDateInRange(l.date, from, to))
  }, [allLogs, periodPreset, todayOnly, dateFrom, dateTo])

  const statusFiltered = useMemo(() => {
    if (attendanceStatus === 'all') return periodFiltered
    return periodFiltered.filter((l) => l.status === attendanceStatus)
  }, [periodFiltered, attendanceStatus])

  const filtered = useMemo(() => {
    if (sourceFilter === 'all') return statusFiltered
    return statusFiltered.filter((l) => l.source === sourceFilter)
  }, [statusFiltered, sourceFilter])

  const rate = attendanceRatePercent(periodFiltered)
  const presentCount = periodFiltered.filter((l) => l.status === 'present').length
  const lateCount = periodFiltered.filter((l) => l.status === 'late').length
  const absentCount = periodFiltered.filter((l) =>
    ['absent', 'on_leave'].includes(l.status),
  ).length

  const todayLogs = useMemo(
    () => allLogs.filter((l) => l.date === WIREFRAME_TODAY),
    [allLogs],
  )

  const list = useListControls(filtered, {
    searchFn: (l, q) =>
      l.date.includes(q) ||
      l.status.includes(q) ||
      l.source.includes(q) ||
      (l.note?.toLowerCase().includes(q) ?? false),
    sortFns: {
      date: (a, b) => b.date.localeCompare(a.date),
      status: (a, b) => a.status.localeCompare(b.status),
      hours: (a, b) => b.hoursWorked - a.hoursWorked,
    },
    defaultSortColumn: 'date',
    defaultSortDir: 'desc',
    defaultPageSize: 15,
  })

  const hasActiveFilters =
    attendanceStatus !== 'all' ||
    sourceFilter !== 'all' ||
    periodPreset !== 'last30' ||
    Boolean(dateFrom || dateTo || todayOnly) ||
    list.hasActiveFilters

  const activePeriod = periodLabel(periodPreset, dateFrom, dateTo, todayOnly)
  const logsPanelTitle = `Attendance log · ${activePeriod}`

  function applyPreset(preset: PeriodPreset) {
    setPeriodPreset(preset)
    setTodayOnly(preset === 'today')
    if (preset === 'today') {
      setDateFrom(WIREFRAME_TODAY)
      setDateTo(WIREFRAME_TODAY)
    } else if (preset !== 'custom') {
      setDateFrom('')
      setDateTo('')
    }
    list.setPage(1)
  }

  function onDateFromChange(value: string) {
    setPeriodPreset('custom')
    setTodayOnly(false)
    setDateFrom(value)
    list.setPage(1)
  }

  function onDateToChange(value: string) {
    setPeriodPreset('custom')
    setTodayOnly(false)
    setDateTo(value)
    list.setPage(1)
  }

  function resetFilters() {
    applyPreset('last30')
    setAttendanceStatus('all')
    setSourceFilter('all')
    list.resetFilters()
  }

  if (!emp) {
    return (
      <HrmsListShell current="Attendance history" dashboardHref="/attendance">
        <p className="hrms-list-footnote">Employee not found.</p>
        <Link to="/attendance" className="hrms-ref-btn-secondary">
          Back to attendance
        </Link>
      </HrmsListShell>
    )
  }

  if (!canViewEmployee(emp)) {
    const fallback = user && can('page:attendance') ? '/attendance' : '/dashboard'
    return <Navigate to={fallback} replace />
  }

  return (
    <HrmsListShell
      current={`${emp.firstName} ${emp.lastName}`}
      dashboardHref="/attendance"
    >
      <nav className="hrms-att-history-crumb" aria-label="Breadcrumb">
        <Link to="/dashboard">Dashboard</Link>
        <span aria-hidden>/</span>
        <Link to="/attendance">Attendance</Link>
        <span aria-hidden>/</span>
        <span aria-current="page">{emp.employeeNo}</span>
      </nav>

      <header className="hrms-att-history-hero">
        <div className="hrms-att-history-hero__main">
          <span className="hrms-att-history-hero__avatar" aria-hidden>
            {employeeInitials(emp.firstName, emp.lastName)}
          </span>
          <div>
            <p className="hrms-att-history-hero__eyebrow">Attendance history</p>
            <h1 className="hrms-att-history-hero__title">
              {emp.firstName} {emp.lastName}
            </h1>
            <p className="hrms-att-history-hero__meta">
              <code>{emp.employeeNo}</code>
              <span aria-hidden>·</span>
              {employmentTypeLabel(emp.employmentType)}
              <span aria-hidden>·</span>
              {dept?.name ?? '—'}
              {des ? (
                <>
                  <span aria-hidden>·</span>
                  {des.title}
                </>
              ) : null}
            </p>
            <p className="hrms-att-history-hero__email">
              <a href={`mailto:${emp.email}`}>{emp.email}</a>
            </p>
          </div>
        </div>
        <div className="hrms-att-history-hero__aside">
          <div className="hrms-att-history-hero__today">
            <span className="hrms-att-history-hero__today-label">Today</span>
            <span className="hrms-att-history-hero__today-value">
              {formatTodayStatus(todayLogs)}
            </span>
            {todayLogs[0] ? (
              <span className="hrms-att-history-hero__today-sub">
                {todayLogs[0].checkIn} – {todayLogs[0].checkOut}
              </span>
            ) : (
              <span className="hrms-att-history-hero__today-sub">No punch on file</span>
            )}
          </div>
          <StatusBadge status={emp.status} />
        </div>
      </header>

      <div className="hrms-att-history-actions">
        <Link to="/attendance" className="hrms-ref-btn-secondary">
          <i className="ri-arrow-left-line" aria-hidden /> Back to attendance
        </Link>
        {can('page:employees') ? (
          <Link to={`/employees/${emp.id}`} className="hrms-ref-btn-secondary">
            <i className="ri-user-line" aria-hidden /> Employee profile
          </Link>
        ) : null}
      </div>

      <section className="hrms-kpi-grid hrms-att-history-kpis" aria-label="Period summary">
        <DashboardKpiCard
          static
          label="Attendance rate"
          value={`${rate}%`}
          subtext={activePeriod}
          icon={<i className="ri-pie-chart-2-line" />}
          tone="primary"
        />
        <DashboardKpiCard
          static
          label="Present"
          value={presentCount}
          subtext={`In selected period (${periodFiltered.length} days)`}
          icon={<i className="ri-user-follow-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="Late"
          value={lateCount}
          subtext={`Core start ${ATTENDANCE_POLICY.coreStart}`}
          icon={<i className="ri-alarm-warning-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Absent / leave"
          value={absentCount}
          subtext="Non-attended days in period"
          icon={<i className="ri-calendar-close-line" />}
          tone="info"
        />
      </section>

      <div className="hrms-att-history-layout">
        <aside className="hrms-att-history-filters-panel" aria-label="Filter attendance">
          <h2 className="hrms-att-history-filters-panel__title">
            <i className="ri-filter-3-line" aria-hidden /> Filters
          </h2>

          <div className="hrms-att-history-filters-panel__block">
            <span className="hrms-att-history-filters-panel__label">Quick period</span>
            <div className="hrms-attendance-history__presets" role="group">
              {(
                [
                  ['all', 'All time'],
                  ['last7', 'Last 7 days'],
                  ['last30', 'Last 30 days'],
                  ['today', 'Today'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={periodPreset === key ? 'is-active' : undefined}
                  aria-pressed={periodPreset === key}
                  onClick={() => applyPreset(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hrms-att-history-filters-panel__block">
            <span className="hrms-att-history-filters-panel__label">Date range</span>
            <div className="hrms-attendance-date-filters hrms-attendance-date-filters--stacked">
              <label className="hrms-ref-date-field">
                <span className="hrms-ref-date-field__label">From</span>
                <input
                  type="date"
                  className="hrms-ref-select hrms-ref-date-input"
                  value={dateFrom}
                  max={dateTo || WIREFRAME_TODAY}
                  onChange={(e) => onDateFromChange(e.target.value)}
                />
              </label>
              <label className="hrms-ref-date-field">
                <span className="hrms-ref-date-field__label">To</span>
                <input
                  type="date"
                  className="hrms-ref-select hrms-ref-date-input"
                  value={dateTo}
                  min={dateFrom || undefined}
                  max={WIREFRAME_TODAY}
                  onChange={(e) => onDateToChange(e.target.value)}
                />
              </label>
            </div>
          </div>

          <div className="hrms-att-history-filters-panel__block">
            <label className="hrms-att-history-filters-panel__label" htmlFor="att-hist-status">
              Status
            </label>
            <select
              id="att-hist-status"
              className="hrms-ref-select hrms-att-history-filters-panel__full"
              value={attendanceStatus}
              onChange={(e) => {
                setAttendanceStatus(e.target.value as AttendanceStatusFilter)
                list.setPage(1)
              }}
            >
              <option value="all">All statuses</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="on_leave">On leave</option>
              <option value="half_day">Half day</option>
            </select>
          </div>

          <div className="hrms-att-history-filters-panel__block">
            <label className="hrms-att-history-filters-panel__label" htmlFor="att-hist-source">
              Source
            </label>
            <select
              id="att-hist-source"
              className="hrms-ref-select hrms-att-history-filters-panel__full"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as SourceFilter)
                list.setPage(1)
              }}
            >
              <option value="all">All sources</option>
              <option value="import">Import</option>
              <option value="manual">Manual</option>
            </select>
          </div>

          {hasActiveFilters ? (
            <button type="button" className="hrms-ref-btn-secondary hrms-att-history-filters-panel__reset" onClick={resetFilters}>
              <i className="ri-restart-line" aria-hidden /> Reset filters
            </button>
          ) : null}
        </aside>

        <div className="hrms-att-history-main">
          <DataListPanel
            title={logsPanelTitle}
            search={list.search}
            onSearchChange={list.setSearch}
            searchPlaceholder="Search date, status, source, or note…"
            showStatusFilter={false}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={resetFilters}
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
              <table className="hrms-data-table hrms-att-history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check in</th>
                    <th>Check out</th>
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
                        No attendance records match these filters.
                      </td>
                    </tr>
                  ) : (
                    list.pageRows.map((l) => (
                      <tr
                        key={l.id}
                        className={
                          focusDate && l.date === focusDate ? 'hrms-att-history-table__row--focus' : undefined
                        }
                      >
                        <td className="font-medium">{l.date}</td>
                        <td>{l.checkIn}</td>
                        <td>{l.checkOut}</td>
                        <td>{l.hoursWorked}</td>
                        <td>
                          <AttendanceStatusBadge status={l.status} secondaryJob={l.secondaryJob} />
                        </td>
                        <td>
                          <span className="hrms-source-pill">{l.source}</span>
                        </td>
                        <td>{l.note ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <p className="hrms-list-footnote">
              Showing {list.firstItem}–{list.lastItem} of {list.total} record
              {list.total === 1 ? '' : 's'} for <strong>{activePeriod}</strong>.
              {focusDate ? (
                <>
                  {' '}
                  Opened from list for <strong>{focusDate}</strong>.
                </>
              ) : null}
            </p>
          </DataListPanel>
        </div>
      </div>
    </HrmsListShell>
  )
}
