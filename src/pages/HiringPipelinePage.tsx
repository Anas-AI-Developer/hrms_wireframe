import { pipelineRows } from '../data/wireframeModules'
import { WireframeModuleListPage } from './WireframeModuleListPage'

export function HiringPipelinePage() {
  return (
    <WireframeModuleListPage
      current="Hiring pipeline"
      boxTitle="Hiring pipeline"
      rows={pipelineRows}
      searchPlaceholder="Search candidates or codes..."
      detailColumn="Stage"
    />
  )
}
