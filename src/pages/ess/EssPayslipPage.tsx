import { useAuth } from '../../auth/AuthContext'
import { getEmployee } from '../../data/mock'
import { getEssPayslip } from '../../data/essSeed'
import { getPayrollRun } from '../../data/payrollMock'
import '../pages.css'

function formatPkr(n: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function EssPayslipPage() {
  const { actorEmployeeId } = useAuth()
  const employeeId = actorEmployeeId ?? ''
  const profile = employeeId ? getEmployee(employeeId) : undefined
  const slip = employeeId ? getEssPayslip(employeeId) : null
  const run = slip ? getPayrollRun(slip.runId) : undefined

  if (!slip) return <p className="wf-note">No payslip for this account.</p>

  return (
    <div>
      <h2 className="wf-h2">My payslip</h2>
      <p className="wf-lead">{slip.periodLabel} · Paid {slip.payDate}</p>
      {profile ? <p className="wf-card-desc">{profile.employeeNo} · BPS {profile.bps ?? '—'}</p> : null}
      {run ? <p className="wf-note">Payroll run status: {run.status} · Posted by {run.runBy}</p> : null}
      <article className="wf-card wf-card--flat" style={{ maxWidth: '32rem' }}>
        <div className="wf-card-kicker">Net pay</div>
        <div className="wf-card-stat">{formatPkr(slip.netPay)}</div>
        <div className="wf-card-desc">Basic {formatPkr(slip.basic)}</div>
        <table className="wf-table" style={{ marginTop: '1rem' }}>
          <thead><tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {slip.lines.map((line) => (
              <tr key={line.label}>
                <td>{line.label}</td>
                <td style={{ textAlign: 'right' }}>{formatPkr(Math.abs(line.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <button type="button" className="wf-btn wf-btn--ghost" style={{ marginTop: '1rem' }} onClick={() => alert('Wireframe: download PDF')}>Download PDF (mock)</button>
    </div>
  )
}
