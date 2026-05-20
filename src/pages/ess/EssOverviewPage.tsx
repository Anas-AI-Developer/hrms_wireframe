import { Link } from 'react-router-dom'
import '../../components/PortalHomePanel.css'
import { useAuth } from '../../auth/AuthContext'
import { getEmployee } from '../../data/mock'
import {
  getEssAttendance,
  getEssBenefits,
  getEssLeaveRequests,
  getEssOpenCycle,
  getEssPayslip,
  getEssTraining,
} from '../../data/essSeed'
import { LEAVE_TYPE_LABELS } from '../../data/leaveMock'
import '../pages.css'

export function EssOverviewPage() {
  const { actorEmployeeId, can } = useAuth()
  const employeeId = actorEmployeeId ?? ''
  const profile = employeeId ? getEmployee(employeeId) : undefined
  const leaves = employeeId ? getEssLeaveRequests(employeeId) : []
  const pendingLeave = leaves.filter((r) => r.status === 'pending').length
  const attendance = employeeId ? getEssAttendance(employeeId) : []
  const present = attendance.filter((a) => a.status === 'present' || a.status === 'late').length
  const slip = employeeId ? getEssPayslip(employeeId) : null
  const training = employeeId ? getEssTraining(employeeId) : []
  const benefits = employeeId ? getEssBenefits(employeeId) : []
  const cycle = getEssOpenCycle()

  if (!profile) {
    return (
      <div className="hrms-portal-panel">
        <p className="wf-note wf-note--warn">
          No employee record linked. Try <strong>emp.chowkidar</strong> or <strong>emp.deo</strong> / password{' '}
          <strong>11223344</strong>.
        </p>
      </div>
    )
  }

  return (
    <div>
      <section className="hrms-portal-panel" style={{ maxWidth: 'none', marginBottom: '1.25rem' }}>
        <header className="hrms-portal-panel__header">
          <h2 className="hrms-portal-panel__title">Welcome back</h2>
          <p className="hrms-portal-panel__subtitle">Use the sidebar to open leave, attendance, payslip, and other services.</p>
        </header>
        <div className="hrms-portal-panel__body">
          <div className="wf-grid wf-grid--3">
            {can('page:leave') ? (
              <article className="wf-card wf-card--flat">
                <div className="wf-card-kicker">Leave</div>
                <div className="wf-card-stat">{pendingLeave}</div>
                <Link className="wf-card-link" to="/ess/leave">My leave →</Link>
              </article>
            ) : null}
            {can('page:attendance') ? (
              <article className="wf-card wf-card--flat">
                <div className="wf-card-kicker">Attendance</div>
                <div className="wf-card-stat">{present}</div>
                <Link className="wf-card-link" to="/ess/attendance">My attendance →</Link>
              </article>
            ) : null}
            {can('page:payslip') && slip ? (
              <article className="wf-card wf-card--flat">
                <div className="wf-card-kicker">Payslip</div>
                <div className="wf-card-desc">{slip.periodLabel}</div>
                <Link className="wf-card-link" to="/ess/payslip">My payslip →</Link>
              </article>
            ) : null}
          </div>
        </div>
      </section>
      {leaves.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Recent leave</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr>
              </thead>
              <tbody>
                {leaves.slice(0, 3).map((r) => (
                  <tr key={r.id}>
                    <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                    <td>{r.fromDate} → {r.toDate}</td>
                    <td>{r.days}</td>
                    <td><span className="wf-pill">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <p className="wf-note">
        Cycle: {cycle?.title} · Training {training.length} · Benefits {benefits.length}
        {employeeId ? (
          <>
            {' '}
            ·{' '}
            <Link className="wf-link-quiet" to={`/employees/${employeeId}`}>
              Full employee profile →
            </Link>
          </>
        ) : null}
      </p>
    </div>
  )
}
