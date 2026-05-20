import { useMemo, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { useWireframeData } from '../data/WireframeDataContext'
import {
  LEAVE_TYPE_LABELS,
  type LeaveTypeId,
} from '../data/leaveMock'
import { useListControls, type StatusFilter } from '../hooks/useListControls'
import { useLeaveHub } from '../leave/LeaveHubContext'
import {
  filterPendingForApprover,
  isDirectorateHrRole,
  summarizeLeaveForScope,
} from '../utils/leaveStats'
import '../styles/dashboard.css'
import './pages.css'

const ALL = 'all'

const LEAVE_STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

type TabId = 'all' | 'approvals'

export function LeaveManagementPage() {
  const { user, can, visibleEmployees, actorEmployeeId } = useAuth()
  const { departments, getDepartment, getEmployee } = useWireframeData()
  const { requests, approveRequest, rejectRequest } = useLeaveHub()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: TabId = searchParams.get('tab') === 'approvals' ? 'approvals' : 'all'

  const [departmentFilter, setDepartmentFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState<LeaveTypeId | typeof ALL>(ALL)
  const [message, setMessage] = useState<string | null>(null)

  if (user?.role === 'employee') {
    return <Navigate to="/ess/leave" replace />
  }

  const roster = visibleEmployees()
  const scopedIds = useMemo(() => new Set(roster.map((e) => e.id)), [roster])
  const scopedRequests = useMemo(
    () => requests.filter((r) => scopedIds.has(r.employeeId)),
    [requests, scopedIds],
  )

  const summary = useMemo(() => summarizeLeaveForScope(scopedRequests, roster.length), [scopedRequests, roster.length])

  const pendingQueue = useMemo(
    () =>
      filterPendingForApprover(
        requests,
        scopedIds,
        user?.role ?? '',
        actorEmployeeId,
        roster,
      ),
    [requests, scopedIds, user?.role, actorEmployeeId, roster],
  )

  const canApprove = can('leave.approve')
  const showApprovalsTab = can('page:leave:approvals')

  const departmentOptions = useMemo(() => {
    const ids = new Set(roster.map((e) => e.departmentId))
    return departments.filter((d) => ids.has(d.id)).sort((a, b) => a.name.localeCompare(b.name))
  }, [roster])

  const sourceRows = tab === 'approvals' ? pendingQueue : scopedRequests

  const filteredSource = useMemo(() => {
    return sourceRows.filter((r) => {
      if (departmentFilter !== ALL) {
        const emp = getEmployee(r.employeeId)
        if (!emp || emp.departmentId !== departmentFilter) return false
      }
      if (typeFilter !== ALL && r.leaveType !== typeFilter) return false
      return true
    })
  }, [sourceRows, departmentFilter, typeFilter])

  const list = useListControls(filteredSource, {
    searchFn: (r, q) => {
      const emp = getEmployee(r.employeeId)
      const dept = emp ? getDepartment(emp.departmentId)?.name.toLowerCase() ?? '' : ''
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ''
      return (
        name.includes(q) ||
        (emp?.employeeNo.toLowerCase().includes(q) ?? false) ||
        dept.includes(q) ||
        LEAVE_TYPE_LABELS[r.leaveType].toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.status.includes(q)
      )
    },
    statusFn: (r, f) => {
      if (f === 'all') return true
      return r.status === f
    },
    sortFns: {
      submitted: (a, b) => b.submittedAt.localeCompare(a.submittedAt),
      employee: (a, b) => {
        const ea = getEmployee(a.employeeId)
        const eb = getEmployee(b.employeeId)
        return `${ea?.lastName ?? ''}`.localeCompare(`${eb?.lastName ?? ''}`)
      },
      from: (a, b) => b.fromDate.localeCompare(a.fromDate),
    },
    defaultSortColumn: 'submitted',
  })

  const hasExtraFilters = departmentFilter !== ALL || typeFilter !== ALL
  const hasActiveFilters = list.hasActiveFilters || hasExtraFilters

  function resetAll() {
    list.resetFilters()
    setDepartmentFilter(ALL)
    setTypeFilter(ALL)
  }

  function setTab(next: TabId) {
    if (next === 'all') setSearchParams({})
    else setSearchParams({ tab: 'approvals' })
    list.setPage(1)
  }

  function handleApprove(id: string) {
    approveRequest(id, isDirectorateHrRole(user?.role ?? '') ? 'Approved by directorate HR' : 'Approved by manager')
    setMessage('Leave request approved — list updated.')
  }

  function handleReject(id: string) {
    rejectRequest(id, 'Not approved at this time (wireframe)')
    setMessage('Leave request rejected — list updated.')
  }

  return (
    <HrmsListShell current="Leave Management">
      <section className="hrms-kpi-grid" style={{ marginBottom: '1rem' }} aria-label="Leave summary">
        <DashboardKpiCard
          static
          label="Pending approval"
          value={summary.pendingCount}
          subtext={showApprovalsTab ? 'Open the Approvals tab to action' : 'In your scope'}
          icon={<i className="ri-time-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Approved (30 days)"
          value={summary.approved30}
          subtext={`${summary.total30} requests submitted`}
          icon={<i className="ri-checkbox-circle-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="On leave today"
          value={summary.onLeaveToday}
          subtext="Approved leave covering today"
          icon={<i className="ri-calendar-event-line" />}
          tone="info"
        />
        <DashboardKpiCard
          static
          label="Rejected (30 days)"
          value={summary.rejected30}
          subtext="Returned to employee"
          icon={<i className="ri-close-circle-line" />}
          tone="secondary"
        />
      </section>

      {showApprovalsTab ? (
        <div className="hrms-leave-tabs" role="tablist" aria-label="Leave views">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'all'}
            className={`hrms-leave-tabs__btn${tab === 'all' ? ' hrms-leave-tabs__btn--active' : ''}`}
            onClick={() => setTab('all')}
          >
            All requests
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'approvals'}
            className={`hrms-leave-tabs__btn${tab === 'approvals' ? ' hrms-leave-tabs__btn--active' : ''}`}
            onClick={() => setTab('approvals')}
          >
            Pending approvals
            {pendingQueue.length > 0 ? (
              <span className="hrms-leave-tabs__badge">{pendingQueue.length}</span>
            ) : null}
          </button>
        </div>
      ) : null}

      {message ? <p className="wf-note">{message}</p> : null}

      <DataListPanel
        title={tab === 'approvals' ? 'Pending approval queue' : 'All leave requests'}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search employee, code, centre, type, or reason..."
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        statusOptions={LEAVE_STATUS_OPTIONS}
        extraFilters={
          <>
            <select
              className="hrms-ref-select"
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value)
                list.setPage(1)
              }}
              aria-label="Department filter"
            >
              <option value={ALL}>All departments</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              className="hrms-ref-select"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as LeaveTypeId | typeof ALL)
                list.setPage(1)
              }}
              aria-label="Leave type filter"
            >
              <option value={ALL}>All types</option>
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveTypeId[]).map((t) => (
                <option key={t} value={t}>
                  {LEAVE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </>
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
                <th>Employee</th>
                <th>Centre</th>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="hrms-empty">
                    {tab === 'approvals'
                      ? 'No pending requests in your approval queue.'
                      : 'No leave requests match your filters.'}
                  </td>
                </tr>
              ) : (
                list.pageRows.map((r) => {
                  const emp = getEmployee(r.employeeId)
                  const dept = emp ? getDepartment(emp.departmentId) : undefined
                  return (
                    <tr key={r.id}>
                      <td className="font-medium">
                        {emp ? (
                          <Link to={`/employees/${emp.id}`} style={{ color: '#2f4798', fontWeight: 500 }}>
                            {emp.firstName} {emp.lastName}
                            <br />
                            <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{emp.employeeNo}</span>
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{dept?.name ?? '—'}</td>
                      <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                      <td>{r.fromDate}</td>
                      <td>{r.toDate}</td>
                      <td>{r.days}</td>
                      <td>{r.reason}</td>
                      <td>
                        <span
                          className={`wf-pill wf-pill--${
                            r.status === 'approved' ? 'active' : r.status === 'pending' ? 'inactive' : 'inactive'
                          }`}
                        >
                          {r.status}
                        </span>
                        {r.approverNote ? (
                          <div className="wf-card-desc" style={{ marginTop: '0.2rem' }}>
                            {r.approverNote}
                          </div>
                        ) : null}
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {r.submittedAt}
                      </td>
                      <td>
                        <RowActionsMenu
                          id={r.id}
                          actions={[
                            ...(emp ? [{ label: 'View employee', href: `/employees/${emp.id}` }] : []),
                            ...(canApprove && r.status === 'pending'
                              ? [
                                  { label: 'Approve', onClick: () => handleApprove(r.id) },
                                  {
                                    label: 'Reject',
                                    danger: true,
                                    onClick: () => handleReject(r.id),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </td>
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
