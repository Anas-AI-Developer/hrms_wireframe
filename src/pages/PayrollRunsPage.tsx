import { useAuth } from '../auth/AuthContext'
import { payrollRuns } from '../data/payrollMock'
import './pages.css'

function formatPkr(n: number) {
  if (!n) return '—'
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function PayrollRunsPage() {
  const { can } = useAuth()
  const canRun = can('payroll.run')

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Payroll runs</h1>
      <p className="wf-lead">
        Monthly payroll: attendance and leave feed calculation, AAO posts the run, employees view payslip in ESS.
      </p>
      <div style={{ marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span className="wf-pill wf-pill--active">1. Draft</span>
        <span>→</span>
        <span className="wf-pill wf-pill--active">2. Calculate</span>
        <span>→</span>
        <span className="wf-pill wf-pill--active">3. Post</span>
        <span>→</span>
        <span className="wf-pill">4. Payslips</span>
      </div>
      {canRun ? (
        <button type="button" className="wf-btn wf-btn--primary" style={{ marginBottom: '1rem' }} onClick={() => alert('Wireframe: payroll run')}>
          Start run (mock)
        </button>
      ) : null}
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>Status</th>
              <th>Employees</th>
              <th>Gross</th>
              <th>Net</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.map((r) => (
              <tr key={r.id}>
                <td>{r.periodLabel}</td>
                <td><span className={`wf-pill wf-pill--${r.status === 'posted' ? 'active' : 'inactive'}`}>{r.status}</span></td>
                <td>{r.employeeCount}</td>
                <td>{formatPkr(r.grossTotal)}</td>
                <td>{formatPkr(r.netTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
