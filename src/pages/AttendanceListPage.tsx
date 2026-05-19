import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
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
} from '../data/attendanceMock'
import { getEmployee } from '../data/mock'
import { employmentTypeLabel } from '../data/employmentStats'
import { useListControls } from '../hooks/useListControls'

type AttendanceStatusFilter = 'all' | AttendanceStatus

function employeeLabel(employeeId: string) {
  const emp = getEmployee(employeeId)
  if (!emp) return ''
  return `${emp.firstName} ${emp.lastName} ${emp.employeeNo}`.toLowerCase()
}

export function AttendanceListPage() {
  const { can, visibleEmployees, user, actorEmployeeId } = useAuth()
  const canImport = can('page:attendance:import')
  const scopedIds = new Set(visibleEmployees().map((e) => e.id))
  const scopedLogs = attendanceLogs.filter((l) => scopedIds.has(l.employeeId))

  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusFilter>('all')

  const statusFiltered = useMemo(() => {
    if (attendanceStatus === 'all') return scopedLogs
    return scopedLogs.filter((l) => l.status === attendanceStatus)
  }, [scopedLogs, attendanceStatus])

  const presentCount = scopedLogs.filter((l) => l.status === 'present').length
  const lateCount = scopedLogs.filter((l) => l.status === 'late').length

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
      date: (a, b) => a.date.localeCompare(b.date),
      employee: (a, b) => employeeLabel(a.employeeId).localeCompare(employeeLabel(b.employeeId)),
      checkIn: (a, b) => a.checkIn.localeCompare(b.checkIn),
      hours: (a, b) => a.hoursWorked - b.hoursWorked,
      status: (a, b) => a.status.localeCompare(b.status),
    },
    defaultSortColumn: 'date',
    defaultPageSize: 15,
  })

  const hasActiveFilters =
    list.hasActiveFilters || attendanceStatus !== 'all'

  function resetAllFilters() {
    list.resetFilters()
    setAttendanceStatus('all')
  }

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
      <section className="hrms-list-summary" aria-label="Attendance summary">
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Standard day</span>
          <span className="hrms-list-summary__value">
            {ATTENDANCE_POLICY.standardHours}h · {ATTENDANCE_POLICY.coreStart}–
            {ATTENDANCE_POLICY.coreEnd}
          </span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Present (scope)</span>
          <span className="hrms-list-summary__value hrms-list-summary__value--stat">{presentCount}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Late arrivals</span>
          <span className="hrms-list-summary__value hrms-list-summary__value--stat">{lateCount}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Policy</span>
          <span className="hrms-list-summary__value">
            Flexible {ATTENDANCE_POLICY.flexibleTiming ? 'yes' : 'no'} · Shifts{' '}
            {ATTENDANCE_POLICY.shiftBased ? 'yes' : 'no'}
          </span>
        </article>
      </section>

      <DataListPanel
        title="Attendance logs"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by employee, date, or status..."
        showStatusFilter={false}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetAllFilters}
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
        <p className="hrms-list-footnote">
          Showing {list.total} log{list.total === 1 ? '' : 's'} in your scope.
          {user?.role === 'employee' && actorEmployeeId ? (
            <>
              {' '}
              <Link to={`/employees/${actorEmployeeId}`}>View your employee profile</Link>
            </>
          ) : null}
        </p>
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
            actions={[{ label: 'View employee', href: `/employees/${emp.id}` }]}
          />
        ) : (
          '—'
        )}
      </td>
    </tr>
  )
}
