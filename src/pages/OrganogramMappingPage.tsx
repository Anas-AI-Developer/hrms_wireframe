import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import {
  LEGACY_DEPARTMENT_TO_WING,
  LEGACY_SECTION_TO_ORG_SECTION,
  ORG_MAPPING_ROWS,
  type OrgMappingRow,
} from '../data/navttcOrgMapping'
import { ORG_LEVEL_LABELS } from '../data/navttcHqOrganogram'
import { getDepartments } from '../data/mock'
import '../styles/organogram-mapping.css'
import './pages.css'

const LEVEL_ORDER = ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2'] as const

export function OrganogramMappingPage() {
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return ORG_MAPPING_ROWS.filter((r) => {
      if (levelFilter !== 'all' && r.level !== levelFilter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q) ||
        (r.parentName?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [search, levelFilter])

  const deptRows = useMemo(() => {
    return getDepartments().map((d) => ({
      dept: d,
      wingId: LEGACY_DEPARTMENT_TO_WING[d.id],
      wingName: ORG_MAPPING_ROWS.find((r) => r.id === LEGACY_DEPARTMENT_TO_WING[d.id])?.name ?? '—',
    }))
  }, [])

  return (
    <HrmsListShell current="Organogram mapping">
      <div className="hrms-org-mapping-page hrms-ref-page">
        <header className="wf-page-head" style={{ marginBottom: '1rem' }}>
          <div>
            <h1 className="wf-h1">Organogram mapping</h1>
          </div>
          <div className="wf-actions">
            <Link to="/organogram" className="hrms-ref-btn-secondary">
              <i className="ri-file-pdf-line" aria-hidden /> View PDF
            </Link>
            <Link to="/employees/new" className="hrms-btn-primary">
              <i className="ri-user-add-line" aria-hidden /> Create employee
            </Link>
          </div>
        </header>

        <div className="hrms-org-mapping-levels" aria-label="Hierarchy levels">
          {LEVEL_ORDER.map((lvl, i) => (
            <span key={lvl} className="hrms-org-mapping-levels__item">
              {i > 0 ? <span className="hrms-org-mapping-levels__arrow">→</span> : null}
              <span className={`hrms-org-mapping-levels__pill hrms-org-mapping-levels__pill--${lvl}`}>
                {ORG_LEVEL_LABELS[lvl]}
              </span>
            </span>
          ))}
        </div>

        <div className="hrms-org-mapping-grid">
          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Hierarchy codes</h2>
              <p className="hrms-ref-panel-desc">
                {ORG_MAPPING_ROWS.length} nodes — use IDs in employee form dropdowns
              </p>
            </header>
            <div className="hrms-ref-panel-body hrms-ref-panel-body--flush">
              <div className="hrms-org-mapping-toolbar">
                <input
                  type="search"
                  className="hrms-org-mapping-search"
                  placeholder="Search name, code, or path…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search mapping"
                />
                <select
                  className="hrms-ref-select"
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  aria-label="Filter by level"
                >
                  <option value="all">All levels</option>
                  {LEVEL_ORDER.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {ORG_LEVEL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hrms-org-mapping-table-wrap">
                <table className="hrms-data-table hrms-org-mapping-table">
                  <thead>
                    <tr>
                      <th>Level</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Parent</th>
                      <th>Full path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="hrms-empty">
                          No mapping rows match your filters.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((r) => <MappingRow key={r.id} row={r} />)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </article>

          <aside className="hrms-org-mapping-side">
            <article className="hrms-ref-panel">
              <header className="hrms-ref-panel-head">
                <h2 className="hrms-ref-panel-title">Legacy department → Wing</h2>
                <p className="hrms-ref-panel-desc">Wireframe roster centres mapped to DG wings</p>
              </header>
              <div className="hrms-ref-panel-body">
                <ul className="hrms-org-mapping-legacy-list">
                  {deptRows.map(({ dept, wingName }) => (
                    <li key={dept.id}>
                      <code>{dept.code}</code>
                      <span>{dept.name}</span>
                      <i className="ri-arrow-right-line" aria-hidden />
                      <strong>{wingName}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            <article className="hrms-ref-panel">
              <header className="hrms-ref-panel-head">
                <h2 className="hrms-ref-panel-title">Section label → Section node</h2>
                <p className="hrms-ref-panel-desc">MasterList section_field migration</p>
              </header>
              <div className="hrms-ref-panel-body">
                <ul className="hrms-org-mapping-legacy-list">
                  {Object.entries(LEGACY_SECTION_TO_ORG_SECTION).map(([label, nodeId]) => {
                    const node = ORG_MAPPING_ROWS.find((r) => r.id === nodeId)
                    return (
                      <li key={label}>
                        <span>{label}</span>
                        <i className="ri-arrow-right-line" aria-hidden />
                        <strong>{node?.name ?? nodeId}</strong>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </article>
          </aside>
        </div>
      </div>
    </HrmsListShell>
  )
}

function MappingRow({ row }: { row: OrgMappingRow }) {
  return (
    <tr className={`hrms-org-mapping-table__row hrms-org-mapping-table__row--${row.level}`}>
      <td>
        <span className={`hrms-org-mapping-level-badge hrms-org-mapping-level-badge--${row.level}`}>
          {ORG_LEVEL_LABELS[row.level]}
        </span>
      </td>
      <td>
        <code>{row.code}</code>
      </td>
      <td className="font-medium">{row.name}</td>
      <td className="text-sm" style={{ color: '#64748b' }}>
        {row.parentName ?? '—'}
      </td>
      <td className="hrms-org-mapping-path">{row.path}</td>
    </tr>
  )
}
