import { payrollByCentre } from '../data/reportsAnalyticsMock'
import { payrollRuns } from '../data/payrollMock'
import './pages.css'

function formatPkr(n: number) {
  return `PKR ${(n / 1_000_000).toFixed(2)}M`
}

export function PayrollReportPage() {
  const latest = payrollRuns[0]
  const totals = payrollByCentre.reduce(
    (acc, r) => ({
      headcount: acc.headcount + r.headcount,
      gross: acc.gross + r.gross,
      deductions: acc.deductions + r.deductions,
      net: acc.net + r.net,
    }),
    { headcount: 0, gross: 0, deductions: 0, net: 0 },
  )

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Payroll report</h1>
      <p className="wf-lead">
        Register and centre breakdown for posted payroll runs. Accounts/finance and leadership (wireframe).
      </p>
      {latest ? (
        <p className="wf-note">
          Latest posted run: <strong>{latest.periodLabel}</strong> · {latest.employeeCount} employees · status{' '}
          {latest.status}
        </p>
      ) : null}

      <div className="wf-grid wf-grid--4" style={{ marginBottom: '1.25rem' }}>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Headcount</div>
          <div className="wf-card-stat">{totals.headcount}</div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Gross</div>
          <div className="wf-card-stat">{formatPkr(totals.gross)}</div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Deductions</div>
          <div className="wf-card-stat">{formatPkr(totals.deductions)}</div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Net pay</div>
          <div className="wf-card-stat">{formatPkr(totals.net)}</div>
        </article>
      </div>

      <section className="wf-section">
        <h2 className="wf-h2">By centre</h2>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Centre</th>
                <th>Headcount</th>
                <th>Gross</th>
                <th>Deductions</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {payrollByCentre.map((r) => (
                <tr key={r.centre}>
                  <td>{r.centre}</td>
                  <td>{r.headcount}</td>
                  <td>{formatPkr(r.gross)}</td>
                  <td>{formatPkr(r.deductions)}</td>
                  <td>{formatPkr(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="wf-btn wf-btn--primary"
          style={{ marginTop: '0.75rem' }}
          onClick={() => alert('Wireframe: export payroll register')}
        >
          Export register (mock)
        </button>
      </section>
    </div>
  )
}
