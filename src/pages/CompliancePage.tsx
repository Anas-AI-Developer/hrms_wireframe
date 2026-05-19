import { useAuth } from '../auth/AuthContext'
import { complianceRegisters } from '../data/complianceMock'
import './pages.css'

export function CompliancePage() {
  const { can } = useAuth()
  const canManage = can('page:compliance:manage')

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Compliance</h1>
      <p className="wf-lead">
        Statutory registers (EOBI, social security, tax). HR files returns; accounts/finance track due dates and filings.
      </p>
      <div className="wf-table-wrap">
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
      </div>
      {canManage ? (
        <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: add register')}>
          Add register (mock)
        </button>
      ) : (
        <p className="wf-note" style={{ marginTop: '0.75rem' }}>
          Read-only for accounts/finance — contact HR to update filings.
        </p>
      )}
    </div>
  )
}
