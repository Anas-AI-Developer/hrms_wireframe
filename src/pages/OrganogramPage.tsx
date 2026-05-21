import { Link } from 'react-router-dom'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import './pages.css'

export function OrganogramPage() {
  return (
    <HrmsListShell current="Organogram (PDF)">
    <div className="wf-page wf-page--wide">
      <header className="wf-page-head" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="wf-h1">Organization chart (HQ)</h1>
        </div>
        <Link to="/organogram/mapping" className="hrms-btn-primary">
          <i className="ri-node-tree" aria-hidden /> View hierarchy mapping
        </Link>
      </header>
      <div className="wf-org-frame-wrap">
        <iframe
          className="wf-org-iframe"
          title="NAVTTC HQ organogram 2026"
          src="/organogram-navttc-hq-2026.pdf"
        />
      </div>
      <p className="wf-note">
        If the PDF does not render in your browser, open <code>public/organogram-navttc-hq-2026.pdf</code> from the
        wireframe project folder. Employee create/edit uses the mapped hierarchy on{' '}
        <Link to="/organogram/mapping">Organogram mapping</Link>.
      </p>
    </div>
    </HrmsListShell>
  )
}
