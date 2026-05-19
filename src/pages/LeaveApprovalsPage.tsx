import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { LEAVE_TYPE_LABELS, getPendingLeaveForApprover, leaveRequests } from '../data/leaveMock'
import { employees, getEmployee } from '../data/mock'
import './pages.css'

export function LeaveApprovalsPage() {
  const { can, actorEmployeeId, user } = useAuth()
  const canApprove = can('leave.approve')

  const pending =
    user?.role === 'employee' || !actorEmployeeId
      ? []
      : ['executive_director', 'director_general'].includes(user!.role)
        ? leaveRequests.filter((r) => r.status === 'pending')
        : getPendingLeaveForApprover(actorEmployeeId, employees)

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-breadcrumb">
        <Link to="/leave">Leave</Link>
        <span aria-hidden> / </span>
        <span>Approvals</span>
      </div>
      <h1 className="wf-h1">Leave approvals</h1>
      <p className="wf-lead">Manager approval first, then HR where configured. Wireframe actions are mock only.</p>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Days</th>
              <th>Reason</th>
              {canApprove ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {pending.length === 0 ? (
              <tr>
                <td colSpan={canApprove ? 6 : 5}>No pending requests in your scope.</td>
              </tr>
            ) : (
              pending.map((r) => {
                const emp = getEmployee(r.employeeId)
                return (
                  <tr key={r.id}>
                    <td>
                      {emp ? `${emp.firstName} ${emp.lastName}` : '—'}
                      {emp?.managerId ? (
                        <div className="wf-card-desc">Mgr: {getEmployee(emp.managerId)?.firstName ?? '—'}</div>
                      ) : null}
                    </td>
                    <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                    <td>
                      {r.fromDate} → {r.toDate}
                    </td>
                    <td>{r.days}</td>
                    <td>{r.reason}</td>
                    {canApprove ? (
                      <td className="wf-table-actions">
                        <button
                          type="button"
                          className="wf-btn wf-btn--primary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          onClick={() => alert('Wireframe: approved')}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          className="wf-btn wf-btn--ghost"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                          onClick={() => alert('Wireframe: rejected')}
                        >
                          Reject
                        </button>
                      </td>
                    ) : null}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
