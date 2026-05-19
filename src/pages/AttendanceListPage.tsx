import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ATTENDANCE_POLICY, attendanceLogs } from '../data/attendanceMock'
import { getEmployee } from '../data/mock'
import { employmentTypeLabel } from '../data/employmentStats'
import './pages.css'

export function AttendanceListPage() {
  const { can, visibleEmployees, actorEmployeeId, user } = useAuth()
  const canImport = can('page:attendance:import')
  const scopedIds = new Set(visibleEmployees().map((e) => e.id))
  const logs = attendanceLogs.filter((l) => scopedIds.has(l.employeeId))

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">Attendance</h1>
          <p className="wf-lead">
            Fixed <strong>{ATTENDANCE_POLICY.standardHours}h</strong> day ({ATTENDANCE_POLICY.coreStart}–
            {ATTENDANCE_POLICY.coreEnd}). Sheet import supported; secondary/temp job flagged per client.
          </p>
        </div>
        {canImport ? (
          <Link className="wf-btn wf-btn--primary" to="/attendance/import">
            Import sheet
          </Link>
        ) : null}
      </div>

      <div className="wf-grid wf-grid--3">
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Policy</div>
          <p className="wf-card-desc">
            Flexible timing: {ATTENDANCE_POLICY.flexibleTiming ? 'Yes' : 'No'} · Shifts:{' '}
            {ATTENDANCE_POLICY.shiftBased ? 'Yes' : 'No'}
          </p>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Logs (scope)</div>
          <div className="wf-card-stat">{logs.length}</div>
        </article>
        {user?.role === 'employee' && actorEmployeeId ? (
          <article className="wf-card wf-card--flat">
            <div className="wf-card-kicker">Your record</div>
            <Link className="wf-card-link" to={`/employees/${actorEmployeeId}`}>
              View profile →
            </Link>
          </article>
        ) : null}
      </div>

      <div className="wf-table-wrap wf-table-wrap--scroll">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Type</th>
              <th>In</th>
              <th>Out</th>
              <th>Hours</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => {
              const emp = getEmployee(l.employeeId)
              return (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>
                    {emp ? (
                      <Link to={`/employees/${emp.id}`}>
                        {emp.firstName} {emp.lastName}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{emp ? employmentTypeLabel(emp.employmentType) : '—'}</td>
                  <td>{l.checkIn}</td>
                  <td>{l.checkOut}</td>
                  <td>{l.hoursWorked}</td>
                  <td>
                    <span className={`wf-pill wf-pill--${l.status === 'present' ? 'active' : 'inactive'}`}>
                      {l.status}
                      {l.secondaryJob ? ' · 2nd job' : ''}
                    </span>
                  </td>
                  <td>{l.source}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
