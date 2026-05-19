import { sprintCatalog } from '../data/sprintCatalog'
import './pages.css'

const statusLabel: Record<string, string> = {
  live_stub: 'Wireframe stub',
  planned: 'Planned UI',
}

export function SprintModulesPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Sprint modules</h1>
      <p className="wf-lead">
        Condensed from <strong>HRMS_Developer_Sprint_Guide.docx</strong> (full-stack playbook). Here we only track
        which areas get wireframe screens versus backend work in the Laravel <code>hrms</code> app.
      </p>

      <div className="wf-sprint-list">
        {sprintCatalog.map((block) => (
          <section key={block.id} className="wf-sprint-block">
            <header className="wf-sprint-head">
              <h2 className="wf-h2">{block.title}</h2>
              <span className="wf-sprint-weight">{block.weight}</span>
            </header>
            <p className="wf-sprint-goal">{block.goal}</p>
            <ul className="wf-sprint-modules">
              {block.modules.map((m) => (
                <li key={m.id}>
                  <div className="wf-sprint-mod-title">{m.title}</div>
                  <p className="wf-sprint-mod-desc">{m.summary}</p>
                  <span className={`wf-pill wf-pill--${m.wireframeStatus === 'live_stub' ? 'active' : 'inactive'}`}>
                    {statusLabel[m.wireframeStatus]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
