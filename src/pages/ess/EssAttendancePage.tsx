import { useMemo, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { AttendanceStatusBadge } from '../../components/hrms/AttendanceStatusBadge'
import { DataListPanel } from '../../components/hrms/DataListPanel'
import { ATTENDANCE_POLICY, type AttendanceStatus, WIREFRAME_TODAY } from '../../data/attendanceMock'
import { getEssAttendance } from '../../data/essSeed'
import { useListControls } from '../../hooks/useListControls'
import type { StatusFilter } from '../../hooks/useListControls'
import {
  attendanceRatePercent,
  formatTodayStatus,
  isAttended,
  isDateInRange,
  logsInLastDays,
} from '../../utils/attendanceStats'
import '../../styles/ess-attendance.css'
import '../../styles/ess-leave.css'
import '../pages.css'

type AttendanceStatusFilter = 'all' | AttendanceStatus

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'present', label: 'Present' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half day' },
  { value: 'absent', label: 'Absent' },
  { value: 'on_leave', label: 'On leave' },
]

const STAT_CARDS = [
  {
    key: 'today',
    label: 'Today',
    icon: 'ri-calendar-check-line',
    tone: 'primary' as const,
  },
  {
    key: 'week',
    label: 'Last 7 days',
    icon: 'ri-bar-chart-grouped-line',
    tone: 'success' as const,
  },
  {
    key: 'month',
    label: 'Last 30 days',
    icon: 'ri-line-chart-line',
    tone: 'info' as const,
  },
]

function resolveDateBounds(from: string, to: string) {
  if (from && !to) return { from, to: from }
  if (!from && to) return { from: to, to }
  return { from, to }
}

function attendanceFilterLabel(from: string, to: string): string | null {
  if (!from && !to) return null
  const bounds = resolveDateBounds(from, to)
  if (bounds.from === bounds.to) return bounds.from
  return `${bounds.from} – ${bounds.to}`
}

export function EssAttendancePage() {
  const { actorEmployeeId } = useAuth()
  const allLogs = useMemo(
    () => (actorEmployeeId ? getEssAttendance(actorEmployeeId) : []),
    [actorEmployeeId],
  )

  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusFilter>('all')
  const todayLogs = useMemo(
    () => allLogs.filter((l) => l.date === WIREFRAME_TODAY),
    [allLogs],
  )
  const last7Logs = useMemo(() => logsInLastDays(allLogs, WIREFRAME_TODAY, 7), [allLogs])
  const last30Logs = useMemo(() => logsInLastDays(allLogs, WIREFRAME_TODAY, 30), [allLogs])

  const rate7 = attendanceRatePercent(last7Logs)
  const rate30 = attendanceRatePercent(last30Logs)
  const attended7 = last7Logs.filter((l) => isAttended(l.status)).length
  const attended30 = last30Logs.filter((l) => isAttended(l.status)).length

  const dateFiltered = useMemo(() => {
    if (!dateFrom && !dateTo) return allLogs
    const { from, to } = resolveDateBounds(dateFrom, dateTo)
    return allLogs.filter((l) => isDateInRange(l.date, from, to))
  }, [allLogs, dateFrom, dateTo])

  const statusFiltered = useMemo(() => {
    if (attendanceStatus === 'all') return dateFiltered
    return dateFiltered.filter((l) => l.status === attendanceStatus)
  }, [dateFiltered, attendanceStatus])

  const hasDateFilter = Boolean(dateFrom || dateTo)

  const list = useListControls(statusFiltered, {
    searchFn: (l, q) =>
      l.date.includes(q) ||
      l.status.includes(q) ||
      l.source.includes(q) ||
      (l.note?.toLowerCase().includes(q) ?? false),
    sortFns: {
      date: (a, b) => b.date.localeCompare(a.date),
      status: (a, b) => a.status.localeCompare(b.status),
    },
    defaultSortColumn: 'date',
    defaultSortDir: 'desc',
    defaultStatusFilter: 'all',
    defaultPageSize: 10,
  })

  const hasActiveFilters =
    list.hasActiveFilters || attendanceStatus !== 'all' || hasDateFilter

  const dateFilterLabel = attendanceFilterLabel(dateFrom, dateTo)
  const logsPanelTitle = dateFilterLabel
    ? `Attendance log · ${dateFilterLabel}`
    : 'Attendance log'

  function onDateFromChange(value: string) {
    setDateFrom(value)
    list.setPage(1)
  }

  function onDateToChange(value: string) {
    setDateTo(value)
    list.setPage(1)
  }

  function resetAll() {
    list.resetFilters()
    setAttendanceStatus('all')
    setDateFrom('')
    setDateTo('')
  }

  function statValue(key: string): string {
    if (key === 'today') return formatTodayStatus(todayLogs)
    if (key === 'week') return `${rate7}%`
    return `${rate30}%`
  }

  function statSub(key: string): string {
    if (key === 'today') {
      const row = todayLogs[0]
      return row ? `${row.checkIn} – ${row.checkOut} · ${row.hoursWorked}h` : 'No punch recorded'
    }
    if (key === 'week') return `${attended7} of ${last7Logs.length} days attended`
    return `${attended30} of ${last30Logs.length} days attended`
  }

  return (
    <div className="ess-page ess-attendance-page">
      <header className="ess-attendance-page__head">
        <div>
          <h2 className="wf-h2" style={{ marginBottom: '0.35rem' }}>
            My attendance
          </h2>
          <p className="wf-lead">Your check-in history and attendance summary.</p>
          <p className="ess-attendance-policy">
            <i className="ri-time-line" aria-hidden />
            Standard day {ATTENDANCE_POLICY.standardHours}h ({ATTENDANCE_POLICY.coreStart}–
            {ATTENDANCE_POLICY.coreEnd}) · demo {WIREFRAME_TODAY}
          </p>
        </div>
      </header>

      <section className="ess-attendance-stats" aria-label="Attendance summary">
        {STAT_CARDS.map(({ key, label, icon, tone }) => (
          <article key={key} className="ess-leave-balance-card">
            <span className={`ess-leave-balance-card__icon ess-leave-balance-card__icon--${tone}`} aria-hidden>
              <i className={icon} />
            </span>
            <div className="ess-leave-balance-card__meta">
              <span className="ess-leave-balance-card__label">{label}</span>
              <span className="ess-leave-balance-card__value">{statValue(key)}</span>
              <span className="ess-leave-balance-card__sub">{statSub(key)}</span>
            </div>
          </article>
        ))}
      </section>

      <DataListPanel
        title={logsPanelTitle}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search status, source, or note..."
        showStatusFilter={false}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetAll}
        extraFilters={
          <div className="hrms-attendance-date-filters">
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
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
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
                    No records for this date range and filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((l) => (
                  <tr key={l.id}>
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
          Showing {list.firstItem}–{list.lastItem} of {list.total} record{list.total === 1 ? '' : 's'}
          {dateFilterLabel ? (
            <>
              {' '}
              for <strong>{dateFilterLabel}</strong>
            </>
          ) : null}
          .
        </p>
      </DataListPanel>
    </div>
  )
}
