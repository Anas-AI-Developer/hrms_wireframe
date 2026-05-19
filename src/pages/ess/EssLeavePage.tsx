import { useState } from 'react'
import { useEssSession } from '../../ess/EssSessionContext'
import { LEAVE_TYPE_LABELS, type LeaveTypeId } from '../../data/leaveMock'
import '../pages.css'

export function EssLeavePage() {
  const { leaveRequests, leaveBalance, addLeaveRequest } = useEssSession()
  const [draftType, setDraftType] = useState<LeaveTypeId>('casual')
  const [fromDate, setFromDate] = useState('2026-05-20')
  const [toDate, setToDate] = useState('2026-05-21')
  const [reason, setReason] = useState('Personal')
  const [message, setMessage] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const from = new Date(fromDate)
    const to = new Date(toDate)
    const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
    addLeaveRequest({ leaveType: draftType, fromDate, toDate, days, reason })
    setMessage('Leave request submitted — open Dashboard to see the updated pending count.')
  }

  return (
    <div>
      <h2 className="wf-h2">My leave</h2>
      <p className="wf-lead">Balances, submit requests, and track approval (manager → HR).</p>
      {message ? <p className="wf-note">{message}</p> : null}
      {leaveBalance ? (
        <section className="wf-section">
          <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
            Leave balance
          </h3>
          <div className="wf-grid wf-grid--4">
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Casual</div>
              <div className="wf-card-stat">{leaveBalance.casual}</div>
            </article>
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Sick</div>
              <div className="wf-card-stat">{leaveBalance.sick}</div>
            </article>
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Annual</div>
              <div className="wf-card-stat">{leaveBalance.annual}</div>
            </article>
            <article className="wf-card wf-card--flat">
              <div className="wf-card-kicker">Emergency</div>
              <div className="wf-card-stat">{leaveBalance.emergency}</div>
            </article>
          </div>
          <form className="wf-form" style={{ marginTop: '1rem' }} onSubmit={submit}>
            <div className="wf-form-grid">
              <label className="wf-field">
                <span>Type</span>
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
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              </label>
              <label className="wf-field">
                <span>To</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              </label>
              <label className="wf-field wf-field--full">
                <span>Reason</span>
                <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} />
              </label>
            </div>
            <button type="submit" className="wf-btn wf-btn--primary">
              Submit request
            </button>
          </form>
        </section>
      ) : null}
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
          My requests
        </h3>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((r) => (
                <tr key={r.id}>
                  <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                  <td>{r.fromDate}</td>
                  <td>{r.toDate}</td>
                  <td>{r.days}</td>
                  <td>{r.reason}</td>
                  <td>
                    <span className="wf-pill">{r.status}</span>
                  </td>
                  <td>{r.approverNote ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
