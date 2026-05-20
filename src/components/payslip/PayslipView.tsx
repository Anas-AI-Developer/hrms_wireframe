import { useMemo } from 'react'
import type { Employee } from '../../types/hrms'
import type { PayrollRun, Payslip, PayslipLine } from '../../data/payrollMock'
import { getPayrollRun } from '../../data/payrollMock'
import '../../styles/ess-payslip.css'

function formatPkr(n: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(n)
}

function formatPayDate(iso: string) {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function sumLines(lines: PayslipLine[], type: 'earning' | 'deduction') {
  return lines.filter((l) => l.type === type).reduce((acc, l) => acc + Math.abs(l.amount), 0)
}

const RUN_STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  processing: 'Processing',
  posted: 'Posted',
  locked: 'Locked',
}

type Props = {
  slip: Payslip
  profile?: Employee
  run?: PayrollRun
}

export function PayslipView({ slip, profile, run: runProp }: Props) {
  const run = runProp ?? getPayrollRun(slip.runId)
  const earnings = useMemo(() => slip.lines.filter((l) => l.type === 'earning'), [slip.lines])
  const deductions = useMemo(() => slip.lines.filter((l) => l.type === 'deduction'), [slip.lines])
  const grossPay = useMemo(() => sumLines(slip.lines, 'earning'), [slip.lines])
  const totalDeductions = useMemo(() => sumLines(slip.lines, 'deduction'), [slip.lines])

  const runStatus = run?.status ?? 'posted'
  const runBadgeTone =
    runStatus === 'posted' || runStatus === 'locked' ? 'active' : 'on_leave'

  return (
    <>
      <header className="ess-payslip-page__head">
        <div>
          <h2 className="wf-h2" style={{ marginBottom: '0.35rem' }}>
            My payslip
          </h2>
          <p className="wf-lead">
            {slip.periodLabel} · Paid {formatPayDate(slip.payDate)} — view breakdown and download
            PDF.
          </p>
        </div>
        <button
          type="button"
          className="hrms-btn-primary"
          onClick={() => alert('Wireframe: download payslip PDF')}
        >
          <i className="ri-download-2-line" aria-hidden /> Download PDF
        </button>
      </header>

      <section className="ess-payslip-stats" aria-label="Payslip summary">
        <article className="ess-leave-balance-card">
          <span className="ess-leave-balance-card__icon ess-leave-balance-card__icon--primary" aria-hidden>
            <i className="ri-calendar-line" />
          </span>
          <div className="ess-leave-balance-card__meta">
            <span className="ess-leave-balance-card__label">Pay period</span>
            <span className="ess-leave-balance-card__value" style={{ fontSize: '1rem' }}>
              {slip.periodLabel}
            </span>
            <span className="ess-leave-balance-card__sub">Paid {formatPayDate(slip.payDate)}</span>
          </div>
        </article>
        <article className="ess-leave-balance-card">
          <span className="ess-leave-balance-card__icon ess-leave-balance-card__icon--success" aria-hidden>
            <i className="ri-wallet-3-line" />
          </span>
          <div className="ess-leave-balance-card__meta">
            <span className="ess-leave-balance-card__label">Net pay</span>
            <span className="ess-leave-balance-card__value">{formatPkr(slip.netPay)}</span>
            <span className="ess-leave-balance-card__sub">Take-home amount</span>
          </div>
        </article>
        <article className="ess-leave-balance-card">
          <span className="ess-leave-balance-card__icon ess-leave-balance-card__icon--info" aria-hidden>
            <i className="ri-add-circle-line" />
          </span>
          <div className="ess-leave-balance-card__meta">
            <span className="ess-leave-balance-card__label">Gross earnings</span>
            <span className="ess-leave-balance-card__value">{formatPkr(grossPay)}</span>
            <span className="ess-leave-balance-card__sub">Basic {formatPkr(slip.basic)}</span>
          </div>
        </article>
        <article className="ess-leave-balance-card">
          <span className="ess-leave-balance-card__icon ess-leave-balance-card__icon--warning" aria-hidden>
            <i className="ri-indeterminate-circle-line" />
          </span>
          <div className="ess-leave-balance-card__meta">
            <span className="ess-leave-balance-card__label">Deductions</span>
            <span className="ess-leave-balance-card__value">{formatPkr(totalDeductions)}</span>
            <span className="ess-leave-balance-card__sub">
              {deductions.length} component{deductions.length === 1 ? '' : 's'}
            </span>
          </div>
        </article>
      </section>

      <div className="ess-payslip-layout">
        <article className="hrms-ref-panel">
          <header className="hrms-ref-panel-head">
            <h2 className="hrms-ref-panel-title">Salary breakdown</h2>
          </header>
          <div className="hrms-ref-panel-body">
            <div className="ess-payslip-hero">
              <div>
                <span className="ess-payslip-hero__label">Net pay · {slip.periodLabel}</span>
                <p className="ess-payslip-hero__amount">{formatPkr(slip.netPay)}</p>
                <p className="ess-payslip-hero__sub">
                  {profile
                    ? `${profile.firstName} ${profile.lastName} · ${profile.employeeNo}`
                    : 'Employee'}
                  {profile?.sanctionedPost ? ` · ${profile.sanctionedPost}` : ''}
                  {profile?.bps != null && profile.bps !== '—' ? ` · BPS ${profile.bps}` : ''}
                </p>
              </div>
              <span className={`hrms-badge hrms-badge--${runBadgeTone}`}>
                {RUN_STATUS_LABEL[runStatus] ?? runStatus}
              </span>
            </div>

            <h3 className="ess-payslip-section-title">Earnings</h3>
            <table className="ess-payslip-lines">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {earnings.map((line) => (
                  <tr key={line.label}>
                    <td>{line.label}</td>
                    <td>{formatPkr(line.amount)}</td>
                  </tr>
                ))}
                <tr className="ess-payslip-lines__total">
                  <td>Total earnings</td>
                  <td>{formatPkr(grossPay)}</td>
                </tr>
              </tbody>
            </table>

            <h3 className="ess-payslip-section-title" style={{ marginTop: '1.25rem' }}>
              Deductions
            </h3>
            <table className="ess-payslip-lines">
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {deductions.map((line) => (
                  <tr key={line.label} className="ess-payslip-lines__row--deduction">
                    <td>{line.label}</td>
                    <td>−{formatPkr(Math.abs(line.amount))}</td>
                  </tr>
                ))}
                <tr className="ess-payslip-lines__total">
                  <td>Total deductions</td>
                  <td>−{formatPkr(totalDeductions)}</td>
                </tr>
              </tbody>
            </table>

            <div className="ess-payslip-net-bar" aria-label="Net pay calculation">
              <span className="ess-payslip-net-bar__label">Net pay</span>
              <span className="ess-payslip-net-bar__math">
                {formatPkr(grossPay)} − {formatPkr(totalDeductions)} =
              </span>
              <span className="ess-payslip-net-bar__value">{formatPkr(slip.netPay)}</span>
            </div>
          </div>
        </article>

        <article className="hrms-ref-panel">
          <header className="hrms-ref-panel-head">
            <h2 className="hrms-ref-panel-title">Pay run details</h2>
          </header>
          <div className="hrms-ref-panel-body">
            <dl className="ess-payslip-meta-list">
              <div>
                <dt>Employee</dt>
                <dd>
                  {profile ? (
                    <>
                      {profile.firstName} {profile.lastName}
                      <br />
                      <span style={{ color: '#64748b', fontSize: '0.8125rem' }}>
                        {profile.employeeNo} · {profile.sanctionedPost ?? profile.workingAs ?? '—'}
                      </span>
                    </>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{profile?.location ?? '—'}</dd>
              </div>
              <div>
                <dt>Pay period</dt>
                <dd>{slip.periodLabel}</dd>
              </div>
              <div>
                <dt>Payment date</dt>
                <dd>{formatPayDate(slip.payDate)}</dd>
              </div>
              <div>
                <dt>Payroll run</dt>
                <dd>{run?.id ?? slip.runId}</dd>
              </div>
              <div>
                <dt>Run status</dt>
                <dd>
                  <span className={`hrms-badge hrms-badge--${runBadgeTone}`}>
                    {RUN_STATUS_LABEL[runStatus] ?? runStatus}
                  </span>
                </dd>
              </div>
              {run && run.runBy !== '—' ? (
                <>
                  <div>
                    <dt>Posted by</dt>
                    <dd>{run.runBy}</dd>
                  </div>
                  <div>
                    <dt>Posted on</dt>
                    <dd>{formatPayDate(run.runAt)}</dd>
                  </div>
                </>
              ) : null}
              <div>
                <dt>Payslip ID</dt>
                <dd>
                  <code style={{ fontSize: '0.8125rem' }}>{slip.id}</code>
                </dd>
              </div>
            </dl>
            <p className="hrms-list-footnote" style={{ marginTop: '1rem' }}>
              Wireframe sample. Production payslips are generated from posted payroll runs only.
            </p>
          </div>
        </article>
      </div>
    </>
  )
}

export function PayslipEmptyState() {
  return <p className="ess-payslip-empty">No payslip is available for this account yet.</p>
}
