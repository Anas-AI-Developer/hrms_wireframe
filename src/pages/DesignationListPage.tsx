import { useAuth } from '../auth/AuthContext'
import { designations, getDepartment } from '../data/mock'
import './pages.css'

export function DesignationListPage() {
  const { can } = useAuth()
  const canWrite = can('page:designations:write')

  return (
    <div className="wf-page wf-page--wide">
      <div className="wf-page-head">
        <div>
          <h1 className="wf-h1">Designations</h1>
          <p className="wf-lead">
            Sanctioned post titles from the client sample, keyed to <strong>centre</strong> (department) per sprint
            guide.
          </p>
        </div>
        <button
          type="button"
          className="wf-btn wf-btn--primary"
          disabled={!canWrite}
          title={canWrite ? 'Wireframe: no persistence yet' : 'Your role cannot create designations'}
          onClick={() => {
            if (canWrite) alert('Wireframe: create designation form is not wired yet.')
          }}
        >
          New designation
        </button>
      </div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Centre</th>
              <th>Title</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {designations.map((g) => {
              const d = getDepartment(g.departmentId)
              return (
                <tr key={g.id}>
                  <td>{d?.name ?? '—'}</td>
                  <td>{g.title}</td>
                  <td>
                    <code>{g.grade}</code>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
