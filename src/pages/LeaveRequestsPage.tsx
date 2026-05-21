import { type FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  CompactFormCard,
  CompactFormField,
  CompactFormFooter,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormPage,
  CompactFormRequired,
  CompactFormSection,
} from '../components/hrms/HrmsCompactForm'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { LeaveStatusBadge } from '../components/hrms/LeaveStatusBadge'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import {
  LEAVE_TYPE_LABELS,
  type LeaveRequest,
  type LeaveRequestStatus,
  type LeaveTypeId,
  getLeaveBalance,
  leaveRequests,
} from '../data/leaveMock'
import { getEmployee } from '../data/mock'
import { useListControls } from '../hooks/useListControls'

type LeaveStatusFilter = 'all' | LeaveRequestStatus
type LeaveTypeFilter = 'all' | LeaveTypeId

function employeeLabel(employeeId: string) {
  const emp = getEmployee(employeeId)
  if (!emp) return ''
  return `${emp.firstName} ${emp.lastName} ${emp.employeeNo}`.toLowerCase()
}

export function LeaveRequestsPage() {
  const { can, visibleEmployees, actorEmployeeId, user } = useAuth()
  const canRequest = can('leave.request')
  const roster = visibleEmployees()
  const scopedIds = new Set(roster.map((e) => e.id))
  const isEmployee = user?.role === 'employee'

  const scoped = useMemo(() => {
    if (isEmployee && actorEmployeeId) {
      return leaveRequests.filter((r) => r.employeeId === actorEmployeeId)
    }
    return leaveRequests.filter((r) => scopedIds.has(r.employeeId))
  }, [isEmployee, actorEmployeeId, scopedIds])

  const balance = actorEmployeeId ? getLeaveBalance(actorEmployeeId) : undefined

  const [draftType, setDraftType] = useState<LeaveTypeId>('casual')
  const [leaveStatus, setLeaveStatus] = useState<LeaveStatusFilter>('all')
  const [leaveType, setLeaveType] = useState<LeaveTypeFilter>('all')

  const filtered = useMemo(() => {
    return scoped.filter((r) => {
      if (leaveStatus !== 'all' && r.status !== leaveStatus) return false
      if (leaveType !== 'all' && r.leaveType !== leaveType) return false
      return true
    })
  }, [scoped, leaveStatus, leaveType])

  const pendingCount = scoped.filter((r) => r.status === 'pending').length
  const approvedCount = scoped.filter((r) => r.status === 'approved').length

  const list = useListControls(filtered, {
    searchFn: (r, q) => {
      const emp = getEmployee(r.employeeId)
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ''
      return (
        name.includes(q) ||
        LEAVE_TYPE_LABELS[r.leaveType].toLowerCase().includes(q) ||
        r.status.includes(q) ||
        r.fromDate.includes(q) ||
        employeeLabel(r.employeeId).includes(q)
      )
    },
    sortFns: {
      employee: (a, b) => employeeLabel(a.employeeId).localeCompare(employeeLabel(b.employeeId)),
      type: (a, b) => LEAVE_TYPE_LABELS[a.leaveType].localeCompare(LEAVE_TYPE_LABELS[b.leaveType]),
      from: (a, b) => a.fromDate.localeCompare(b.fromDate),
      to: (a, b) => a.toDate.localeCompare(b.toDate),
      days: (a, b) => a.days - b.days,
      status: (a, b) => a.status.localeCompare(b.status),
    },
    defaultSortColumn: 'from',
    defaultPageSize: 15,
  })

  const hasActiveFilters =
    list.hasActiveFilters || leaveStatus !== 'all' || leaveType !== 'all'

  function resetAllFilters() {
    list.resetFilters()
    setLeaveStatus('all')
    setLeaveType('all')
  }

  function submitMock(ev: FormEvent) {
    ev.preventDefault()
    if (!actorEmployeeId) return
    alert(`Wireframe: ${LEAVE_TYPE_LABELS[draftType]} request submitted.`)
  }

  return (
    <HrmsListShell
      current="Leave Management"
    >
      <section className="hrms-list-summary" aria-label="Leave summary">
        {canRequest && balance ? (
          <>
            <article className="hrms-list-summary__card">
              <span className="hrms-list-summary__label">Casual balance</span>
              <span className="hrms-list-summary__value hrms-list-summary__value--stat">
                {balance.casual}
              </span>
            </article>
            <article className="hrms-list-summary__card">
              <span className="hrms-list-summary__label">Sick balance</span>
              <span className="hrms-list-summary__value hrms-list-summary__value--stat">
                {balance.sick}
              </span>
            </article>
            <article className="hrms-list-summary__card">
              <span className="hrms-list-summary__label">Annual balance</span>
              <span className="hrms-list-summary__value hrms-list-summary__value--stat">
                {balance.annual}
              </span>
            </article>
          </>
        ) : null}
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Pending</span>
          <span className="hrms-list-summary__value hrms-list-summary__value--stat">{pendingCount}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Approved</span>
          <span className="hrms-list-summary__value hrms-list-summary__value--stat">{approvedCount}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Approval chain</span>
          <span className="hrms-list-summary__value">Manager → HR</span>
        </article>
      </section>

      {canRequest && balance ? (
        <div className="hrms-leave-request-panel" style={{ marginBottom: '1.25rem' }}>
          <CompactFormPage>
            <CompactFormCard
              icon="ri-calendar-check-line"
              title="New leave request"
              description="Casual, sick, annual, and emergency leave — subject to balance and policy."
            >
              <form onSubmit={submitMock}>
                <CompactFormSection legend="Request details">
                  <CompactFormGrid>
                    <CompactFormField
                      label={
                        <>
                          Leave type <CompactFormRequired />
                        </>
                      }
                    >
                      <CompactFormInputWrap icon="ri-calendar-event-line">
                        <select
                          value={draftType}
                          onChange={(ev) => setDraftType(ev.target.value as LeaveTypeId)}
                        >
                          {(Object.keys(LEAVE_TYPE_LABELS) as LeaveTypeId[]).map((t) => (
                            <option key={t} value={t}>
                              {LEAVE_TYPE_LABELS[t]}
                            </option>
                          ))}
                        </select>
                      </CompactFormInputWrap>
                    </CompactFormField>
                    <CompactFormGrid split>
                      <CompactFormField
                        label={
                          <>
                            From <CompactFormRequired />
                          </>
                        }
                      >
                        <CompactFormInputWrap icon="ri-calendar-line">
                          <input type="date" name="fromDate" defaultValue="2026-05-01" required />
                        </CompactFormInputWrap>
                      </CompactFormField>
                      <CompactFormField
                        label={
                          <>
                            To <CompactFormRequired />
                          </>
                        }
                      >
                        <CompactFormInputWrap icon="ri-calendar-line">
                          <input type="date" name="toDate" defaultValue="2026-05-02" required />
                        </CompactFormInputWrap>
                      </CompactFormField>
                    </CompactFormGrid>
                    <CompactFormField label="Reason">
                      <CompactFormInputWrap icon="ri-chat-3-line">
                        <input type="text" name="reason" placeholder="Optional short note" />
                      </CompactFormInputWrap>
                    </CompactFormField>
                  </CompactFormGrid>
                </CompactFormSection>
                <CompactFormFooter>
                  <button type="submit" className="hrms-btn-primary">
                    <i className="ri-send-plane-line" aria-hidden />
                    Submit request
                  </button>
                </CompactFormFooter>
              </form>
            </CompactFormCard>
          </CompactFormPage>
        </div>
      ) : null}

      <DataListPanel
        title="Leave requests"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by employee, type, or status..."
        showStatusFilter={false}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetAllFilters}
        toolbarExtra={
          <>
            <select
              className="hrms-ref-select"
              value={leaveType}
              onChange={(e) => {
                setLeaveType(e.target.value as LeaveTypeFilter)
                list.setPage(1)
              }}
              aria-label="Leave type filter"
            >
              <option value="all">All types</option>
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveTypeId[]).map((t) => (
                <option key={t} value={t}>
                  {LEAVE_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <select
              className="hrms-ref-select"
              value={leaveStatus}
              onChange={(e) => {
                setLeaveStatus(e.target.value as LeaveStatusFilter)
                list.setPage(1)
              }}
              aria-label="Leave status filter"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </>
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
                  label="Employee"
                  column="employee"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Type"
                  column="type"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="From"
                  column="from"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="To"
                  column="to"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Days"
                  column="days"
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="hrms-empty">
                    No leave requests match your filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((r) => <LeaveRow key={r.id} request={r} />)
              )}
            </tbody>
          </table>
        </div>
        <p className="hrms-list-footnote">
          Showing {list.total} request{list.total === 1 ? '' : 's'} in your scope.
          {isEmployee && actorEmployeeId ? (
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

function LeaveRow({ request: r }: { request: LeaveRequest }) {
  const emp = getEmployee(r.employeeId)
  return (
    <tr>
      <td className="font-medium">
        {emp ? (
          <Link to={`/employees/${r.employeeId}`} style={{ color: '#2f4798', textDecoration: 'none' }}>
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
      <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {r.fromDate}
      </td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {r.toDate}
      </td>
      <td>{r.days}</td>
      <td>
        <LeaveStatusBadge status={r.status} />
      </td>
      <td>
        <RowActionsMenu
          id={r.id}
          actions={[
            ...(emp ? [{ label: 'View employee', href: `/employees/${emp.id}` }] : []),
          ]}
        />
      </td>
    </tr>
  )
}
