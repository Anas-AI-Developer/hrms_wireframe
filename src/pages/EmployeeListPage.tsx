import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { StatusBadge } from '../components/hrms/StatusBadge'
import {
  DASHBOARD_JOB_FILTER_PARAM,
  DASHBOARD_JOB_FILTERS,
  employmentLabelForEmployee,
  jobFilterLabel,
  matchesJobTypeFilter,
  type DashboardJobFilter,
} from '../data/dashboardEmployment'
import { useWireframeData } from '../data/WireframeDataContext'
import { useListControls } from '../hooks/useListControls'
import type { Employee } from '../types/hrms'
import { formatEmployeeDate } from '../utils/formatDate'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const initialDept = searchParams.get('dept') ?? ALL
  const initialJob = searchParams.get(DASHBOARD_JOB_FILTER_PARAM) ?? ALL

  const [departmentFilter, setDepartmentFilter] = useState(initialDept)
  const [designationFilter, setDesignationFilter] = useState(ALL)
  const [jobTypeFilter, setJobTypeFilter] = useState(initialJob)

  useEffect(() => {
    setDepartmentFilter(searchParams.get('dept') ?? ALL)
    setJobTypeFilter(searchParams.get(DASHBOARD_JOB_FILTER_PARAM) ?? ALL)
  }, [searchParams])

  const jobFilterValid =
    jobTypeFilter === ALL ||
    DASHBOARD_JOB_FILTERS.some((f) => f.id === jobTypeFilter)

  const source = visibleEmployees()

  const departmentOptions = useMemo(() => {
    const ids = new Set(source.map((e) => e.departmentId))
    return departments
      .filter((d) => ids.has(d.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [source, departments])

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
      if (
        jobFilterValid &&
        jobTypeFilter !== ALL &&
        !matchesJobTypeFilter(e, jobTypeFilter as DashboardJobFilter)
      ) {
        return false
      }
      return true
    })
  }, [source, departmentFilter, designationFilter, jobTypeFilter, jobFilterValid])

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
      endDate: (a, b) => a.endDate.localeCompare(b.endDate),
    },
  })

  const hasExtraFilters =
    departmentFilter !== ALL || designationFilter !== ALL || (jobFilterValid && jobTypeFilter !== ALL)
  const hasActiveFilters = list.hasActiveFilters || hasExtraFilters
  const showJobTypeColumn = jobFilterValid && jobTypeFilter !== ALL

  const listTitle =
    showJobTypeColumn
      ? `Employees — ${jobFilterLabel(jobTypeFilter as DashboardJobFilter)}`
      : 'Employees list'

  function resetAllFilters() {
    list.resetFilters()
    setDepartmentFilter(ALL)
    setDesignationFilter(ALL)
    setJobTypeFilter(ALL)
    setSearchParams({})
  }

  function onJobTypeFilterChange(value: string) {
    setJobTypeFilter(value)
    list.setPage(1)
    const next = new URLSearchParams(searchParams)
    if (value === ALL) next.delete(DASHBOARD_JOB_FILTER_PARAM)
    else next.set(DASHBOARD_JOB_FILTER_PARAM, value)
    setSearchParams(next)
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
        title={listTitle}
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
            <select
              id="hrms-job-type-filter"
              className="hrms-ref-select"
              value={jobTypeFilter}
              onChange={(e) => onJobTypeFilterChange(e.target.value)}
              aria-label="Job type filter"
            >
              <option value={ALL}>All job types</option>
              {DASHBOARD_JOB_FILTERS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.label}
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
                {showJobTypeColumn ? <th>Job type</th> : null}
                <SortableTh label="Status" column="status" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="Joined" column="joinDate" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <SortableTh label="End date" column="endDate" sortColumn={list.sortColumn} sortDir={list.sortDir} onSort={list.toggleSort} />
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={showJobTypeColumn ? 9 : 8} className="hrms-empty">
                    No employees found.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((e) => (
                  <EmployeeRow
                    key={e.id}
                    employee={e}
                    canWrite={canWrite}
                    showJobType={showJobTypeColumn}
                  />
                ))
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

function EmployeeRow({
  employee: e,
  canWrite,
  showJobType,
}: {
  employee: Employee
  canWrite: boolean
  showJobType: boolean
}) {
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
      {showJobType ? <td>{employmentLabelForEmployee(e)}</td> : null}
      <td>
        <StatusBadge status={e.status} />
      </td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {formatEmployeeDate(e.joinDate)}
      </td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {formatEmployeeDate(e.endDate)}
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
