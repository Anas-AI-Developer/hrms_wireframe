import { Link } from 'react-router-dom'
import { candidates, jobPostings, RECRUITMENT_STAGES } from '../data/recruitmentMock'
import './pages.css'

const stageLabel = Object.fromEntries(RECRUITMENT_STAGES.map((s) => [s.id, s.label]))

export function RecruitmentPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Recruitment</h1>
      <p className="wf-lead">
        HR publishes jobs to the public portal; candidates move through shortlist → interview → offer → onboarding.
      </p>
      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {RECRUITMENT_STAGES.map((s, i) => (
          <span key={s.id}>
            {i > 0 ? ' → ' : null}
            <span className="wf-pill">{s.label}</span>
          </span>
        ))}
      </div>
      <section className="wf-section">
        <h2 className="wf-h2">Job postings</h2>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Centre</th>
                <th>BPS</th>
                <th>Vacancies</th>
                <th>Status</th>
                <th>Portal</th>
              </tr>
            </thead>
            <tbody>
              {jobPostings.map((j) => (
                <tr key={j.id}>
                  <td>{j.title}</td>
                  <td>{j.department}</td>
                  <td>{j.bps}</td>
                  <td>{j.vacancies}</td>
                  <td><span className={`wf-pill wf-pill--${j.status === 'published' ? 'active' : 'inactive'}`}>{j.status}</span></td>
                  <td>{j.portalVisible ? 'Public' : 'Internal draft'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '0.75rem' }}>
          <button type="button" className="wf-btn wf-btn--primary" onClick={() => alert('Wireframe: publish to job portal')}>
            Publish job (mock)
          </button>
        </p>
      </section>
      <section className="wf-section">
        <h2 className="wf-h2">Candidates (pipeline)</h2>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Job</th>
                <th>Applied</th>
                <th>Stage</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => {
                const job = jobPostings.find((j) => j.id === c.jobId)
                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{job?.title ?? '—'}</td>
                    <td>{c.appliedAt}</td>
                    <td>{stageLabel[c.stage] ?? c.stage}</td>
                    <td>
                      {c.stage === 'offer' ? (
                        <Link className="wf-link-quiet" to="/onboarding">→ Onboarding</Link>
                      ) : (
                        <button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: advance stage')}>
                          Advance
                        </button>
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
