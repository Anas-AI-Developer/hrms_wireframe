import type { ReactNode } from 'react'
import type { StatusFilter } from '../../hooks/useListControls'
import { TablePagination } from './TablePagination'

type Props = {
  title: string
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  statusFilter?: StatusFilter
  onStatusFilterChange?: (v: StatusFilter) => void
  showStatusFilter?: boolean
  hasActiveFilters?: boolean
  onResetFilters?: () => void
  children: ReactNode
  firstItem: number
  lastItem: number
  total: number
  page: number
  totalPages: number
  pageSize: number
  onPageSizeChange: (n: number) => void
  onPageChange: (p: number) => void
  toolbarExtra?: ReactNode
}

export function DataListPanel({
  title,
  search,
  onSearchChange,
  searchPlaceholder = 'Search...',
  statusFilter = 'active',
  onStatusFilterChange,
  showStatusFilter = true,
  hasActiveFilters,
  onResetFilters,
  children,
  firstItem,
  lastItem,
  total,
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange,
  toolbarExtra,
}: Props) {
  return (
    <article className="hrms-ref-panel">
      <header className="hrms-ref-panel-head">
        <h2 className="hrms-ref-panel-title">{title}</h2>
        <div className="hrms-ref-panel-tools">
          {showStatusFilter && onStatusFilterChange ? (
            <select
              id="hrms-status-filter"
              className="hrms-ref-select"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
              aria-label="Status filter"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All</option>
            </select>
          ) : null}
          <input
            type="search"
            className="hrms-ref-search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
          />
          {toolbarExtra}
          {hasActiveFilters && onResetFilters ? (
            <button type="button" className="hrms-ref-btn-secondary" onClick={onResetFilters}>
              <i className="ri-refresh-line" aria-hidden /> Reset filters
            </button>
          ) : null}
        </div>
      </header>
      <div className="hrms-ref-panel-body">
        {children}
        <TablePagination
          firstItem={firstItem}
          lastItem={lastItem}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={onPageSizeChange}
          onPageChange={onPageChange}
        />
      </div>
    </article>
  )
}
