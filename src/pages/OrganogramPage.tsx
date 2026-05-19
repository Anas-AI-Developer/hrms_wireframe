import './pages.css'

export function OrganogramPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Organisation chart (HQ)</h1>
      <p className="wf-lead">
        Official <strong>Organogram_NAVTTC HQs_2026.pdf</strong> embedded for reference. Reporting lines in HRMS
        wireframe data follow the MasterList &quot;Centre / Section&quot; fields until a structured hierarchy is
        modelled in the database.
      </p>
      <div className="wf-org-frame-wrap">
        <iframe
          className="wf-org-iframe"
          title="NAVTTC HQ organogram 2026"
          src="/organogram-navttc-hq-2026.pdf"
        />
      </div>
      <p className="wf-note">
        If the PDF does not render in your browser, open <code>public/organogram-navttc-hq-2026.pdf</code> from the
        wireframe project folder.
      </p>
    </div>
  )
}
