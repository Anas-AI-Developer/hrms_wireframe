import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { useWireframeData } from '../data/WireframeDataContext'
import { useListControls } from '../hooks/useListControls'
import type { Employee } from '../types/hrms'
import { formatListDate } from '../utils/formatDate'

const ALL = 'all'

const EMPLOYEE_STATUS_OPTIONS = [
  { value: 'active' as const, label: 'Active' },
  { value: 'on_leave' as const, label: 'On leave' },
  { value: 'inactive' as const, label: 'Inactive' },
  { value: 'all' as const, label: 'All statuses' },
]

export function EmployeeListPage() {
  const { can, visibleEmployees } = useAuth()
  const { departments, designations, employees, getDepartment, getDesignation } = useWireframeData()
  const canWrite = can('page:employees:write')
  const [searchParams] = useSearchParams()
  const initialDept = searchParams.get('dept') ?? ALL

  const [departmentFilter, setDepartmentFilter] = useState(initialDept)
  const [designationFilter, setDesignationFilter] = useState(ALL)

  const source = visibleEmployees()

  const departmentOptions = useMemo(() => {
    const ids = new Set(source.map((e) => e.departmentId))
    return departments
      .filter((d) => ids.has(d.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [source])

  const designationOptions = useMemo(() => {
    const rows =
      departmentFilter === ALL
        ? source
        : source.filter((e) => e.departmentId === departmentFilter)
    const ids = new Set(rows.map((e) => e.designationId))
    return designations
      .filter((d) => ids.has(d.id))
      .sort((a, b) => a.title.localeCompare(b.title))
  }, [source, departmentFilter])

  const scopedSource = useMemo(() => {
    return source.filter((e) => {
      if (departmentFilter !== ALL && e.departmentId !== departmentFilter) return false
      if (designationFilter !== ALL && e.designationId !== designationFilter) return false
      return true
    })
  }, [source, departmentFilter, designationFilter])

  const list = useListControls(scopedSource, {
    searchFn: (e, q) => {
      const name = `${e.firstName} ${e.lastName}`.toLowerCase()
      const dept = getDepartment(e.departmentId)?.name.toLowerCase() ?? ''
      const des = getDesignation(e.designationId)?.title.toLowerCase() ?? ''
      return (
        name.includes(q) ||
        e.employeeNo.toLowerCase().includes(q) ||
        dept.includes(q) ||
        des.includes(q) ||
        (e.sanctionedPost?.toLowerCase().includes(q) ?? false)
      )
    },
    statusFn: (e, f) => {
      if (f === 'all') return true
      return e.status === f
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

  const hasExtraFilters = departmentFilter !== ALL || designationFilter !== ALL
  const hasActiveFilters = list.hasActiveFilters || hasExtraFilters

  function resetAllFilters() {
    list.resetFilters()
    setDepartmentFilter(ALL)
    setDesignationFilter(ALL)
  }

  function onDepartmentFilterChange(value: string) {
    setDepartmentFilter(value)
    setDesignationFilter(ALL)
    list.setPage(1)
  }

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
        searchPlaceholder="Search by name, code, centre, post, or designation..."
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        statusOptions={EMPLOYEE_STATUS_OPTIONS}
        extraFilters={
          <>
            <select
              id="hrms-dept-filter"
              className="hrms-ref-select"
              value={departmentFilter}
              onChange={(e) => onDepartmentFilterChange(e.target.value)}
              aria-label="Department filter"
            >
              <option value={ALL}>All departments</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <select
              id="hrms-designation-filter"
              className="hrms-ref-select"
              value={designationFilter}
              onChange={(e) => {
                setDesignationFilter(e.target.value)
                list.setPage(1)
              }}
              aria-label="Designation filter"
            >
              <option value={ALL}>All designations</option>
              {designationOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                  {d.grade ? ` (BPS ${d.grade})` : ''}
                </option>
              ))}
            </select>
          </>
        }
        hasActiveFilters={hasActiveFilters}
        onResetFilters={resetAllFilters}
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
          Showing scoped roster ({scopedSource.length} of {employees.length} demo employees).
        </p>
      </DataListPanel>
    </HrmsListShell>
  )
}

function EmployeeRow({ employee: e, canWrite }: { employee: Employee; canWrite: boolean }) {
  const { getDepartment, getDesignation } = useWireframeData()
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
