import { useAuth } from '../auth/AuthContext'
import { headcountByCentre } from '../data/reportsAnalyticsMock'
import './pages.css'

export function EmployeeAnalyticsPage() {
  const { visibleEmployees } = useAuth()
  const scoped = visibleEmployees()
  const active = scoped.filter((e) => e.status === 'active').length
  const onLeave = scoped.filter((e) => e.status === 'on_leave').length

  const totals = headcountByCentre.reduce(
    (acc, r) => ({
      active: acc.active + r.active,
      onLeave: acc.onLeave + r.onLeave,
      vacant: acc.vacant + r.vacant,
      regular: acc.regular + r.regular,
      deputation: acc.deputation + r.deputation,
    }),
    { active: 0, onLeave: 0, vacant: 0, regular: 0, deputation: 0 },
  )

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Employee analytics</h1>
      <p className="wf-lead">
        Headcount, tenure, and employment mix by centre. Scoped to your role where applicable (wireframe).
      </p>

      <div className="wf-grid wf-grid--3" style={{ marginBottom: '1.25rem' }}>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Your scope — active</div>
          <div className="wf-card-stat">{active}</div>
          <div className="wf-card-desc">On leave {onLeave} in scope</div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Organization — active</div>
          <div className="wf-card-stat">{totals.active}</div>
          <div className="wf-card-desc">Demo aggregate (all centres)</div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Vacant posts</div>
          <div className="wf-card-stat">{totals.vacant}</div>
        </article>
      </div>

      <section className="wf-section">
        <h2 className="wf-h2">Headcount by centre</h2>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Centre</th>
                <th>Active</th>
                <th>On leave</th>
                <th>Vacant</th>
                <th>Regular</th>
                <th>Deputation</th>
              </tr>
            </thead>
            <tbody>
              {headcountByCentre.map((r) => (
                <tr key={r.centre}>
                  <td>{r.centre}</td>
                  <td>{r.active}</td>
                  <td>{r.onLeave}</td>
                  <td>{r.vacant}</td>
                  <td>{r.regular}</td>
                  <td>{r.deputation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
