import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { employees, getDepartment, getDesignation } from '../data/mock'
import { useListControls } from '../hooks/useListControls'
import type { Employee } from '../types/hrms'
import { formatListDate } from '../utils/formatDate'

export function EmployeeListPage() {
  const { can, visibleEmployees } = useAuth()
  const canWrite = can('page:employees:write')
  const source = visibleEmployees()

  const list = useListControls(source, {
    searchFn: (e, q) => {
      const name = `${e.firstName} ${e.lastName}`.toLowerCase()
      const dept = getDepartment(e.departmentId)?.name.toLowerCase() ?? ''
      return (
        name.includes(q) ||
        e.employeeNo.toLowerCase().includes(q) ||
        dept.includes(q) ||
        (e.sanctionedPost?.toLowerCase().includes(q) ?? false)
      )
    },
    statusFn: (e, f) => {
      if (f === 'all') return true
      if (f === 'active') return e.status === 'active'
      return e.status === 'inactive'
    },
    sortFns: {
      name: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
      employeeNo: (a, b) => a.employeeNo.localeCompare(b.employeeNo),
      centre: (a, b) =>
        (getDepartment(a.departmentId)?.name ?? '').localeCompare(
          getDepartment(b.departmentId)?.name ?? '',
        ),
      post: (a, b) => (a.sanctionedPost ?? '').localeCompare(b.sanctionedPost ?? ''),
      status: (a, b) => a.status.localeCompare(b.status),
      joinDate: (a, b) => a.joinDate.localeCompare(b.joinDate),
    },
  })

  return (
    <HrmsListShell
      current="Employees"
      actions={
        canWrite ? (
          <Link to="/employees/new" className="hrms-btn-primary">
            <i className="ri-add-line" aria-hidden /> New Employee
          </Link>
        ) : undefined
      }
    >
      <DataListPanel
        title="Employees list"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by name, code, centre, or post..."
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
                <SortableTh label="Code" column="employeeNo" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Name" column="name" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Centre" column="centre" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Post" column="post" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Status" column="status" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Joined" column="joinDate" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="hrms-empty">
                    No employees found.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((e) => <EmployeeRow key={e.id} employee={e} canWrite={canWrite} />)
              )}
            </tbody>
          </table>
        </div>
        <p className="wf-note" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
          Showing scoped roster ({source.length} of {employees.length} MasterList sample rows).
        </p>
      </DataListPanel>
    </HrmsListShell>
  )
}

function EmployeeRow({ employee: e, canWrite }: { employee: Employee; canWrite: boolean }) {
  const dept = getDepartment(e.departmentId)
  const des = getDesignation(e.designationId)
  return (
    <tr>
      <td>
        <code>{e.employeeNo}</code>
      </td>
      <td className="font-medium">
        <Link to={`/employees/${e.id}`} style={{ color: '#2f4798', textDecoration: 'none' }}>
          {e.firstName} {e.lastName}
        </Link>
      </td>
      <td>{dept?.name ?? '—'}</td>
      <td>{e.sanctionedPost ?? des?.title ?? '—'}</td>
      <td>
        <StatusBadge status={e.status} />
      </td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {e.joinDate !== '—' ? e.joinDate : formatListDate('')}
      </td>
      <td>
        <RowActionsMenu
          id={e.id}
          actions={[
            { label: 'View', href: `/employees/${e.id}` },
            ...(canWrite
              ? [
                  { label: 'Edit', href: `/employees/${e.id}/edit` },
                  {
                    label: 'Delete',
                    danger: true,
                    onClick: () => alert('Wireframe: soft-delete employee'),
                  },
                ]
              : []),
          ]}
        />
      </td>
    </tr>
  )
}
