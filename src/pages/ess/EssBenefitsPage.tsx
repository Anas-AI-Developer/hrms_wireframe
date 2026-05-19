import { useAuth } from '../../auth/AuthContext'
import { benefitPlans } from '../../data/benefitsMock'
import { getEssBenefits } from '../../data/essSeed'
import '../pages.css'

export function EssBenefitsPage() {
  const { actorEmployeeId } = useAuth()
  const mine = actorEmployeeId ? getEssBenefits(actorEmployeeId) : []

  return (
    <div>
      <h2 className="wf-h2">My benefits</h2>
      <p className="wf-lead">Active enrollments and available organisation plans.</p>
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>My enrollments</h3>
        {mine.length === 0 ? <p className="wf-note">No enrollments on file.</p> : (
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead><tr><th>Plan</th><th>Since</th><th>Status</th></tr></thead>
              <tbody>
                {mine.map((b) => (
                  <tr key={b.id}><td>{b.planName}</td><td>{b.enrolledSince}</td><td><span className="wf-pill">{b.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>Organisation plans (reference)</h3>
        <ul className="wf-list">
          {benefitPlans.filter((p) => p.status === 'active').map((p) => (
            <li key={p.id}>{p.name} ({p.type}) — {p.employerContribution}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
