import { useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import {
  EMPLOYEE_REQUEST_TYPES,
  employeeRequestTypeLabel,
} from '../data/employeeRequestTypes'
import {
  EMPLOYEE_REQUEST_STATUS_LABELS,
  isRequestPending,
  updateEmployeeRequestStatus,
  type EmployeeRequest,
  type EmployeeRequestStatus,
} from '../data/employeeRequestsStore'
import { useWireframeData } from '../data/WireframeDataContext'
import { useEmployeeRequestsSnapshot } from '../hooks/useEmployeeRequestsSnapshot'
import { useListControls, type StatusFilter } from '../hooks/useListControls'
import '../styles/dashboard.css'
import '../styles/ess-requests.css'
import './pages.css'

const ALL = 'all'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

function requestMatchesStatusFilter(r: EmployeeRequest, filter: StatusFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'pending') return isRequestPending(r.status)
  if (filter === 'approved') return r.status === 'approved' || r.status === 'acknowledged'
  if (filter === 'cancelled') return r.status === 'cancelled' || r.status === 'closed'
  return r.status === filter
}

export function EmployeeRequestsManagementPage() {
  const { user, can, visibleEmployees } = useAuth()
  const { getEmployee, getDepartment } = useWireframeData()
  const [typeFilter, setTypeFilter] = useState(ALL)
  const [message, setMessage] = useState<string | null>(null)

  const roster = useMemo(() => visibleEmployees(), [visibleEmployees])
  const scopedIds = useMemo(() => new Set(roster.map((e) => e.id)), [roster])
  const requests = useEmployeeRequestsSnapshot(scopedIds)

  const filteredByType = useMemo(() => {
    if (typeFilter === ALL) return requests
    return requests.filter((r) => r.requestType === typeFilter)
  }, [requests, typeFilter])

  const pendingCount = useMemo(
    () => requests.filter((r) => isRequestPending(r.status)).length,
    [requests],
  )
  const approvedCount = useMemo(
    () => requests.filter((r) => r.status === 'approved' || r.status === 'acknowledged').length,
    [requests],
  )

  const list = useListControls(filteredByType, {
    searchFn: (r, q) => {
      const emp = getEmployee(r.employeeId)
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ''
      const typeLabel = r.requestType ? employeeRequestTypeLabel(r.requestType) : ''
      return (
        name.includes(q) ||
        (emp?.employeeNo.toLowerCase().includes(q) ?? false) ||
        typeLabel.toLowerCase().includes(q) ||
        (r.subject ?? '').toLowerCase().includes(q) ||
        (r.details ?? '').toLowerCase().includes(q) ||
        r.status.includes(q)
      )
    },
    statusFn: (r, f) => requestMatchesStatusFilter(r, f),
    sortFns: {
      submitted: (a, b) => b.submittedAt.localeCompare(a.submittedAt),
      employee: (a, b) => {
        const ea = getEmployee(a.employeeId)
        const eb = getEmployee(b.employeeId)
        return `${ea?.lastName ?? ''}`.localeCompare(`${eb?.lastName ?? ''}`)
      },
      type: (a, b) => (a.requestType ?? '').localeCompare(b.requestType ?? ''),
    },
    defaultSortColumn: 'submitted',
    defaultSortDir: 'desc',
    defaultStatusFilter: 'all',
    defaultPageSize: 15,
  })

  if (user?.role === 'employee') {
    return <Navigate to="/ess/requests" replace />
  }

  if (!can('page:employees')) {
    return <Navigate to="/dashboard" replace />
  }

  function act(id: string, status: EmployeeRequestStatus, label: string) {
    const updated = updateEmployeeRequestStatus(id, status)
    if (updated) {
      setMessage(`${label} — ${updated.subject}.`)
      setTimeout(() => setMessage(null), 3500)
    } else {
      setMessage('This demo request is read-only. Approve employee-submitted requests from the list.')
      setTimeout(() => setMessage(null), 4000)
    }
  }

  return (
    <HrmsListShell current="Request management">
      <header className="wf-page-head" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="wf-h1">Request management</h1>
          <p className="wf-lead" style={{ marginBottom: 0 }}>
            Review submissions from self-service (marriage, Hajj, certificates, and other types). Approve,
            reject, or cancel pending items.
          </p>
        </div>
      </header>

      {message ? (
        <p className="ess-requests-toast" role="status" style={{ marginBottom: '1rem' }}>
          {message}
        </p>
      ) : null}

      <section className="hrms-kpi-grid" style={{ marginBottom: '1.25rem' }} aria-label="Request summary">
        <DashboardKpiCard
          static
          label="Pending approval"
          value={pendingCount}
          subtext="Awaiting HR / admin decision"
          icon={<i className="ri-time-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Approved"
          value={approvedCount}
          subtext="Processed requests"
          icon={<i className="ri-check-double-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="In scope"
          value={requests.length}
          subtext={`${roster.length} employees visible`}
          icon={<i className="ri-file-list-3-line" />}
          tone="primary"
        />
      </section>

      <DataListPanel
        title="All employee requests"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search employee, type, subject, or details…"
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        statusOptions={STATUS_OPTIONS}
        hasActiveFilters={list.hasActiveFilters || typeFilter !== ALL}
        onResetFilters={() => {
          list.resetFilters()
          setTypeFilter(ALL)
        }}
        toolbarExtra={
          <select
            className="hrms-ref-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value)
              list.setPage(1)
            }}
            aria-label="Request type filter"
          >
            <option value={ALL}>All types</option>
            {EMPLOYEE_REQUEST_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
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
                <th>Employee</th>
                <th>Type</th>
                <th>Details</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="hrms-empty">
                    No employee requests match your filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((r) => {
                  const emp = getEmployee(r.employeeId)
                  const dept = emp ? getDepartment(emp.departmentId) : undefined
                  const pending = isRequestPending(r.status)
                  const statusClass =
                    r.status === 'approved' || r.status === 'acknowledged'
                      ? 'approved'
                      : r.status === 'rejected'
                        ? 'rejected'
                        : r.status === 'cancelled' || r.status === 'closed'
                          ? 'cancelled'
                          : 'submitted'

                  return (
                    <tr key={r.id}>
                      <td className="font-medium">
                        {emp ? (
                          <>
                            <Link to={`/employees/${emp.id}`} style={{ color: '#2f4798' }}>
                              {emp.firstName} {emp.lastName}
                            </Link>
                            <div className="hrms-table-subtext">
                              <code>{emp.employeeNo}</code>
                              {dept ? ` · ${dept.name}` : null}
                            </div>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{r.requestType ? employeeRequestTypeLabel(r.requestType) : r.subject}</td>
                      <td className="ess-requests-details-cell" title={r.details}>
                        <span className="font-medium">{r.subject}</span>
                        <br />
                        <span className="text-sm" style={{ color: '#64748b' }}>
                          {r.details}
                        </span>
                      </td>
                      <td>{r.fromDate}</td>
                      <td>{r.toDate}</td>
                      <td>
                        <span className={`ess-requests-status ess-requests-status--${statusClass}`}>
                          {EMPLOYEE_REQUEST_STATUS_LABELS[r.status] ?? r.status}
                        </span>
                        {r.hrNote ? (
                          <div className="hrms-table-subtext" title={r.hrNote}>
                            {r.hrNote}
                          </div>
                        ) : null}
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {r.submittedAt}
                      </td>
                      <td>
                        {pending ? (
                          <RowActionsMenu
                            id={r.id}
                            actions={[
                              {
                                label: 'Approve',
                                onClick: () => act(r.id, 'approved', 'Approved'),
                              },
                              {
                                label: 'Reject',
                                onClick: () => act(r.id, 'rejected', 'Rejected'),
                                danger: true,
                              },
                              {
                                label: 'Cancel',
                                onClick: () => act(r.id, 'cancelled', 'Cancelled'),
                              },
                            ]}
                          />
                        ) : (
                          <span className="text-sm" style={{ color: '#94a3b8' }}>
                            —
                          </span>
                        )}
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
