import { useEssSession } from '../../ess/EssSessionContext'
import { LEAVE_TYPE_LABELS } from '../../data/leaveMock'
import { WIREFRAME_TODAY } from '../../utils/attendanceStats'
import '../../styles/ess-leave.css'
import '../pages.css'

export function EssLeavePage() {
  const { leaveRequests, leaveBalance } = useEssSession()

  return (
    <div className="ess-page ess-leave-page">
      <header className="ess-leave-page__head">
        <div>
          <h2 className="wf-h2" style={{ marginBottom: '0.35rem' }}>
            My leave
          </h2>
          <p className="wf-lead">Leave recorded by HR. Contact your directorate to update balances or dates.</p>
        </div>
      </header>

      {leaveBalance ? (
        <section className="ess-leave-balance-row" aria-label="Leave balance">
          {(
            [
              { key: 'casual' as const, label: 'Casual', icon: 'ri-sun-line', tone: 'primary' },
              { key: 'sick' as const, label: 'Sick', icon: 'ri-heart-pulse-line', tone: 'success' },
              { key: 'annual' as const, label: 'Annual', icon: 'ri-flight-takeoff-line', tone: 'warning' },
              { key: 'emergency' as const, label: 'Emergency', icon: 'ri-alarm-warning-line', tone: 'info' },
            ] as const
          ).map(({ key, label, icon, tone }) => (
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
          <h2 className="hrms-ref-panel-title">My leave records</h2>
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
                  <th>Reason / details</th>
                  <th>Attachment</th>
                  <th>Recorded</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="hrms-empty">
                      No leave on file yet. HR will add records when your leave is approved and entered in the
                      system.
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
                        {r.attachmentFileName ? (
                          <span className="text-sm">
                            <i className="ri-attachment-2" aria-hidden /> {r.attachmentFileName}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {r.recordedAt ?? r.submittedAt}
                        {r.recordedBy ? (
                          <div className="wf-card-desc" style={{ marginTop: '0.2rem' }}>
                            by {r.recordedBy}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="hrms-list-footnote">Records as of {WIREFRAME_TODAY}.</p>
        </div>
      </article>
    </div>
  )
}
