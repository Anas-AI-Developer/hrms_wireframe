import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { departments, employees, getDepartment, sections } from '../data/mock'
import './pages.css'

export function DepartmentListPage() {
  const { can } = useAuth()
  const canWrite = can('page:departments:write')

  const sectionCounts = new Map<string, number>()
  for (const s of sections) {
    sectionCounts.set(s.departmentId, (sectionCounts.get(s.departmentId) ?? 0) + 1)
  }
  const headcount = new Map<string, number>()
  for (const e of employees) {
    headcount.set(e.departmentId, (headcount.get(e.departmentId) ?? 0) + 1)
  }

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">Departments & sections</h1>
          <p className="wf-lead">
            <strong>Centres</strong> from MasterList <code>centre</code> column. <strong>Sections</strong> are
            sub-units from <code>section_field</code> (client confirmed). Hierarchy is fixed per organogram / sheet.
          </p>
        </div>
        <button
          type="button"
          className="wf-btn wf-btn--primary"
          disabled={!canWrite}
          title={canWrite ? 'Wireframe: no persistence yet' : 'Your role cannot create departments'}
          onClick={() => {
            if (canWrite) alert('Wireframe: create department form is not wired yet.')
          }}
        >
          New centre
        </button>
      </div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Centre</th>
              <th>Head</th>
              <th>Sections</th>
              <th>Roster rows</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>
                  <code>{d.code}</code>
                </td>
                <td>{d.name}</td>
                <td>{d.headName}</td>
                <td>{sectionCounts.get(d.id) ?? 0}</td>
                <td>{headcount.get(d.id) ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="wf-section">
        <h2 className="wf-h2">Sections (sample)</h2>
        <div className="wf-table-wrap wf-table-wrap--scroll">
          <table className="wf-table wf-table--compact">
            <thead>
              <tr>
                <th>Centre</th>
                <th>Section</th>
              </tr>
            </thead>
            <tbody>
              {sections.slice(0, 40).map((s) => (
                <tr key={s.id}>
                  <td>{getDepartment(s.departmentId)?.name ?? '—'}</td>
                  <td>{s.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {sections.length > 40 ? (
          <p className="wf-note">Showing 40 of {sections.length} sections.</p>
        ) : null}
      </section>

      <p className="wf-note">
        Employees belong to <strong>one</strong> centre; transfers are tracked in change history.{' '}
        <Link to="/employees">Employees</Link> · <Link to="/organogram">Organogram</Link>
      </p>
    </div>
  )
}
