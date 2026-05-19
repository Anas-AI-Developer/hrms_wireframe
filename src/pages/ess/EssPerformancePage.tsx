import { useAuth } from '../../auth/AuthContext'
import { getEssGoals, getEssOpenCycle } from '../../data/essSeed'
import '../pages.css'

export function EssPerformancePage() {
  const { actorEmployeeId } = useAuth()
  const cycle = getEssOpenCycle()
  const goals = actorEmployeeId ? getEssGoals(actorEmployeeId) : []

  return (
    <div>
      <h2 className="wf-h2">My performance</h2>
      <p className="wf-lead">View goals and ratings for the open appraisal cycle. Manager ratings appear after review.</p>
      <article className="wf-card wf-card--flat" style={{ marginBottom: '1rem' }}>
        <div className="wf-card-kicker">Open cycle</div>
        <div className="wf-card-desc">
          {cycle.title} · {cycle.startDate} to {cycle.endDate} ·{' '}
          <span className="wf-pill wf-pill--active">{cycle.status}</span>
        </div>
      </article>
      {goals.length === 0 ? (
        <p className="wf-note">No goals assigned yet.</p>
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
              {goals.map((g) => (
                <tr key={g.id}>
                  <td>{g.goalTitle}</td>
                  <td>{g.target}</td>
                  <td>{g.selfRating ?? '—'}</td>
                  <td>{g.managerRating ?? 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
