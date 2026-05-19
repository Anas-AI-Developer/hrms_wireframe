import { workbookSheetNames } from '../data/mock'
import './pages.css'

export function MasterDataCatalogPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Client master workbook</h1>
      <p className="wf-lead">
        Tabs mirrored from <strong>Master Data updated on 30 April, 2026.xls</strong>. The wireframe imports the{' '}
        <strong>MasterList</strong> sheet (full roster) into <code>clientMasterList.json</code> — regenerate with{' '}
        <code>python scripts/export_masterlist_json.py</code> after updating the Excel file at repo root.
      </p>

      <section className="wf-section">
        <h2 className="wf-h2">MasterList — employment type column</h2>
        <p className="wf-card-desc">
          Per-row classification on <strong>MasterList</strong> is column <strong>Mode of Appointment</strong> (exported
          as <code>mode_of_appointment</code>). In the April 2026 file it contains only:
        </p>
        <ul className="wf-card-desc" style={{ margin: '0.5rem 0 1rem 1.25rem' }}>
          <li>
            <strong>Regular</strong> (158 rows)
          </li>
          <li>
            <strong>Deputation</strong> (82 rows)
          </li>
          <li>
            <strong>Vacant</strong> (88 rows — vacant posts)
          </li>
          <li>
            <strong>(blank)</strong> (11 rows)
          </li>
        </ul>
        <p className="wf-card-desc">
          The client summary (Regular 176, Deputation 149, Contingent 9, DPL 5, short-term 1 = 340) uses a different
          sanctioned-strength definition than this single column. Supplementary DPL / short-term hires are listed on{' '}
          <strong>Project - DPL</strong> with their own Mode of Appointment values (DPL, Short term basis).
        </p>
      </section>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Sheet name</th>
              <th>Wireframe note</th>
            </tr>
          </thead>
          <tbody>
            {workbookSheetNames.map((row) => (
              <tr key={row.name}>
                <td>
                  <code>{row.name}</code>
                </td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
