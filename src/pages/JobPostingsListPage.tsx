import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { SortableTh } from '../components/hrms/SortableTh'
import { getCandidatesForJob } from '../data/recruitmentMock'
import { JOB_STATUS_LABELS } from '../data/jobPostingsStore'
import type { JobPosting, JobStatus } from '../data/recruitmentMock'
import { useJobPostings } from '../hooks/useJobPostings'
import { useListControls, type StatusFilter } from '../hooks/useListControls'
import { formatEmployeeDate } from '../utils/formatDate'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Published' },
  { value: 'inactive', label: 'Draft' },
  { value: 'on_leave', label: 'Closed' },
]

function jobMatchesStatus(j: JobPosting, filter: StatusFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'active') return j.status === 'published'
  if (filter === 'inactive') return j.status === 'draft'
  if (filter === 'on_leave') return j.status === 'closed'
  return true
}

function statusPillClass(status: JobStatus): string {
  if (status === 'published') return 'wf-pill wf-pill--active'
  if (status === 'closed') return 'wf-pill wf-pill--inactive'
  return 'wf-pill'
}

export function JobPostingsListPage() {
  const navigate = useNavigate()
  const jobs = useJobPostings()

  const list = useListControls(jobs, {
    searchFn: (j, q) =>
      j.title.toLowerCase().includes(q) ||
      j.code.toLowerCase().includes(q) ||
      j.department.toLowerCase().includes(q) ||
      j.bps.includes(q),
    statusFn: (j, f) => jobMatchesStatus(j, f),
    sortFns: {
      title: (a, b) => a.title.localeCompare(b.title),
      code: (a, b) => a.code.localeCompare(b.code),
      department: (a, b) => a.department.localeCompare(b.department),
      status: (a, b) => a.status.localeCompare(b.status),
      createdAt: (a, b) => b.createdAt.localeCompare(a.createdAt),
    },
    defaultSortColumn: 'createdAt',
    defaultSortDir: 'desc',
    defaultStatusFilter: 'all',
    defaultPageSize: 10,
  })

  const applicantCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const j of jobs) {
      map.set(j.id, getCandidatesForJob(j.id).length)
    }
    return map
  }, [jobs])

  return (
    <HrmsListShell
      current="Job postings"
      actions={
        <Link to="/jobs/new" className="hrms-btn-primary">
          <i className="ri-add-line" aria-hidden /> New job posting
        </Link>
      }
    >
      <DataListPanel
        title="Job postings"
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search by title, code, or centre..."
        statusFilter={list.statusFilter}
        onStatusFilterChange={list.setStatusFilter}
        statusOptions={STATUS_OPTIONS}
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
                  label="Title"
                  column="title"
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
                  label="Centre"
                  column="department"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <th>BPS</th>
                <th>Vacancies</th>
                <th>Applicants</th>
                <SortableTh
                  label="Status"
                  column="status"
                  sortColumn={list.sortColumn}
                  sortDir={list.sortDir}
                  onSort={list.toggleSort}
                />
                <th>Closes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="hrms-empty">
                    No job postings match your filters.{' '}
                    <Link to="/jobs/new">Create the first posting</Link>.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((j) => {
                  const applicants = applicantCounts.get(j.id) ?? 0
                  return (
                    <tr key={j.id}>
                      <td className="font-medium">{j.title}</td>
                      <td>
                        <code>{j.code}</code>
                      </td>
                      <td>{j.department}</td>
                      <td>{j.bps}</td>
                      <td>{j.vacancies}</td>
                      <td>
                        {applicants > 0 ? (
                          <Link to="/recruitment">{applicants}</Link>
                        ) : (
                          '0'
                        )}
                      </td>
                      <td>
                        <span className={statusPillClass(j.status)}>
                          {JOB_STATUS_LABELS[j.status]}
                        </span>
                      </td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {formatEmployeeDate(j.closesAt)}
                      </td>
                      <td>
                        <RowActionsMenu
                          id={j.id}
                          actions={[
                            {
                              label: 'Edit',
                              onClick: () => navigate(`/jobs/${j.id}/edit`),
                            },
                            {
                              label: 'View pipeline',
                              href: '/recruitment',
                            },
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
