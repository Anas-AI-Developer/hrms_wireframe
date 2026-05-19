import { workbookSheetNames } from '../data/mock'
import './pages.css'

export function MasterDataCatalogPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Client master workbook</h1>
      <p className="wf-lead">
        Tabs mirrored from <strong>Master Data updated on 30 April, 2026.xls</strong>. The wireframe imports the{' '}
        <strong>MasterList</strong> sheet (first 35 rows) into <code>clientMasterList.json</code> — regenerate with{' '}
        <code>python scripts/export_masterlist_json.py</code> after updating the Excel file at repo root.
      </p>

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
