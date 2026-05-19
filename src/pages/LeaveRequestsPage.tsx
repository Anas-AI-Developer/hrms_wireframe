import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import {
  LEAVE_TYPE_LABELS,
  getLeaveBalance,
  getLeaveRequestsForEmployee,
  leaveRequests,
  type LeaveTypeId,
} from '../data/leaveMock'
import { getEmployee } from '../data/mock'
import './pages.css'

export function LeaveRequestsPage() {
  const { can, visibleEmployees, actorEmployeeId, user } = useAuth()
  const canRequest = can('leave.request')
  const roster = visibleEmployees()
  const scopedIds = new Set(roster.map((e) => e.id))
  const isEmployee = user?.role === 'employee'

  const visible = isEmployee && actorEmployeeId
    ? leaveRequests.filter((r) => r.employeeId === actorEmployeeId)
    : leaveRequests.filter((r) => scopedIds.has(r.employeeId))

  const balance = actorEmployeeId ? getLeaveBalance(actorEmployeeId) : undefined

  const [draftType, setDraftType] = useState<LeaveTypeId>('casual')

  function submitMock() {
    if (!actorEmployeeId) return
    alert(`Wireframe: ${LEAVE_TYPE_LABELS[draftType]} request submitted for approval.`)
  }

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">Leave requests</h1>
          <p className="wf-lead">
            Types: Casual, Sick, Annual, Emergency. Approval: manager → HR (configurable in admin settings).
          </p>
        </div>
        {can('page:leave:approvals') ? (
          <Link className="wf-btn wf-btn--ghost" to="/leave/approvals">
            Pending approvals
          </Link>
        ) : null}
      </div>

      {canRequest && balance ? (
        <section className="wf-section">
          <h2 className="wf-h2">Your balances (demo)</h2>
          <div className="wf-grid wf-grid--3">
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Casual</div>
              <div className="wf-card-stat">{balance.casual}</div>
            </article>
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Sick</div>
              <div className="wf-card-stat">{balance.sick}</div>
            </article>
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Annual</div>
              <div className="wf-card-stat">{balance.annual}</div>
            </article>
          </div>
          <form
            className="wf-form"
            style={{ marginTop: '1rem' }}
            onSubmit={(e) => {
              e.preventDefault()
              submitMock()
            }}
          >
            <div className="wf-form-grid">
              <label className="wf-field">
                <span>Leave type</span>
                <select value={draftType} onChange={(ev) => setDraftType(ev.target.value as LeaveTypeId)}>
                  {(Object.keys(LEAVE_TYPE_LABELS) as LeaveTypeId[]).map((t) => (
                    <option key={t} value={t}>
                      {LEAVE_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="wf-field">
                <span>From</span>
                <input type="date" defaultValue="2026-05-01" />
              </label>
              <label className="wf-field">
                <span>To</span>
                <input type="date" defaultValue="2026-05-02" />
              </label>
            </div>
            <button type="submit" className="wf-btn wf-btn--primary">
              Submit request (mock)
            </button>
          </form>
        </section>
      ) : null}

      <div className="wf-table-wrap wf-table-wrap--scroll">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => {
              const emp = getEmployee(r.employeeId)
              return (
                <tr key={r.id}>
                  <td>
                    {emp ? (
                      <Link to={`/employees/${r.employeeId}`}>
                        {emp.firstName} {emp.lastName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                  <td>{r.fromDate}</td>
                  <td>{r.toDate}</td>
                  <td>{r.days}</td>
                  <td>
                    <span className={`wf-pill wf-pill--${r.status === 'approved' ? 'active' : 'inactive'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isEmployee && actorEmployeeId ? (
        <p className="wf-note">
          Showing {getLeaveRequestsForEmployee(actorEmployeeId).length} request(s) for your account.
        </p>
      ) : null}
    </div>
  )
}
