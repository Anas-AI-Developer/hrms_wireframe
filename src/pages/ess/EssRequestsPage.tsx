import { useMemo, useState, type FormEvent } from 'react'
import {
  CompactFormAlert,
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormModal,
  CompactFormRequired,
} from '../../components/hrms/HrmsCompactForm'
import { HrmsModal } from '../../components/hrms/HrmsModal'
import { useEssSession } from '../../ess/EssSessionContext'
import { WIREFRAME_TODAY } from '../../utils/attendanceStats'
import '../../styles/ess-requests.css'
import '../pages.css'

const STATUS_LABELS = {
  submitted: 'Submitted',
  acknowledged: 'Acknowledged',
  closed: 'Closed',
} as const

export function EssRequestsPage() {
  const { employeeRequests, addEmployeeRequest } = useEssSession()
  const [modalOpen, setModalOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [fromDate, setFromDate] = useState(WIREFRAME_TODAY)
  const [toDate, setToDate] = useState(WIREFRAME_TODAY)
  const [formError, setFormError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const sorted = useMemo(
    () => [...employeeRequests].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)),
    [employeeRequests],
  )

  function openModal() {
    setSubject('')
    setDetails('')
    setFromDate(WIREFRAME_TODAY)
    setToDate(WIREFRAME_TODAY)
    setFormError(null)
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setFormError(null)
  }

  function submit(ev: FormEvent) {
    ev.preventDefault()
    if (!subject.trim()) {
      setFormError('Subject is required.')
      return
    }
    if (!details.trim()) {
      setFormError('Details are required.')
      return
    }
    if (fromDate > toDate) {
      setFormError('End date must be on or after the from date.')
      return
    }
    addEmployeeRequest({
      subject: subject.trim(),
      details: details.trim(),
      fromDate,
      toDate,
    })
    setMessage('Your request was submitted. Only you can see it in this list.')
    closeModal()
  }

  return (
    <div className="ess-page ess-requests-page">
      <header className="ess-requests-page__head">
        <div>
          <h2 className="wf-h2" style={{ marginBottom: '0.35rem' }}>
            My requests
          </h2>
          <p className="wf-lead">Submit requests and view your submission history below.</p>
        </div>
        <button type="button" className="hrms-btn-primary" onClick={openModal}>
          <i className="ri-file-add-line" aria-hidden /> New request
        </button>
      </header>

      {message ? (
        <p className="ess-requests-toast" role="status">
          {message}
        </p>
      ) : null}

      <article className="hrms-ref-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Requests you have made</h2>
        </header>
        <div className="hrms-ref-panel-body hrms-ref-panel-body--flush">
          <div className="hrms-data-table-wrap">
            <table className="hrms-data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Details</th>
                  <th>From</th>
                  <th>End</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="hrms-empty">
                      No requests yet. Click <strong>New request</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  sorted.map((r) => (
                    <tr key={r.id}>
                      <td className="font-medium">{r.subject}</td>
                      <td className="ess-requests-details-cell" title={r.details}>
                        {r.details}
                      </td>
                      <td>{r.fromDate}</td>
                      <td>{r.toDate}</td>
                      <td>
                        <span className={`ess-requests-status ess-requests-status--${r.status}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {r.submittedAt}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <HrmsModal
        open={modalOpen}
        onClose={closeModal}
        title="New request"
        description="Provide a subject, full details, and the date range that applies to your request."
        size="lg"
        footer={
          <>
            <button type="button" className="hrms-ref-btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" form="ess-employee-request-form" className="hrms-btn-primary">
              <i className="ri-send-plane-line" aria-hidden /> Submit request
            </button>
          </>
        }
      >
        <CompactFormModal id="ess-employee-request-form" onSubmit={submit}>
          {formError ? <CompactFormAlert>{formError}</CompactFormAlert> : null}
          <CompactFormField
            htmlFor="ess-req-subject"
            label={
              <>
                Subject <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon="ri-text">
              <input
                id="ess-req-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Equipment repair, duty travel, document update"
                maxLength={120}
                required
              />
            </CompactFormInputWrap>
          </CompactFormField>
          <CompactFormGrid split>
            <CompactFormField
              htmlFor="ess-req-from"
              label={
                <>
                  From date <CompactFormRequired />
                </>
              }
            >
              <CompactFormInputWrap icon="ri-calendar-line">
                <input
                  id="ess-req-from"
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
              htmlFor="ess-req-to"
              label={
                <>
                  End date <CompactFormRequired />
                </>
              }
            >
              <CompactFormInputWrap icon="ri-calendar-line">
                <input
                  id="ess-req-to"
                  type="date"
                  value={toDate}
                  min={fromDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </CompactFormInputWrap>
            </CompactFormField>
          </CompactFormGrid>
          <CompactFormField
            htmlFor="ess-req-details"
            label={
              <>
                Details <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon="ri-file-text-line">
              <textarea
                id="ess-req-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe what you need, relevant context, and any reference numbers…"
                rows={5}
                required
              />
            </CompactFormInputWrap>
          </CompactFormField>
        </CompactFormModal>
      </HrmsModal>
    </div>
  )
}
