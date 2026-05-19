# one-off generator — Sprint 3 HR modules
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "pages"

PERFORMANCE = r'''
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { appraisalCycles, performanceGoals } from '../data/performanceMock'
import './pages.css'

export function PerformancePage() {
  const { can, user, actorEmployeeId } = useAuth()
  const canManage = can('page:performance:manage')
  const canAppraise = can('performance.appraise')
  const isEmployee = user?.role === 'employee'

  const myGoals = actorEmployeeId
    ? performanceGoals.filter((g) => g.employeeId === actorEmployeeId)
    : []

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Performance</h1>
      <p className="wf-lead">
        Annual cycle: HR opens appraisal → employee self-assessment → manager rating → HR sign-off. Access depends on
        your system role.
      </p>
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
          </motion.div>
          <button
            type="button"
            className="wf-btn wf-btn--primary"
            style={{ marginTop: '0.75rem' }}
            onClick={() => alert('Wireframe: new appraisal cycle')}
          >
            New cycle (mock)
          </button>
        </section>
      ) : null}

      {canAppraise && !isEmployee ? (
        <section className="wf-section">
          <h2 className="wf-h2">Team appraisals (manager)</h2>
          <p className="wf-card-desc">Rate direct reports in your scope after self-assessment is submitted.</p>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal</th>
                  <th>Self rating</th>
                  <th>Manager rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {performanceGoals.slice(0, 8).map((g) => (
                  <tr key={g.id}>
                    <td>
                      <Link to={`/employees/${g.employeeId}`}>{g.employeeName}</Link>
                    </td>
                    <td>{g.goalTitle}</td>
                    <td>{g.selfRating ?? '—'}</td>
                    <td>{g.managerRating ?? '—'}</td>
                    <td>
                      <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: submit rating')}>
                        Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>
      ) : null}

      {isEmployee || can('performance.self_review') ? (
        <section className="wf-section">
          <h2 className="wf-h2">My goals & self-assessment</h2>
          {myGoals.length === 0 ? (
            <p className="wf-note">No goals linked to your account in this demo.</p>
          ) : (
            <div className="wf-table-wrap">
              <table className="wf-table">
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Self rating</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {myGoals.map((g) => (
                    <tr key={g.id}>
                      <td>{g.goalTitle}</td>
                      <td>{g.target}</td>
                      <td>{g.selfRating ?? 'Pending'}</td>
                      <td>
                        <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: save self rating')}>
                          Submit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </section>
      ) : null}

      {!canManage && !canAppraise && !isEmployee ? (
        <p className="wf-note wf-note--warn">Your role has read-only access to performance summaries via Reports.</p>
      ) : null}
    </motion.div>
  )
}
'''.replace('motion.', '')

TRAINING = r'''
import { useAuth } from '../auth/AuthContext'
import { trainingCatalog, trainingEnrollments } from '../data/trainingMock'
import './pages.css'

export function TrainingPage() {
  const { can, user, actorEmployeeId } = useAuth()
  const canManage = can('page:training:manage')
  const canEnroll = can('training.enroll')
  const isEmployee = user?.role === 'employee'

  const myEnrollments = actorEmployeeId
    ? trainingEnrollments.filter((e) => e.employeeId === actorEmployeeId)
    : []

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Training</h1>
      <p className="wf-lead">
        HR maintains the catalogue; employees and managers nominate seats; completions sync to the employee record.
      </p>

      {canManage ? (
        <section className="wf-section">
          <h2 className="wf-h2">Training catalogue (HR)</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Provider</th>
                  <th>Seats</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {trainingCatalog.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{t.provider}</td>
                    <td>
                      {t.enrolled}/{t.capacity}
                    </td>
                    <td>
                      <span className={`wf-pill wf-pill--${t.status === 'open' ? 'active' : 'inactive'}`}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: add course')}>
            Add course (mock)
          </button>
        </section>
      ) : null}

      {canEnroll ? (
        <section className="wf-section">
          <h2 className="wf-h2">{isEmployee ? 'Nominate training' : 'Nominations (your scope)'}</h2>
          <div className="wf-grid wf-grid--2">
            {trainingCatalog
              .filter((t) => t.status === 'open')
              .slice(0, 4)
              .map((t) => (
                <article key={t.id} className="wf-card wf-card--flat">
                  <h3 className="wf-h2" style={{ fontSize: '1rem' }}>
                    {t.title}
                  </h3>
                  <p className="wf-card-desc">
                    {t.provider} · {t.durationDays} days
                  </p>
                  <button type="button" className="wf-btn wf-btn--ghost" onClick={() => alert(`Wireframe: nominated for ${t.title}`)}>
                    Nominate (mock)
                  </button>
                </article>
              ))}
          </motion.div>
          {myEnrollments.length > 0 ? (
            <>
              <h3 className="wf-h2" style={{ marginTop: '1.25rem', fontSize: '1rem' }}>
                My nominations
              </h3>
              <ul className="wf-list">
                {myEnrollments.map((e) => (
                  <li key={e.id}>
                    {e.courseTitle} — <span className="wf-pill">{e.status}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ) : null}

      {!canManage && !canEnroll ? (
        <p className="wf-note wf-note--warn">Training administration is restricted to HR roles.</p>
      ) : null}
    </motion.div>
  )
}
'''.replace('motion.', '')

BENEFITS = r'''
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
          <motion.div className="wf-table-wrap">
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
          </motion.div>
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
    </motion.div>
  )
}
'''.replace('motion.', '')

COMPLIANCE = r'''
import { useAuth } from '../auth/AuthContext'
import { complianceRegisters } from '../data/complianceMock'
import './pages.css'

export function CompliancePage() {
  const { can } = useAuth()
  const canManage = can('page:compliance:manage')

  return (
    <motion.div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Compliance</h1>
      <p className="wf-lead">
        Statutory registers (EOBI, social security, tax). HR files returns; accounts/finance track due dates and filings.
      </p>
      <motion.div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Register</th>
              <th>Authority</th>
              <th>Due</th>
              <th>Last filed</th>
              <th>Status</th>
              {canManage ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {complianceRegisters.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.authority}</td>
                <td>{r.dueDate}</td>
                <td>{r.lastFiled}</td>
                <td>
                  <span
                    className={`wf-pill wf-pill--${
                      r.status === 'compliant' ? 'active' : r.status === 'due_soon' ? 'inactive' : 'inactive'
                    }`}
                  >
                    {r.status.replace('_', ' ')}
                  </span>
                </td>
                {canManage ? (
                  <td>
                    <button type="button" className="wf-link-quiet" onClick={() => alert(`Wireframe: file ${r.name}`)}>
                      Mark filed
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      {canManage ? (
        <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: add register')}>
          Add register (mock)
        </button>
      ) : (
        <p className="wf-note" style={{ marginTop: '0.75rem' }}>
          Read-only for accounts/finance — contact HR to update filings.
        </p>
      )}
    </motion.div>
  )
}
'''.replace('motion.', '')

PAGES = {
    'PerformancePage.tsx': PERFORMANCE,
    'TrainingPage.tsx': TRAINING,
    'BenefitsPage.tsx': BENEFITS,
    'CompliancePage.tsx': COMPLIANCE,
}

for name, src in PAGES.items():
    (ROOT / name).write_text(src.strip() + '\n', encoding='utf-8')
    print('wrote', name)
