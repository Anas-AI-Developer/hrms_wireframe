import type { ReactNode } from 'react'
import { PageBreadcrumb } from './PageBreadcrumb'

type Props = {
  current: string
  dashboardHref?: string
  actions?: ReactNode
  children: ReactNode
}

/** Full-width list page wrapper matching reference layout. */
export function HrmsListShell({ current, dashboardHref, actions, children }: Props) {
  return (
    <div className="hrms-ref-page hrms-ui-ref">
      <PageBreadcrumb current={current} dashboardHref={dashboardHref} actions={actions} />
      {children}
    </div>
  )
}
