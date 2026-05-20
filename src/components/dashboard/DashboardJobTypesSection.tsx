import { Link } from 'react-router-dom'
import {
  countJobType,
  DASHBOARD_JOB_FILTER_PARAM,
  DASHBOARD_JOB_FILTERS,
} from '../../data/dashboardEmployment'
import type { Employee } from '../../types/hrms'

type Props = {
  employees: Employee[]
  canViewList: boolean
}

export function DashboardJobTypesSection({ employees, canViewList }: Props) {
  return (
    <section className="hrms-dash-panel" aria-labelledby="dash-job-types-title">
      <header className="hrms-dash-panel__head">
        <div>
          <h2 id="dash-job-types-title" className="hrms-dash-panel__title">
            Job types
          </h2>
        </div>
      </header>

      <div className="hrms-dash-job-strip">
        {DASHBOARD_JOB_FILTERS.map((job) => {
          const count = countJobType(employees, job.id)
          const to = canViewList ? `/employees?${DASHBOARD_JOB_FILTER_PARAM}=${job.id}` : undefined
          const inner = (
            <>
              <span className={`hrms-dash-job-chip__icon hrms-dash-job-chip__icon--${job.tone}`}>
                <i className={job.icon} aria-hidden />
              </span>
              <span className="hrms-dash-job-chip__text">
                <span className="hrms-dash-job-chip__label">{job.label}</span>
                <span className="hrms-dash-job-chip__hint">{job.description}</span>
              </span>
              <span className="hrms-dash-job-chip__count">{count}</span>
              {to ? <i className="ri-arrow-right-s-line hrms-dash-job-chip__arrow" aria-hidden /> : null}
            </>
          )
          return to ? (
            <Link key={job.id} to={to} className={`hrms-dash-job-chip hrms-dash-job-chip--${job.tone}`}>
              {inner}
            </Link>
          ) : (
            <div
              key={job.id}
              className={`hrms-dash-job-chip hrms-dash-job-chip--${job.tone} hrms-dash-job-chip--disabled`}
            >
              {inner}
            </div>
          )
        })}
      </div>
    </section>
  )
}
