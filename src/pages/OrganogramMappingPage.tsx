import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import {
  exportOrganogramSnapshotDownload,
  importOrganogramSnapshotFromJson,
  ORGANOGRAM_SNAPSHOT_PATH,
  resetOrganogramStore,
} from '../data/organogramStore'
import {
  LEGACY_DEPARTMENT_TO_WING,
  LEGACY_SECTION_TO_ORG_SECTION,
  type OrgMappingRow,
} from '../data/navttcOrgMapping'
import { ORG_LEVEL_LABELS, getOrgMappingRows } from '../data/navttcHqOrganogram'
import { useOrganogramNodes } from '../hooks/useOrganogramNodes'
import { getDepartments } from '../data/mock'
import '../styles/organogram-mapping.css'
import './pages.css'

const LEVEL_ORDER = ['head', 'wing', 'section', 'sub_section_1', 'sub_section_2'] as const

export function OrganogramMappingPage() {
  const { can } = useAuth()
  const canWrite = can('page:departments:write')
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<string>('all')
  const [dataNotice, setDataNotice] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  const nodes = useOrganogramNodes()
  const mappingRows = useMemo(() => getOrgMappingRows(), [nodes])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mappingRows.filter((r) => {
      if (levelFilter !== 'all' && r.level !== levelFilter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.path.toLowerCase().includes(q) ||
        (r.parentName?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [search, levelFilter, mappingRows])

  const deptRows = useMemo(() => {
    return getDepartments().map((d) => ({
      dept: d,
      wingId: LEGACY_DEPARTMENT_TO_WING[d.id],
      wingName: mappingRows.find((r) => r.id === LEGACY_DEPARTMENT_TO_WING[d.id])?.name ?? '—',
    }))
  }, [mappingRows])

  return (
    <HrmsListShell current="Organogram mapping">
      <div className="hrms-org-mapping-page hrms-ref-page">
        <header className="wf-page-head" style={{ marginBottom: '1rem' }}>
          <div>
            <h1 className="wf-h1">Organogram mapping</h1>
          </div>
          <div className="wf-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <Link to="/organogram" className="hrms-ref-btn-secondary">
              <i className="ri-file-pdf-line" aria-hidden /> View PDF
            </Link>
            {canWrite ? (
              <>
                <button
                  type="button"
                  className="hrms-ref-btn-secondary"
                  onClick={() => exportOrganogramSnapshotDownload()}
                >
                  <i className="ri-download-2-line" aria-hidden /> Export JSON
                </button>
                <button
                  type="button"
                  className="hrms-ref-btn-secondary"
                  onClick={() => importRef.current?.click()}
                >
                  <i className="ri-upload-2-line" aria-hidden /> Import JSON
                </button>
                <button
                  type="button"
                  className="hrms-ref-btn-secondary"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Reset organogram to built-in seed? This clears browser-saved CRUD data.',
                      )
                    ) {
                      resetOrganogramStore()
                      setDataNotice('Organogram reset to default seed.')
                    }
                  }}
                >
                  <i className="ri-restart-line" aria-hidden /> Reset data
                </button>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (!file) return
                    const text = await file.text()
                    const result = importOrganogramSnapshotFromJson(text)
                    if ('error' in result) {
                      setDataNotice(result.error)
                      return
                    }
                    setDataNotice(
                      `Imported ${file.name}. To show this file in Cursor, save the same JSON as hrms_wireframe/public/organogram-snapshot.json`,
                    )
                  }}
                />
              </>
            ) : null}
            <Link to="/employees/new" className="hrms-btn-primary">
              <i className="ri-user-add-line" aria-hidden /> Create employee
            </Link>
          </div>
        </header>

        <p className="hrms-list-footnote" style={{ marginBottom: '1rem' }}>
          Organogram CRUD is saved in your <strong>browser</strong> (localStorage), not in project files — that is why
          Cursor&apos;s file tree does not change. Use <strong>Export JSON</strong>, save it as{' '}
          <code>hrms_wireframe/public/organogram-snapshot.json</code>, then reload (or Reset data first). Edits to{' '}
          <code>navttcOrgMapping.ts</code> only apply after Reset data or when no browser copy exists. Optional file:{' '}
          <code>{ORGANOGRAM_SNAPSHOT_PATH}</code>
        </p>
        {dataNotice ? (
          <p className="hrms-form-alert" role="status" style={{ marginBottom: '1rem' }}>
            {dataNotice}
          </p>
        ) : null}

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
                {mappingRows.length} nodes — use IDs in employee form dropdowns
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
                    const node = mappingRows.find((r) => r.id === nodeId)
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
