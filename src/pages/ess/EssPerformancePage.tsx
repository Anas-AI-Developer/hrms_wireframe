import { useMemo, useState, type FormEvent } from 'react'
import {
  CompactFormField,
  CompactFormInputWrap,
  CompactFormModal,
} from '../../components/hrms/HrmsCompactForm'
import { HrmsModal } from '../../components/hrms/HrmsModal'
import { useAuth } from '../../auth/AuthContext'
import { getEssOpenCycle } from '../../data/essSeed'
import type { PerformanceGoal } from '../../data/performanceMock'
import {
  PERFORMANCE_RATINGS,
  ratingScore,
  updatePerformanceGoal,
} from '../../data/performanceStore'
import { usePerformanceGoals } from '../../hooks/usePerformanceStore'
import '../../styles/ess-performance.css'
import '../pages.css'

function RatingDisplay({ value, pendingLabel }: { value?: string; pendingLabel: string }) {
  if (!value) {
    return <span className="ess-performance-rating-pill ess-performance-rating-pill--pending">{pendingLabel}</span>
  }
  const score = ratingScore(value)
  return (
    <span className="ess-performance-rating-pill">
      {score ? (
        <>
          <i className="ri-star-fill" style={{ color: '#f59e0b' }} aria-hidden />
          {value}
        </>
      ) : (
        value
      )}
    </span>
  )
}

function GoalCard({
  goal,
  onSelfRate,
}: {
  goal: PerformanceGoal
  onSelfRate: (goal: PerformanceGoal) => void
}) {
  return (
    <article className="ess-performance-goal-card">
      <div className="ess-performance-goal-card__head">
        <div>
          <h3 className="ess-performance-goal-card__title">{goal.goalTitle}</h3>
          <p className="ess-performance-goal-card__target">
            <i className="ri-focus-3-line" aria-hidden style={{ marginRight: '0.35rem' }} />
            {goal.target}
          </p>
        </div>
        {!goal.selfRating ? (
          <button type="button" className="hrms-ref-btn-secondary" onClick={() => onSelfRate(goal)}>
            <i className="ri-edit-line" aria-hidden /> Self-assess
          </button>
        ) : null}
      </div>
      <div className="ess-performance-ratings">
        <div className="ess-performance-rating-block">
          <div className="ess-performance-rating-block__label">Your rating</div>
          <RatingDisplay value={goal.selfRating} pendingLabel="Not submitted" />
        </div>
        <div className="ess-performance-rating-block ess-performance-rating-block--manager">
          <div className="ess-performance-rating-block__label">Manager rating</div>
          <RatingDisplay value={goal.managerRating} pendingLabel="Awaiting review" />
        </div>
      </div>
      {goal.managerComment ? (
        <div className="ess-performance-manager-note">
          <strong>Manager feedback</strong>
          {goal.managerComment}
        </div>
      ) : null}
    </article>
  )
}

export function EssPerformancePage() {
  const { actorEmployeeId } = useAuth()
  const cycle = getEssOpenCycle()
  const goals = usePerformanceGoals(actorEmployeeId ?? '')

  const openGoals = useMemo(
    () => goals.filter((g) => !g.cycleId || g.cycleId === cycle.id),
    [goals, cycle.id],
  )

  const [selfModal, setSelfModal] = useState<PerformanceGoal | null>(null)
  const [selfRating, setSelfRating] = useState<string>(PERFORMANCE_RATINGS[3])
  const [toast, setToast] = useState<string | null>(null)

  const stats = useMemo(() => {
    const selfDone = openGoals.filter((g) => g.selfRating).length
    const managerDone = openGoals.filter((g) => g.managerRating).length
    const scores = openGoals.map((g) => ratingScore(g.managerRating)).filter((n): n is number => n !== null)
    const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : null
    return { selfDone, managerDone, avg }
  }, [openGoals])

  if (!actorEmployeeId) {
    return (
      <div className="ess-page ess-performance-page">
        <h2 className="wf-h2">My performance</h2>
        <p className="wf-note wf-note--warn" style={{ marginTop: '1rem' }}>
          No employee profile is linked to this account. Try logging in again as <strong>emp.dmo</strong> (password{' '}
          <strong>11223344</strong>).
        </p>
      </div>
    )
  }

  function openSelfRate(goal: PerformanceGoal) {
    setSelfModal(goal)
    setSelfRating(goal.selfRating ?? PERFORMANCE_RATINGS[3])
  }

  function submitSelf(ev: FormEvent) {
    ev.preventDefault()
    if (!selfModal) return
    updatePerformanceGoal(selfModal.id, { selfRating })
    setToast('Self-assessment saved.')
    setSelfModal(null)
  }

  return (
    <div className="ess-page ess-performance-page">
      <header className="ess-performance-page__head">
        <h2 className="wf-h2" style={{ marginBottom: '0.35rem' }}>
          My performance
        </h2>
        <p className="wf-lead">Goals, self-assessment, and manager ratings for the open cycle.</p>
      </header>

      {toast ? (
        <p className="ess-requests-toast" role="status" style={{ marginBottom: '1rem' }}>
          {toast}
        </p>
      ) : null}

      <section className="ess-performance-cycle" aria-label="Appraisal cycle">
        <div>
          <div className="ess-performance-cycle__label">Open cycle</div>
          <h3 className="ess-performance-cycle__title">{cycle.title}</h3>
          <p className="ess-performance-cycle__dates">
            {cycle.startDate} — {cycle.endDate}
          </p>
        </div>
        <span className="ess-performance-cycle__badge">
          <i className="ri-checkbox-circle-fill" aria-hidden />
          {cycle.status}
        </span>
      </section>

      {openGoals.length > 0 ? (
        <>
          <div className="ess-performance-kpi-row" aria-label="Progress summary">
            <div className="ess-performance-kpi">
              <div className="ess-performance-kpi__value">{openGoals.length}</div>
              <div className="ess-performance-kpi__label">Goals assigned</div>
            </div>
            <div className="ess-performance-kpi">
              <div className="ess-performance-kpi__value">
                {stats.selfDone}/{openGoals.length}
              </div>
              <div className="ess-performance-kpi__label">Self-assessment done</div>
            </div>
            <div className="ess-performance-kpi">
              <div className="ess-performance-kpi__value">
                {stats.managerDone}/{openGoals.length}
              </div>
              <div className="ess-performance-kpi__label">Manager reviewed</div>
            </div>
          </div>

          {stats.avg ? (
            <section className="ess-performance-summary" aria-label="Manager overall">
              <h3 className="ess-performance-summary__title">Manager review summary</h3>
              <div className="ess-performance-summary__score">{stats.avg} / 5</div>
              <p className="ess-performance-summary__sub">
                Average across {stats.managerDone} goal{stats.managerDone === 1 ? '' : 's'} rated by your manager
              </p>
            </section>
          ) : null}

          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">My goals</h2>
            </header>
            <div className="hrms-ref-panel-body">
              <div className="ess-performance-goals">
                {openGoals.map((g) => (
                  <GoalCard key={g.id} goal={g} onSelfRate={openSelfRate} />
                ))}
              </div>
            </div>
          </article>
        </>
      ) : (
        <div className="ess-performance-empty">
          <div className="ess-performance-empty__icon" aria-hidden>
            <i className="ri-bar-chart-box-line" />
          </div>
          <p>No goals assigned for this cycle yet. Your manager will add them during appraisal.</p>
        </div>
      )}

      <HrmsModal
        open={Boolean(selfModal)}
        onClose={() => setSelfModal(null)}
        title="Self-assessment"
        description={selfModal ? selfModal.goalTitle : undefined}
        footer={
          <>
            <button type="button" className="hrms-ref-btn-secondary" onClick={() => setSelfModal(null)}>
              Cancel
            </button>
            <button type="submit" form="ess-self-rating-form" className="hrms-btn-primary">
              Save rating
            </button>
          </>
        }
      >
        <CompactFormModal id="ess-self-rating-form" onSubmit={submitSelf}>
          <CompactFormField htmlFor="ess-self-rating" label="Your rating">
            <CompactFormInputWrap icon="ri-star-line">
              <select
                id="ess-self-rating"
                value={selfRating}
                onChange={(e) => setSelfRating(e.target.value)}
              >
                {PERFORMANCE_RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        </CompactFormModal>
      </HrmsModal>
    </div>
  )
}

