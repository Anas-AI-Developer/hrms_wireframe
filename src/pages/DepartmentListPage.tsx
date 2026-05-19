import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { departments } from '../data/mock'
import './pages.css'

export function DepartmentListPage() {
  const { can } = useAuth()
  const canWrite = can('page:departments:write')

  return (
    <div className="wf-page">
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">Departments</h1>
          <p className="wf-lead">
            <strong>Centres</strong> from client MasterList (NAVTTC HQs, regional offices, CoE, …) — maps to sprint
            Module 1 &quot;Departments&quot;.
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
          New department
        </button>
      </div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Head</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="wf-note">
        Create/edit flows can be added when you share field specs.{' '}
        <Link to="/employees">Employees</Link> link departments by id in mock data.
      </p>
    </div>
  )
}
