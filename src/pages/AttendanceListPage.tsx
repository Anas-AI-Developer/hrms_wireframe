import { attendanceRows } from '../data/wireframeModules'
import { WireframeModuleListPage } from './WireframeModuleListPage'

export function AttendanceListPage() {
  return (
    <WireframeModuleListPage
      current="Attendance"
      boxTitle="Attendance list"
      rows={attendanceRows}
      searchPlaceholder="Search by sheet name or code..."
      createLabel="Import attendance"
      detailColumn="Notes"
    />
  )
}
