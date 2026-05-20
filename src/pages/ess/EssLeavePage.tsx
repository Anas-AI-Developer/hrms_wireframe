import { useMemo, useState, type FormEvent } from 'react'
import { HrmsModal } from '../../components/hrms/HrmsModal'
import { LeaveStatusBadge } from '../../components/hrms/LeaveStatusBadge'
import { useEssSession } from '../../ess/EssSessionContext'
import { LEAVE_TYPE_LABELS, type LeaveTypeId } from '../../data/leaveMock'
import { WIREFRAME_TODAY } from '../../utils/attendanceStats'
import '../../styles/ess-leave.css'
import '../pages.css'

type BalanceKey = 'casual' | 'sick' | 'annual' | 'emergency'

const BALANCE_CARDS: {
  key: BalanceKey
  label: string
  icon: string
  tone: 'primary' | 'success' | 'warning' | 'info'
}[] = [
  { key: 'casual', label: 'Casual', icon: 'ri-sun-line', tone: 'primary' },
  { key: 'sick', label: 'Sick', icon: 'ri-heart-pulse-line', tone: 'success' },
  { key: 'annual', label: 'Annual', icon: 'ri-flight-takeoff-line', tone: 'warning' },
  { key: 'emergency', label: 'Emergency', icon: 'ri-alarm-warning-line', tone: 'info' },
]

function countDays(fromDate: string, toDate: string): number {
  const from = new Date(`${fromDate}T12:00:00`)
  const to = new Date(`${toDate}T12:00:00`)
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 1
  return Math.max(1, Math.round((to.getTime() - from.getTime()) / 86400000) + 1)
}

export function EssLeavePage() {
  const { leaveRequests, leaveBalance, addLeaveRequest } = useEssSession()
  const [modalOpen, setModalOpen] = useState(false)
  const [draftType, setDraftType] = useState<LeaveTypeId>('casual')
  const [fromDate, setFromDate] = useState('2026-05-20')
  const [toDate, setToDate] = useState('2026-05-21')
  const [reason, setReason] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const draftDays = useMemo(() => countDays(fromDate, toDate), [fromDate, toDate])

  function openModal() {
    setDraftType('casual')
    setFromDate('2026-05-20')
    setToDate('2026-05-21')
    setReason('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return
    const days = draftDays
    addLeaveRequest({ leaveType: draftType, fromDate, toDate, days, reason: reason.trim() })
    setMessage('Your leave request was submitted and is pending manager approval.')
    closeModal()
  }

  return (
    <div className="ess-page ess-leave-page">
      <header className="ess-leave-page__head">
        <div>
          <h2 className="wf-h2" style={{ marginBottom: '0.35rem' }}>
            My leave
          </h2>
          <p className="wf-lead">Balances, submit requests, and track approval (manager → HR).</p>
        </div>
        <button type="button" className="hrms-btn-primary" onClick={openModal}>
          <i className="ri-calendar-event-line" aria-hidden /> Request leave
        </button>
      </header>

      {message ? (
        <p className="ess-leave-toast" role="status">
          {message}
        </p>
      ) : null}

      {leaveBalance ? (
        <section className="ess-leave-balance-row" aria-label="Leave balance">
          {BALANCE_CARDS.map(({ key, label, icon, tone }) => (
            <article key={key} className="ess-leave-balance-card">
              <span className={`ess-leave-balance-card__icon ess-leave-balance-card__icon--${tone}`} aria-hidden>
                <i className={icon} />
              </span>
              <div className="ess-leave-balance-card__meta">
                <span className="ess-leave-balance-card__label">{label}</span>
                <span className="ess-leave-balance-card__value">{leaveBalance[key]}</span>
                <span className="ess-leave-balance-card__sub">days left</span>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <article className="hrms-ref-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">My requests</h2>
        </header>
        <div className="hrms-ref-panel-body hrms-ref-panel-body--flush">
          <div className="hrms-data-table-wrap">
            <table className="hrms-data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="hrms-empty">
                      No leave requests yet. Click <strong>Request leave</strong> to submit one.
                    </td>
                  </tr>
                ) : (
                  leaveRequests.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium">{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                      <td>{r.fromDate}</td>
                      <td>{r.toDate}</td>
                      <td>{r.days}</td>
                      <td>{r.reason}</td>
                      <td>
                        <LeaveStatusBadge status={r.status} />
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {r.submittedAt}
                      </td>
                      <td>{r.approverNote ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="hrms-list-footnote">
            Demo as of {WIREFRAME_TODAY}. Approval chain: manager → HR.
          </p>
        </div>
      </article>

      <HrmsModal
        open={modalOpen}
        onClose={closeModal}
        title="Request leave"
        description="Submit dates and reason. Your manager will review before HR finalizes."
        size="lg"
        footer={
          <>
            <button type="button" className="hrms-ref-btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" form="ess-leave-request-form" className="hrms-btn-primary">
              <i className="ri-send-plane-line" aria-hidden /> Submit request
            </button>
          </>
        }
      >
        <form id="ess-leave-request-form" className="hrms-modal-form" onSubmit={submit}>
          <div className="hrms-modal-form__field">
            <label htmlFor="ess-leave-type">Leave type</label>
            <select
              id="ess-leave-type"
              value={draftType}
              onChange={(ev) => setDraftType(ev.target.value as LeaveTypeId)}
            >
              {(Object.keys(LEAVE_TYPE_LABELS) as LeaveTypeId[]).map((t) => (
                <option key={t} value={t}>
                  {LEAVE_TYPE_LABELS[t]}
                  {leaveBalance ? ` · ${leaveBalance[t]} days left` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="hrms-modal-form__row">
            <div className="hrms-modal-form__field">
              <label htmlFor="ess-leave-from">From</label>
              <input
                id="ess-leave-from"
                type="date"
                value={fromDate}
                min={WIREFRAME_TODAY}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  if (e.target.value > toDate) setToDate(e.target.value)
                }}
                required
              />
            </div>
            <div className="hrms-modal-form__field">
              <label htmlFor="ess-leave-to">To</label>
              <input
                id="ess-leave-to"
                type="date"
                value={toDate}
                min={fromDate}
                onChange={(e) => setToDate(e.target.value)}
                required
              />
            </div>
          </div>
          <p className="hrms-modal-form__days" aria-live="polite">
            <i className="ri-calendar-2-line" aria-hidden />
            {draftDays} day{draftDays === 1 ? '' : 's'} requested
          </p>
          <div className="hrms-modal-form__field">
            <label htmlFor="ess-leave-reason">Reason</label>
            <textarea
              id="ess-leave-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for your manager…"
              required
            />
          </div>
          <p className="hrms-modal-form__hint">
            Requests are routed to your line manager, then HR. You will see status updates in the table
            below.
          </p>
        </form>
      </HrmsModal>
    </div>
  )
}
