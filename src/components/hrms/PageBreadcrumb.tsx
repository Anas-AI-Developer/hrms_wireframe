import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

type Props = {
  current: string
  dashboardHref?: string
  actions?: ReactNode
}

export function PageBreadcrumb({ current, dashboardHref = '/dashboard', actions }: Props) {
  return (
    <div className="hrms-breadcrumb-row">
      <nav aria-label="Breadcrumb">
        <ol className="hrms-breadcrumb">
          <li className="hrms-breadcrumb-item">
            <Link to={dashboardHref}>Dashboard</Link>
          </li>
          <li className="hrms-breadcrumb-item active" aria-current="page">
            {current}
          </li>
        </ol>
      </nav>
      {actions ? <div className="hrms-breadcrumb-actions">{actions}</div> : null}
    </div>
  )
}
