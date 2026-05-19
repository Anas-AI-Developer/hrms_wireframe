import { leaveRows } from '../data/wireframeModules'
import { WireframeModuleListPage } from './WireframeModuleListPage'

export function LeaveListPage() {
  return (
    <WireframeModuleListPage
      current="Leave Management"
      boxTitle="Leave requests list"
      rows={leaveRows}
      searchPlaceholder="Search by employee or request code..."
      createLabel="New leave request"
      detailColumn="Stage"
    />
  )
}
