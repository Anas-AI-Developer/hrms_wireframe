import { jobRows } from '../data/wireframeModules'
import { WireframeModuleListPage } from './WireframeModuleListPage'

export function JobPostingsListPage() {
  return (
    <WireframeModuleListPage
      current="Job postings"
      boxTitle="Job postings list"
      rows={jobRows}
      searchPlaceholder="Search by title or code..."
      createLabel="New job posting"
      detailColumn="Pipeline"
    />
  )
}
