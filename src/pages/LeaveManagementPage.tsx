import { type FormEvent, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DashboardKpiCard } from '../components/dashboard/DashboardKpiCard'
import { DataListPanel } from '../components/hrms/DataListPanel'
import {
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormModal,
  CompactFormRequired,
  CompactFormSection,
} from '../components/hrms/HrmsCompactForm'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { HrmsModal } from '../components/hrms/HrmsModal'
import { useWireframeData } from '../data/WireframeDataContext'
import {
  LEAVE_TYPE_LABELS,
  type LeaveTypeId,
} from '../data/leaveMock'
import { countLeaveDays } from '../data/leaveStore'
import { useListControls, type StatusFilter } from '../hooks/useListControls'
import { useLeaveHub } from '../leave/LeaveHubContext'
import { WIREFRAME_TODAY } from '../utils/attendanceStats'
import { summarizeLeaveForScope } from '../utils/leaveStats'
import '../styles/dashboard.css'
import './pages.css'

const ALL = 'all'

const LEAVE_STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'approved', label: 'Approved' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function LeaveManagementPage() {
  const { user, visibleEmployees } = useAuth()
  const { departments, getDepartment, getEmployee } = useWireframeData()
  const { requests, addManualLeave } = useLeaveHub()

  const [departmentFilter, setDepartmentFilter] = useState(ALL)
  const [typeFilter, setTypeFilter] = useState<LeaveTypeId | typeof ALL>(ALL)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const [employeeId, setEmployeeId] = useState('')
  const [leaveType, setLeaveType] = useState<LeaveTypeId>('sick')
  const [fromDate, setFromDate] = useState(WIREFRAME_TODAY)
  const [toDate, setToDate] = useState(WIREFRAME_TODAY)
  const [reason, setReason] = useState('')
  const [attachmentName, setAttachmentName] = useState('')

  if (user?.role === 'employee') {
    return <Navigate to="/ess/leave" replace />
  }

  const roster = useMemo(
    () =>
      visibleEmployees()
        .filter((e) => e.status === 'active')
        .sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
        ),
    [visibleEmployees],
  )

  const scopedIds = useMemo(() => new Set(roster.map((e) => e.id)), [roster])
  const scopedRequests = useMemo(
    () => requests.filter((r) => scopedIds.has(r.employeeId)),
    [requests, scopedIds],
  )

  const summary = useMemo(
    () => summarizeLeaveForScope(scopedRequests, roster.length),
    [scopedRequests, roster.length],
  )

  const departmentOptions = useMemo(() => {
    const ids = new Set(roster.map((e) => e.departmentId))
    return departments.filter((d) => ids.has(d.id)).sort((a, b) => a.name.localeCompare(b.name))
  }, [roster, departments])

  const draftDays = useMemo(() => countLeaveDays(fromDate, toDate), [fromDate, toDate])

  const filteredSource = useMemo(() => {
    return scopedRequests.filter((r) => {
      if (departmentFilter !== ALL) {
        const emp = getEmployee(r.employeeId)
        if (!emp || emp.departmentId !== departmentFilter) return false
      }
      if (typeFilter !== ALL && r.leaveType !== typeFilter) return false
      return true
    })
  }, [scopedRequests, departmentFilter, typeFilter, getEmployee])

  const list = useListControls(filteredSource, {
    searchFn: (r, q) => {
      const emp = getEmployee(r.employeeId)
      const dept = emp ? (getDepartment(emp.departmentId)?.name.toLowerCase() ?? '') : ''
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : ''
      return (
        name.includes(q) ||
        (emp?.employeeNo.toLowerCase().includes(q) ?? false) ||
        dept.includes(q) ||
        LEAVE_TYPE_LABELS[r.leaveType].toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        (r.attachmentFileName?.toLowerCase().includes(q) ?? false) ||
        (r.recordedBy?.toLowerCase().includes(q) ?? false)
      )
    },
    statusFn: (r, f) => {
      if (f === 'all') return true
      return r.status === f
    },
    sortFns: {
      recorded: (a, b) =>
        (b.recordedAt ?? b.submittedAt).localeCompare(a.recordedAt ?? a.submittedAt),
      employee: (a, b) => {
        const ea = getEmployee(a.employeeId)
        const eb = getEmployee(b.employeeId)
        return `${ea?.lastName ?? ''}`.localeCompare(`${eb?.lastName ?? ''}`)
      },
      from: (a, b) => b.fromDate.localeCompare(a.fromDate),
    },
    defaultSortColumn: 'recorded',
  })

  const hasExtraFilters = departmentFilter !== ALL || typeFilter !== ALL
  const hasActiveFilters = list.hasActiveFilters || hasExtraFilters

  function resetAll() {
    list.resetFilters()
    setDepartmentFilter(ALL)
    setTypeFilter(ALL)
  }

  function resetForm() {
    setEmployeeId('')
    setLeaveType('sick')
    setFromDate(WIREFRAME_TODAY)
    setToDate(WIREFRAME_TODAY)
    setReason('')
    setAttachmentName('')
  }

  function onAttachmentChange(file: File | undefined) {
    setAttachmentName(file?.name ?? '')
  }

  function submitManualLeave(ev: FormEvent) {
    ev.preventDefault()
    if (!employeeId || !reason.trim()) return
    if (fromDate > toDate) return

    const emp = getEmployee(employeeId)
    addManualLeave({
      employeeId,
      leaveType,
      fromDate,
      toDate,
      reason: reason.trim(),
      attachmentFileName: attachmentName || undefined,
      recordedBy: user?.displayName ?? user?.username ?? 'HR',
    })

    setSavedMsg(
      `Leave recorded for ${emp ? `${emp.firstName} ${emp.lastName}` : 'employee'} (${draftDays} day${draftDays === 1 ? '' : 's'}).`,
    )
    resetForm()
    setFormOpen(false)
  }

  function openAddLeave() {
    resetForm()
    setFormOpen(true)
  }

  function closeAddLeave() {
    setFormOpen(false)
  }

  return (
    <HrmsListShell current="Leave Management">
      {savedMsg ? (
        <p className="wf-note wf-note--ok" role="status" style={{ marginBottom: '1rem' }}>
          {savedMsg}
        </p>
      ) : null}

      <section className="hrms-kpi-grid" style={{ marginBottom: '1rem' }} aria-label="Leave summary">
        <DashboardKpiCard
          static
          label="Recorded (30 days)"
          value={summary.recorded30}
          subtext={`${summary.manual30} entered manually`}
          icon={<i className="ri-file-add-line" />}
          tone="info"
        />
        <DashboardKpiCard
          static
          label="Approved (30 days)"
          value={summary.approved30}
          subtext="Active leave records"
          icon={<i className="ri-checkbox-circle-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="On leave today"
          value={summary.onLeaveToday}
          subtext="Approved leave covering today"
          icon={<i className="ri-calendar-event-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Employees in scope"
          value={summary.headcount}
          subtext="Roster visible to you"
          icon={<i className="ri-team-line" />}
          tone="secondary"
        />
      </section>

      <DataListPanel
        title="Leave records"
        headerAction={
          <button type="button" className="hrms-btn-primary" onClick={openAddLeave}>
            <i className="ri-add-line" aria-hidden />
            Add leave
          </button>
        }
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search employee, centre, type, reason, or attachment..."
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
                <th>Reason / details</th>
                <th>Attachment</th>
                <th>Recorded</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="hrms-empty">
                    No leave records match your filters.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((r) => {
                  const emp = getEmployee(r.employeeId)
                  const dept = emp ? getDepartment(emp.departmentId) : undefined
                  const recorded = r.recordedAt ?? r.submittedAt
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
                        {r.attachmentFileName ? (
                          <span className="text-sm">
                            <i className="ri-attachment-2" aria-hidden /> {r.attachmentFileName}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {recorded}
                        {r.recordedBy ? (
                          <div className="wf-card-desc" style={{ marginTop: '0.2rem' }}>
                            by {r.recordedBy}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>

      <HrmsModal
        open={formOpen}
        onClose={closeAddLeave}
        title="Record leave"
        description="Enter leave on behalf of an employee. Upload supporting documents when required (e.g. medical certificate)."
        size="lg"
        footer={
          <>
            <button type="button" className="hrms-ref-btn-secondary" onClick={closeAddLeave}>
              Cancel
            </button>
            <button
              type="submit"
              form="leave-manual-entry-form"
              className="hrms-btn-primary"
              disabled={!employeeId || !reason.trim()}
            >
              <i className="ri-add-circle-line" aria-hidden />
              Add leave to system
            </button>
          </>
        }
      >
        <CompactFormModal id="leave-manual-entry-form" onSubmit={submitManualLeave}>
          <CompactFormSection legend="Employee & dates">
            <CompactFormGrid>
              <CompactFormField
                full
                label={
                  <>
                    Employee <CompactFormRequired />
                  </>
                }
              >
                <CompactFormInputWrap icon="ri-user-line">
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">— Select employee —</option>
                    {roster.map((e) => {
                      const dept = getDepartment(e.departmentId)
                      return (
                        <option key={e.id} value={e.id}>
                          {e.firstName} {e.lastName} · {e.employeeNo}
                          {dept ? ` · ${dept.name}` : ''}
                        </option>
                      )
                    })}
                  </select>
                </CompactFormInputWrap>
              </CompactFormField>
              <CompactFormField
                label={
                  <>
                    Leave type <CompactFormRequired />
                  </>
                }
              >
                <CompactFormInputWrap icon="ri-calendar-event-line">
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as LeaveTypeId)}
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
                      From date <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-calendar-line">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value)
                        if (e.target.value > toDate) setToDate(e.target.value)
                      }}
                      required
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormField
                  label={
                    <>
                      To date <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-calendar-line">
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(e) => setToDate(e.target.value)}
                      required
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
              </CompactFormGrid>
              <p className="hrms-compact-form-field__hint" style={{ margin: 0 }}>
                <i className="ri-calendar-2-line" aria-hidden /> {draftDays} calendar day
                {draftDays === 1 ? '' : 's'}
              </p>
            </CompactFormGrid>
          </CompactFormSection>

          <CompactFormSection legend="Details & attachment">
            <CompactFormGrid>
              <CompactFormField
                full
                label={
                  <>
                    Reason / details <CompactFormRequired />
                  </>
                }
              >
                <CompactFormInputWrap icon="ri-chat-3-line">
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Purpose of leave, hospital name, contact while away, etc."
                    required
                  />
                </CompactFormInputWrap>
              </CompactFormField>
              <CompactFormField
                full
                label="Supporting document"
                hint="Optional — e.g. medical certificate (PDF or image)."
              >
                <CompactFormInputWrap icon="ri-attachment-2">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => onAttachmentChange(e.target.files?.[0])}
                  />
                </CompactFormInputWrap>
                {attachmentName ? (
                  <span className="text-sm" style={{ color: '#64748b', marginTop: '0.35rem', display: 'block' }}>
                    Selected: {attachmentName}
                  </span>
                ) : null}
              </CompactFormField>
            </CompactFormGrid>
          </CompactFormSection>
        </CompactFormModal>
      </HrmsModal>
    </HrmsListShell>
  )
}
