import { useCallback, useMemo, useState } from 'react'

export type SortDir = 'asc' | 'desc' | null

export type StatusFilter =
  | 'active'
  | 'inactive'
  | 'on_leave'
  | 'all'
  | 'present'
  | 'late'
  | 'absent'
  | 'half_day'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

type Options<T> = {
  searchFn: (item: T, query: string) => boolean
  sortFns: Record<string, (a: T, b: T) => number>
  statusFn?: (item: T, filter: StatusFilter) => boolean
  defaultPageSize?: number
  defaultSortColumn?: string
  defaultSortDir?: SortDir
  defaultStatusFilter?: StatusFilter
}

export function useListControls<T>(items: T[], options: Options<T>) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    options.defaultStatusFilter ?? 'active',
  )
  const [sortColumn, setSortColumn] = useState<string | null>(options.defaultSortColumn ?? null)
  const [sortDir, setSortDir] = useState<SortDir>(options.defaultSortDir ?? null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(options.defaultPageSize ?? 10)

  function toggleSort(column: string) {
    if (sortColumn !== column) {
      setSortColumn(column)
      setSortDir('asc')
      return
    }
    if (sortDir === 'asc') {
      setSortDir('desc')
      return
    }
    if (sortDir === 'desc') {
      setSortColumn(null)
      setSortDir(null)
      return
    }
    setSortDir('asc')
  }

  function resetFilters() {
    setSearch('')
    setStatusFilter(options.defaultStatusFilter ?? 'all')
    setSortColumn(options.defaultSortColumn ?? null)
    setSortDir(options.defaultSortDir ?? null)
    setPage(1)
  }

  const setSort = useCallback((column: string | null, dir: SortDir) => {
    setSortColumn(column)
    setSortDir(dir)
    setPage(1)
  }, [])

  const filtered = useMemo(() => {
    let rows = [...items]
    const q = search.trim().toLowerCase()
    if (q) rows = rows.filter((r) => options.searchFn(r, q))
    if (options.statusFn && statusFilter !== 'all') {
      rows = rows.filter((r) => options.statusFn!(r, statusFilter))
    }
    if (sortColumn && sortDir && options.sortFns[sortColumn]) {
      const cmp = options.sortFns[sortColumn]
      rows.sort((a, b) => (sortDir === 'asc' ? cmp(a, b) : cmp(b, a)))
    }
    return rows
  }, [items, search, statusFilter, sortColumn, sortDir, options])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, safePage, pageSize])

  const firstItem = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const lastItem = Math.min(safePage * pageSize, total)

  const defaultStatus = options.defaultStatusFilter ?? 'active'
  const hasActiveFilters =
    search.trim() !== '' || statusFilter !== defaultStatus || sortColumn !== null

  return {
    search,
    setSearch: (v: string) => {
      setSearch(v)
      setPage(1)
    },
    statusFilter,
    setStatusFilter: (v: StatusFilter) => {
      setStatusFilter(v)
      setPage(1)
    },
    sortColumn,
    sortDir,
    toggleSort,
    page: safePage,
    setPage,
    pageSize,
    setPageSize: (n: number) => {
      setPageSize(n)
      setPage(1)
    },
    pageRows,
    total,
    totalPages,
    firstItem,
    lastItem,
    resetFilters,
    setSort,
    hasActiveFilters,
  }
}
