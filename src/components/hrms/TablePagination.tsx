type Props = {
  firstItem: number
  lastItem: number
  total: number
  page: number
  totalPages: number
  pageSize: number
  onPageSizeChange: (n: number) => void
  onPageChange: (p: number) => void
}

export function TablePagination({
  firstItem,
  lastItem,
  total,
  page,
  totalPages,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: Props) {
  if (total === 0) return null

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let p = start; p <= end; p++) pages.push(p)

  return (
    <div className="hrms-table-pagination">
      <p className="hrms-pagination-summary">
        Showing {firstItem} to {lastItem} of {total} rows
      </p>
      <div className="hrms-pagination-controls">
        <select
          className="hrms-ref-select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          aria-label="Rows per page"
        >
          {[5, 10, 15, 20, 30, 50].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="hrms-page-btn hrms-page-btn--primary"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <i className="ri-skip-back-line" />
        </button>
        <button
          type="button"
          className="hrms-page-btn hrms-page-btn--primary"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <i className="ri-arrow-left-s-line" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`hrms-page-btn ${p === page ? 'hrms-page-btn--active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="hrms-page-btn hrms-page-btn--primary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <i className="ri-arrow-right-s-line" />
        </button>
        <button
          type="button"
          className="hrms-page-btn hrms-page-btn--primary"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <i className="ri-skip-forward-line" />
        </button>
      </div>
    </div>
  )
}
