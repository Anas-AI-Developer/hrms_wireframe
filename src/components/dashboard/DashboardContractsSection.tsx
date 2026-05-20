import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  buildContractCompletions,
  buildEmployeeTrend,
  getContractStatusDisplay,
} from '../../data/contractCompletionMock'
import { formatEmployeeDate } from '../../utils/formatDate'
import { countJobType } from '../../data/dashboardEmployment'
import type { Employee } from '../../types/hrms'

type Props = {
  employees: Employee[]
  centreName: (departmentId: string) => string
}

function EmployeeTrendChart({
  points,
}: {
  points: ReturnType<typeof buildEmployeeTrend>
}) {
  const max = Math.max(
    ...points.flatMap((p) => [p.permanent, p.contract, p.project]),
    1,
  )

  return (
    <div className="hrms-employee-trend" role="img" aria-label="Employee trend by job type">
      <div className="hrms-employee-trend__legend">
        <span>
          <i className="hrms-employee-trend__dot hrms-employee-trend__dot--permanent" /> Permanent
        </span>
        <span>
          <i className="hrms-employee-trend__dot hrms-employee-trend__dot--contract" /> Contract
        </span>
        <span>
          <i className="hrms-employee-trend__dot hrms-employee-trend__dot--project" /> Project
        </span>
      </div>
      <div className="hrms-employee-trend__chart">
        {points.map((point) => (
          <div key={point.month} className="hrms-employee-trend__col">
            <div className="hrms-employee-trend__bars">
              <span
                className="hrms-employee-trend__bar hrms-employee-trend__bar--permanent"
                style={{ height: `${(point.permanent / max) * 100}%` }}
                title={`Permanent: ${point.permanent}`}
              />
              <span
                className="hrms-employee-trend__bar hrms-employee-trend__bar--contract"
                style={{ height: `${(point.contract / max) * 100}%` }}
                title={`Contract: ${point.contract}`}
              />
              <span
                className="hrms-employee-trend__bar hrms-employee-trend__bar--project"
                style={{ height: `${(point.project / max) * 100}%` }}
                title={`Project: ${point.project}`}
              />
            </div>
            <span className="hrms-employee-trend__month">{point.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardContractsSection({ employees, centreName }: Props) {
  const completions = useMemo(
    () => buildContractCompletions(employees, centreName),
    [employees, centreName],
  )

  const trend = useMemo(
    () =>
      buildEmployeeTrend(
        countJobType(employees, 'permanent'),
        countJobType(employees, 'contract'),
        countJobType(employees, 'project'),
      ),
    [employees],
  )

  return (
    <section className="hrms-dash-contracts-row" aria-label="Contracts and employee trend">
      <article className="hrms-ref-panel hrms-dash-contracts-table">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Contract completion</h2>
          <p className="hrms-ref-panel-desc">Contract & project staff — end dates in scope</p>
        </header>
        <div className="hrms-ref-panel-body hrms-ref-panel-body--flush">
          <div className="hrms-data-table-wrap">
            <table className="hrms-data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Centre</th>
                  <th>Job type</th>
                  <th>End date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="hrms-empty">
                      No contract or project employees in scope.
                    </td>
                  </tr>
                ) : (
                  completions.map((row) => {
                    const statusDisplay = getContractStatusDisplay(row)
                    return (
                    <tr key={row.id}>
                      <td className="font-medium">
                        <Link to={`/employees/${row.employeeId}`} style={{ color: '#2f4798' }}>
                          {row.name}
                        </Link>
                        <br />
                        <code className="text-sm">{row.employeeNo}</code>
                      </td>
                      <td className="text-sm">{row.email}</td>
                      <td>{row.centre}</td>
                      <td>{row.jobType}</td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {formatEmployeeDate(row.completionDate)}
                      </td>
                      <td>
                        <div
                          className={`hrms-contract-timeline hrms-contract-timeline--${statusDisplay.tone}`}
                        >
                          <span className="hrms-contract-timeline__primary">
                            {statusDisplay.primary}
                          </span>
                          <span className="hrms-contract-timeline__secondary">
                            {statusDisplay.secondary}
                          </span>
                        </div>
                      </td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </article>

      <article className="hrms-ref-panel hrms-dash-employee-trend-panel">
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">Employee trend</h2>
          <p className="hrms-ref-panel-desc">Headcount by job type (demo, Jan–Jun)</p>
        </header>
        <div className="hrms-ref-panel-body">
          <EmployeeTrendChart points={trend} />
        </div>
      </article>
    </section>
  )
}
