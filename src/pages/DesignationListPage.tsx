import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { useWireframeData } from '../data/WireframeDataContext'
import { useListControls } from '../hooks/useListControls'
import { formatListDate } from '../utils/formatDate'

export function DesignationListPage() {
  const { can } = useAuth()
  const { designations, getDepartment, deleteDesignation } = useWireframeData()
  const canWrite = can('page:designations:write')

  const list = useListControls(designations, {
    searchFn: (g, q) => {
      const dept = getDepartment(g.departmentId)
      return (
        g.title.toLowerCase().includes(q) ||
        g.grade.toLowerCase().includes(q) ||
        (dept?.name.toLowerCase().includes(q) ?? false)
      )
    },
    statusFn: (g, f) => (f === 'all' ? true : g.status === f),
    sortFns: {
      title: (a, b) => a.title.localeCompare(b.title),
      centre: (a, b) =>
        (getDepartment(a.departmentId)?.name ?? '').localeCompare(
          getDepartment(b.departmentId)?.name ?? '',
        ),
      grade: (a, b) => a.grade.localeCompare(b.grade),
      status: (a, b) => a.status.localeCompare(b.status),
      createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
  })

  return (
    <HrmsListShell
      current="Designations"
      actions={
        canWrite ? (
          <Link to="/designations/new" className="hrms-btn-primary">
            <i className="ri-add-line" aria-hidden /> New Designation
          </Link>
        ) : undefined
      }
    >
      <DataListPanel
        title="Designations list"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by title, grade, or centre..."
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
                <SortableTh label="Title" column="title" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Centre" column="centre" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Grade" column="grade" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Status" column="status" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Created" column="createdAt" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="hrms-empty">
                    No designations found.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((g) => {
                  const d = getDepartment(g.departmentId)
                  return (
                    <tr key={g.id}>
                      <td className="font-medium">{g.title}</td>
                      <td>{d?.name ?? '—'}</td>
                      <td>{g.grade}</td>
                      <td>
                        <StatusBadge status={g.status} />
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {formatListDate(g.createdAt)}
                      </td>
                      <td>
                        <RowActionsMenu
                          id={g.id}
                          actions={[
                            ...(canWrite
                              ? [
                                  { label: 'Edit', href: `/designations/${g.id}/edit` },
                                  {
                                    label: 'Delete',
                                    danger: true,
                                    onClick: () => {
                                      if (window.confirm(`Mark "${g.title}" inactive?`)) {
                                        deleteDesignation(g.id)
                                      }
                                    },
                                  },
                                ]
                              : [{ label: 'View', onClick: () => {} }]),
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>
    </HrmsListShell>
  )
}
