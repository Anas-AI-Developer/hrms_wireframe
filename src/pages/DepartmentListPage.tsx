import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { useWireframeData } from '../data/WireframeDataContext'
import { useListControls } from '../hooks/useListControls'
import type { Department } from '../types/hrms'
import { formatListDate } from '../utils/formatDate'

export function DepartmentListPage() {
  const { can } = useAuth()
  const { departments, deleteDepartment } = useWireframeData()
  const canWrite = can('page:departments:write')

  const list = useListControls(departments, {
    searchFn: (d, q) =>
      d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
    statusFn: (d, f) => (f === 'all' ? true : d.status === f),
    sortFns: {
      name: (a, b) => a.name.localeCompare(b.name),
      code: (a, b) => a.code.localeCompare(b.code),
      status: (a, b) => a.status.localeCompare(b.status),
      createdAt: (a, b) => a.createdAt.localeCompare(b.createdAt),
    },
    defaultSortColumn: 'name',
  })

  return (
    <HrmsListShell
      current="Departments"
      actions={
        canWrite ? (
          <Link to="/departments/new" className="hrms-btn-primary">
            <i className="ri-add-line" aria-hidden /> New Department
          </Link>
        ) : undefined
      }
    >
      <DataListPanel
        title="Departments list"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by name or code..."
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
                <SortableTh
                  label="Name"
                  column="name"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Code"
                  column="code"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Status"
                  column="status"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <SortableTh
                  label="Created"
                  column="createdAt"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="hrms-empty">
                    No departments found.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((d) => (
                  <DeptRow
                    key={d.id}
                    dept={d}
                    canWrite={canWrite}
                    onDelete={() => deleteDepartment(d.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </DataListPanel>
    </HrmsListShell>
  )
}

function DeptRow({
  dept,
  canWrite,
  onDelete,
}: {
  dept: Department
  canWrite: boolean
  onDelete: () => void
}) {
  return (
    <tr>
      <td className="font-medium">{dept.name}</td>
      <td>{dept.code}</td>
      <td>
        <StatusBadge status={dept.status} />
      </td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {formatListDate(dept.createdAt)}
      </td>
      <td>
        <RowActionsMenu
          id={dept.id}
          actions={[
            ...(canWrite
              ? [
                  { label: 'Edit', href: `/departments/${dept.id}/edit` },
                  {
                    label: 'Delete',
                    danger: true,
                    onClick: () => {
                      if (window.confirm(`Mark "${dept.name}" inactive?`)) onDelete()
                    },
                  },
                ]
              : [{ label: 'View', onClick: () => {} }]),
          ]}
        />
      </td>
    </tr>
  )
}
