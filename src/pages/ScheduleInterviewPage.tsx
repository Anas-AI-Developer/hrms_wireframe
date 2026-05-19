import { interviewRows } from '../data/wireframeModules'
import { WireframeModuleListPage } from './WireframeModuleListPage'

export function ScheduleInterviewPage() {
  return (
    <WireframeModuleListPage
      current="Schedule interview"
      boxTitle="Interview schedule"
      rows={interviewRows}
      searchPlaceholder="Search panel or code..."
      createLabel="Schedule interview"
      detailColumn="When"
    />
  )
}
