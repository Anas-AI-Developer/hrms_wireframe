import { useAuth } from '../auth/AuthContext'
import { benefitPlans, employeeBenefits } from '../data/benefitsMock'
import './pages.css'

export function BenefitsPage() {
  const { can, actorEmployeeId, user } = useAuth()
  const canManage = can('page:benefits:manage')
  const canViewSelf = can('benefits.view_self')
  const isEmployee = user?.role === 'employee'

  const myBenefits = actorEmployeeId ? employeeBenefits.filter((b) => b.employeeId === actorEmployeeId) : []

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Benefits</h1>
      <p className="wf-lead">
        Allowance and benefit plans; HR enrolls staff; employees view entitlements; accounts can review plans for payroll
        alignment.
      </p>

      {(canManage || (!canViewSelf && can('page:benefits'))) ? (
        <section className="wf-section">
          <h2 className="wf-h2">Benefit plans</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Type</th>
                  <th>Employer</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {benefitPlans.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.type}</td>
                    <td>{p.employerContribution}</td>
                    <td>
                      <span className={`wf-pill wf-pill--${p.status === 'active' ? 'active' : 'inactive'}`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {canManage ? (
            <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: add plan')}>
              Add plan (mock)
            </button>
          ) : null}
        </section>
      ) : null}

      {canViewSelf ? (
        <section className="wf-section">
          <h2 className="wf-h2">{isEmployee ? 'My benefits' : 'My entitlements'}</h2>
          {myBenefits.length === 0 ? (
            <p className="wf-note">No benefit enrollments for this demo account.</p>
          ) : (
            <ul className="wf-list">
              {myBenefits.map((b) => (
                <li key={b.id}>
                  {b.planName} — since {b.enrolledSince}{' '}
                  <span className={`wf-pill wf-pill--${b.status === 'active' ? 'active' : 'inactive'}`}>{b.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {!canManage && !canViewSelf && !can('page:benefits') ? (
        <p className="wf-note wf-note--warn">Benefits are not available for your role.</p>
      ) : null}
    </div>
  )
}
