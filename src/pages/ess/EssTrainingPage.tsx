import { useMemo, useState } from 'react'
import { DashboardKpiCard } from '../../components/dashboard/DashboardKpiCard'
import { useEssSession } from '../../ess/EssSessionContext'
import type { TrainingCourse, TrainingEnrollment } from '../../data/trainingMock'
import '../../styles/dashboard.css'
import '../pages.css'

const STATUS_LABEL: Record<TrainingEnrollment['status'], string> = {
  nominated: 'Nominated',
  approved: 'Approved',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export function EssTrainingPage() {
  const { employeeId, enrollments, catalog, metrics, nominateTraining, cancelTrainingNomination } =
    useEssSession()
  const [message, setMessage] = useState<string | null>(null)

  const nominatedCourseIds = useMemo(
    () => new Set(enrollments.filter((e) => e.status !== 'cancelled').map((e) => e.courseId)),
    [enrollments],
  )

  const stats = useMemo(
    () => ({
      total: metrics.trainingTotal,
      nominated: metrics.trainingNominated,
      approved: metrics.trainingApproved,
      completed: enrollments.filter((e) => e.status === 'completed').length,
    }),
    [metrics, enrollments],
  )

  function nominate(course: TrainingCourse) {
    const result = nominateTraining(course)
    setMessage(result.ok ? `Nomination submitted for "${course.title}". Dashboard updates automatically.` : result.message)
  }

  function cancelNomination(enrollment: TrainingEnrollment) {
    if (enrollment.status !== 'nominated') return
    cancelTrainingNomination(enrollment.id)
    setMessage(`Nomination for "${enrollment.courseTitle}" cancelled.`)
  }

  return (
    <div>
      <h2 className="wf-h2">My training</h2>
      <p className="wf-lead">Course catalogue, your nominations, and approved or completed enrollments.</p>

      {message ? (
        <p className="wf-note" style={{ marginBottom: '1rem' }}>
          {message}
        </p>
      ) : null}

      <section className="hrms-kpi-grid" style={{ marginBottom: '1.25rem' }} aria-label="Training summary">
        <DashboardKpiCard
          static
          label="Total"
          value={stats.total}
          icon={<i className="ri-book-open-line" />}
          tone="primary"
        />
        <DashboardKpiCard
          static
          label="Nominated"
          value={stats.nominated}
          icon={<i className="ri-send-plane-line" />}
          tone="warning"
        />
        <DashboardKpiCard
          static
          label="Approved"
          value={stats.approved}
          icon={<i className="ri-checkbox-circle-line" />}
          tone="success"
        />
        <DashboardKpiCard
          static
          label="Completed"
          value={stats.completed}
          icon={<i className="ri-award-line" />}
          tone="info"
        />
      </section>

      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
          My enrollments & nominations
        </h3>
        {enrollments.length === 0 ? (
          <p className="wf-note">No training records yet. Nominate from the catalogue below.</p>
        ) : (
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Provider</th>
                  <th>Duration</th>
                  <th>Nominated</th>
                  <th>Schedule</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td>{e.courseTitle}</td>
                    <td>{e.provider}</td>
                    <td>{e.durationDays} day(s)</td>
                    <td>{e.nominatedAt}</td>
                    <td>
                      {e.scheduledStart
                        ? `${e.scheduledStart}${e.scheduledEnd && e.scheduledEnd !== e.scheduledStart ? ` – ${e.scheduledEnd}` : ''}`
                        : '—'}
                    </td>
                    <td>
                      <span
                        className={`wf-pill wf-pill--${
                          e.status === 'completed' || e.status === 'approved' ? 'active' : 'inactive'
                        }`}
                      >
                        {STATUS_LABEL[e.status]}
                      </span>
                    </td>
                    <td>
                      {e.status === 'nominated' ? (
                        <button type="button" className="wf-link-quiet" onClick={() => cancelNomination(e)}>
                          Cancel
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
          Training catalogue
        </h3>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Provider</th>
                <th>Duration</th>
                <th>Seats</th>
                <th>Availability</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {catalog.map((c) => {
                const already = nominatedCourseIds.has(c.id)
                const canNominate = c.status === 'open' && !already && Boolean(employeeId)
                return (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.provider}</td>
                    <td>{c.durationDays} day(s)</td>
                    <td>
                      {c.enrolled}/{c.capacity}
                    </td>
                    <td>
                      <span className={`wf-pill wf-pill--${c.status === 'open' ? 'active' : 'inactive'}`}>
                        {c.status}
                      </span>
                      {already ? <span className="wf-pill" style={{ marginLeft: '0.35rem' }}>nominated</span> : null}
                    </td>
                    <td>
                      {canNominate ? (
                        <button type="button" className="wf-btn wf-btn--primary" onClick={() => nominate(c)}>
                          Nominate
                        </button>
                      ) : (
                        <span className="wf-card-desc">
                          {already ? 'Already nominated' : c.status === 'full' ? 'Full' : '—'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
