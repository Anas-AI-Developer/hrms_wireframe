import { Link } from 'react-router-dom'
import { getEmployeeDataBreakdown } from '../../data/dashboardEmployment'
import type { Employee } from '../../types/hrms'

type Props = {
  employees: Employee[]
  canViewList: boolean
}

export function EmployeeDataCard({ employees, canViewList }: Props) {
  const b = getEmployeeDataBreakdown(employees)

  const metrics = [
    { label: 'Total', value: b.total, title: 'All filled posts in scope' },
    { label: 'NAVTTC', value: b.navttc, title: 'Regular appointments' },
    { label: 'Deputation', value: b.deputation, title: 'On deputation' },
    { label: 'Contract', value: b.contract, title: 'Contingent staff' },
    { label: 'Project', value: b.project, title: 'DPL & short-term project' },
  ]

  return (
    <article className="hrms-dash-featured">
      <div className="hrms-dash-featured__inner">
        <div className="hrms-dash-featured__brand">
          <span className="hrms-dash-featured__icon" aria-hidden>
            <i className="ri-team-line" />
          </span>
          <div>
            <h3 className="hrms-dash-featured__title">Employee data</h3>
          </div>
        </div>

        <div className="hrms-dash-featured__stats" role="list">
          {metrics.map((m) => (
            <div key={m.label} className="hrms-dash-stat" role="listitem" title={m.title}>
              <span className="hrms-dash-stat__value">{m.value}</span>
              <span className="hrms-dash-stat__label">{m.label}</span>
            </div>
          ))}
        </div>

        {canViewList ? (
          <Link to="/employees" className="hrms-dash-featured__action">
            All employees
            <i className="ri-arrow-right-line" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  )
}
