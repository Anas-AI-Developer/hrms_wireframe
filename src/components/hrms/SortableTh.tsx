import type { SortDir } from '../../hooks/useListControls'
import { SortIcon } from './icons'

export function SortableTh({
  label,
  column,
  sortColumn,
  sortDir,
  onSort,
}: {
  label: string
  column: string
  sortColumn: string | null
  sortDir: SortDir
  onSort: (col: string) => void
}) {
  const active = sortColumn === column ? sortDir : null
  return (
    <th className="hrms-th-sortable" onClick={() => onSort(column)}>
      <span className="hrms-th-inner">
        {label}
        <SortIcon direction={active} />
      </span>
    </th>
  )
}
