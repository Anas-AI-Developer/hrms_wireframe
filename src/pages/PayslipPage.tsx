import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { getEmployee } from '../data/mock'
import { getPayslipForEmployee } from '../data/payrollMock'
import './pages.css'

function formatPkr(n: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function PayslipPage() {
  const { actorEmployeeId } = useAuth()
  const profile = actorEmployeeId ? getEmployee(actorEmployeeId) : undefined
  const slip = getPayslipForEmployee(actorEmployeeId ?? 'm-1')

  return (
    <div className="wf-page">
      <div className="wf-breadcrumb">
        <Link to="/ess">Self-service</Link>
        <span> / </span>
        <span>Payslip</span>
      </div>
      <h1 className="wf-h1">My payslip</h1>
      <p className="wf-lead">{slip.periodLabel} · Paid {slip.payDate}</p>
      {profile ? (
        <p className="wf-card-desc">
          {profile.firstName} {profile.lastName} · {profile.employeeNo} · {profile.sanctionedPost}
        </p>
      ) : null}
      <article className="wf-card wf-card--flat" style={{ maxWidth: '28rem' }}>
        <div className="wf-card-kicker">Net pay</div>
        <div className="wf-card-stat">{formatPkr(slip.netPay)}</div>
        <table className="wf-table" style={{ marginTop: '1rem' }}>
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
      <p className="wf-note">Wireframe sample only. Production payslips come from posted payroll runs.</p>
    </div>
  )
}
