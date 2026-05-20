import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HrmsModal } from '../components/hrms/HrmsModal'
import { appraisalCycles } from '../data/performanceMock'
import type { PerformanceGoal } from '../data/performanceMock'
import {
  PERFORMANCE_RATINGS,
  addPerformanceGoal,
  updatePerformanceGoal,
} from '../data/performanceStore'
import { usePerformanceGoals } from '../hooks/usePerformanceStore'
import './pages.css'

export function PerformancePage() {
  const { can, user, actorEmployeeId, visibleEmployees } = useAuth()
  const canManage = can('page:performance:manage')
  const canAppraise = can('performance.appraise')
  const isEmployee = user?.role === 'employee'

  const allGoals = usePerformanceGoals()
  const openCycle = appraisalCycles.find((c) => c.status === 'open') ?? appraisalCycles[0]

  const teamIds = useMemo(
    () => new Set(visibleEmployees().map((e) => e.id)),
    [visibleEmployees],
  )

  const teamGoals = useMemo(
    () => allGoals.filter((g) => teamIds.has(g.employeeId)),
    [allGoals, teamIds],
  )

  const myGoals = actorEmployeeId
    ? allGoals.filter((g) => g.employeeId === actorEmployeeId)
    : []

  const [rateGoal, setRateGoal] = useState<PerformanceGoal | null>(null)
  const [managerRating, setManagerRating] = useState<string>(PERFORMANCE_RATINGS[3])
  const [managerComment, setManagerComment] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [addEmployeeId, setAddEmployeeId] = useState('')
  const [addTitle, setAddTitle] = useState('')
  const [addTarget, setAddTarget] = useState('')
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const teamOptions = visibleEmployees().filter((e) => e.status === 'active')

  function openRate(goal: PerformanceGoal) {
    setRateGoal(goal)
    setManagerRating(goal.managerRating ?? PERFORMANCE_RATINGS[3])
    setManagerComment(goal.managerComment ?? '')
  }

  function submitRate(ev: FormEvent) {
    ev.preventDefault()
    if (!rateGoal) return
    updatePerformanceGoal(rateGoal.id, {
      managerRating,
      managerComment: managerComment.trim() || undefined,
    })
    setSavedMsg(`Rating saved for ${rateGoal.employeeName}. They will see it on ESS → Performance.`)
    setRateGoal(null)
  }

  function submitAddGoal(ev: FormEvent) {
    ev.preventDefault()
    const emp = teamOptions.find((e) => e.id === addEmployeeId)
    if (!emp || !addTitle.trim() || !addTarget.trim()) return
    addPerformanceGoal({
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      goalTitle: addTitle,
      target: addTarget,
      cycleId: openCycle.id,
    })
    setSavedMsg(`Goal assigned to ${emp.firstName} ${emp.lastName}.`)
    setAddOpen(false)
    setAddTitle('')
    setAddTarget('')
    setAddEmployeeId('')
  }

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Performance</h1>
      <p className="wf-lead">
        Annual cycle: HR opens appraisal → employee self-assessment → manager rating → HR sign-off.
      </p>

      {savedMsg ? (
        <p className="wf-note" style={{ marginBottom: '1rem', borderColor: '#86efac', background: '#f0fdf4' }}>
          {savedMsg}
        </p>
      ) : null}

      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        <span className="wf-pill wf-pill--active">1. Cycle setup (HR)</span>
        <span>→</span>
        <span className="wf-pill">2. Self-assessment</span>
        <span>→</span>
        <span className="wf-pill">3. Manager appraisal</span>
        <span>→</span>
        <span className="wf-pill">4. Close cycle</span>
      </div>

      {canManage ? (
        <section className="wf-section">
          <h2 className="wf-h2">Appraisal cycles (HR)</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Period</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {appraisalCycles.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>
                      {c.startDate} – {c.endDate}
                    </td>
                    <td>
                      <span className={`wf-pill wf-pill--${c.status === 'open' ? 'active' : 'inactive'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: open cycle')}>
                        Configure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {canAppraise && !isEmployee ? (
        <section className="wf-section">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div>
              <h2 className="wf-h2" style={{ marginBottom: '0.25rem' }}>
                Team appraisals (manager)
              </h2>
              <p className="wf-card-desc" style={{ margin: 0 }}>
                Assign goals and submit ratings. Employees see updates on ESS → Performance.
              </p>
            </div>
            <button type="button" className="hrms-btn-primary" onClick={() => setAddOpen(true)}>
              <i className="ri-add-line" aria-hidden /> Assign goal
            </button>
          </div>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal</th>
                  <th>Target</th>
                  <th>Self rating</th>
                  <th>Manager rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {teamGoals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="hrms-empty">
                      No goals in your team scope. Use <strong>Assign goal</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  teamGoals.map((g) => (
                    <tr key={g.id}>
                      <td>
                        <Link to={`/employees/${g.employeeId}`}>{g.employeeName}</Link>
                      </td>
                      <td>{g.goalTitle}</td>
                      <td>{g.target}</td>
                      <td>{g.selfRating ?? '—'}</td>
                      <td>{g.managerRating ?? '—'}</td>
                      <td>
                        <button type="button" className="wf-link-quiet" onClick={() => openRate(g)}>
                          {g.managerRating ? 'Edit rating' : 'Rate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {isEmployee || can('performance.self_review') ? (
        <section className="wf-section">
          <h2 className="wf-h2">My goals & self-assessment</h2>
          <p className="wf-card-desc">
            Use <Link to="/ess/performance">ESS → Performance</Link> for the full employee view.
          </p>
          {myGoals.length === 0 ? (
            <p className="wf-note">No goals linked to your account.</p>
          ) : (
            <div className="wf-table-wrap">
              <table className="wf-table">
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Self rating</th>
                    <th>Manager rating</th>
                  </tr>
                </thead>
                <tbody>
                  {myGoals.map((g) => (
                    <tr key={g.id}>
                      <td>{g.goalTitle}</td>
                      <td>{g.target}</td>
                      <td>{g.selfRating ?? 'Pending'}</td>
                      <td>{g.managerRating ?? 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}

      {!canManage && !canAppraise && !isEmployee ? (
        <p className="wf-note wf-note--warn">Your role has read-only access to performance summaries via Reports.</p>
      ) : null}

      <HrmsModal
        open={Boolean(rateGoal)}
        onClose={() => setRateGoal(null)}
        title="Manager rating"
        description={rateGoal ? `${rateGoal.employeeName} — ${rateGoal.goalTitle}` : undefined}
        size="lg"
        footer={
          <>
            <button type="button" className="hrms-ref-btn-secondary" onClick={() => setRateGoal(null)}>
              Cancel
            </button>
            <button type="submit" form="mgr-performance-rate-form" className="hrms-btn-primary">
              Save rating
            </button>
          </>
        }
      >
        <form id="mgr-performance-rate-form" className="hrms-modal-form" onSubmit={submitRate}>
          <div className="hrms-modal-form__field">
            <label htmlFor="mgr-rating">Rating</label>
            <select
              id="mgr-rating"
              value={managerRating}
              onChange={(e) => setManagerRating(e.target.value)}
            >
              {PERFORMANCE_RATINGS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="hrms-modal-form__field">
            <label htmlFor="mgr-comment">Feedback (optional)</label>
            <textarea
              id="mgr-comment"
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              placeholder="Comments visible to the employee on their performance page…"
              rows={4}
            />
          </div>
        </form>
      </HrmsModal>

      <HrmsModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Assign goal"
        description={`Open cycle: ${openCycle.title}`}
        size="lg"
        footer={
          <>
            <button type="button" className="hrms-ref-btn-secondary" onClick={() => setAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="mgr-add-goal-form" className="hrms-btn-primary">
              Assign goal
            </button>
          </>
        }
      >
        <form id="mgr-add-goal-form" className="hrms-modal-form" onSubmit={submitAddGoal}>
          <div className="hrms-modal-form__field">
            <label htmlFor="mgr-goal-employee">Employee</label>
            <select
              id="mgr-goal-employee"
              value={addEmployeeId}
              onChange={(e) => setAddEmployeeId(e.target.value)}
              required
            >
              <option value="">Select employee…</option>
              {teamOptions.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.employeeNo})
                </option>
              ))}
            </select>
          </div>
          <div className="hrms-modal-form__field">
            <label htmlFor="mgr-goal-title">Goal</label>
            <input
              id="mgr-goal-title"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              required
            />
          </div>
          <div className="hrms-modal-form__field">
            <label htmlFor="mgr-goal-target">Target / measure</label>
            <input
              id="mgr-goal-target"
              value={addTarget}
              onChange={(e) => setAddTarget(e.target.value)}
              required
            />
          </div>
        </form>
      </HrmsModal>
    </div>
  )
}

