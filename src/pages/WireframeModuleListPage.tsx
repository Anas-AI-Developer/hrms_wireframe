import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { StatusBadge } from '../components/hrms/StatusBadge'
import type { WireframeRow } from '../data/wireframeModules'
import { useListControls } from '../hooks/useListControls'
import { formatListDate } from '../utils/formatDate'

type Props = {
  current: string
  boxTitle: string
  rows: WireframeRow[]
  searchPlaceholder?: string
  createLabel?: string
  detailColumn?: string
}

export function WireframeModuleListPage({
  current,
  boxTitle,
  rows,
  searchPlaceholder = 'Search...',
  createLabel,
  detailColumn = 'Details',
}: Props) {
  const list = useListControls(rows, {
    searchFn: (r, q) =>
      r.name.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q) ||
      (r.extra?.toLowerCase().includes(q) ?? false),
    statusFn: (r, f) => (f === 'all' ? true : r.status === f),
    sortFns: {
      name: (a, b) => a.name.localeCompare(b.name),
      code: (a, b) => a.code.localeCompare(b.code),
      status: (a, b) => a.status.localeCompare(b.status),
      createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
  })

  return (
    <HrmsListShell
      current={current}
      actions={
        createLabel ? (
          <button
            type="button"
            className="hrms-btn-primary"
            onClick={() => alert(`Wireframe: ${createLabel} — matches reference HRMS (not persisted).`)}
          >
            <i className="ri-add-line" aria-hidden /> {createLabel}
          </button>
        ) : undefined
      }
    >
      <DataListPanel
        title={boxTitle}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder={searchPlaceholder}
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        hasActiveFilters={list.hasActiveFilters}
        onResetFilters={list.resetFilters}
        firstItem={list.firstItem}
        lastItem={list.lastItem}
        total={list.total}
        page={list.page}
        totalPages={list.totalPages}
        pageSize={list.pageSize}
        onPageSizeChange={list.setPageSize}
        onPageChange={list.setPage}
      >
        <div className="hrms-data-table-wrap">
          <table className="hrms-data-table">
            <thead>
              <tr>
                <SortableTh label="Name" column="name" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Code" column="code" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <th>{detailColumn}</th>
                <SortableTh label="Status" column="status" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Created" column="createdAt" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="hrms-empty">
                    No records found.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((r) => (
                  <tr key={r.id}>
                    <td className="font-medium">{r.name}</td>
                    <td>{r.code}</td>
                    <td className="text-sm" style={{ color: '#64748b' }}>
                      {r.extra ?? '—'}
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="text-sm" style={{ color: '#64748b' }}>
                      {formatListDate(r.createdAt)}
                    </td>
                    <td>
                      <RowActionsMenu
                        id={r.id}
                        actions={[
                          { label: 'View', onClick: () => alert(`Wireframe: view ${r.code}`) },
                          { label: 'Edit', onClick: () => alert(`Wireframe: edit ${r.code}`) },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>
    </HrmsListShell>
  )
}
