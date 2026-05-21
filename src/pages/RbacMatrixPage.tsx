import { Fragment, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildPermissionGroups,
  permissionLabel,
  ROLE_HEADER_SHORT,
} from '../auth/permissionLabels'
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, roleHasPermission } from '../auth/rolePermissions'
import { ROLE_LABELS } from '../auth/roleLabels'
import type { Permission, RoleId } from '../auth/types'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import '../styles/rbac-matrix.css'
import './pages.css'

const ROLES = Object.keys(ROLE_LABELS) as RoleId[]
const PERMISSION_GROUPS = buildPermissionGroups(ALL_PERMISSIONS)
const TOTAL_UNIQUE = new Set(ALL_PERMISSIONS).size

export function RbacMatrixPage() {
  const [search, setSearch] = useState('')

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return PERMISSION_GROUPS
    return PERMISSION_GROUPS.map((g) => ({
      ...g,
      permissions: g.permissions.filter(
        (p) =>
          p.toLowerCase().includes(q) ||
          permissionLabel(p).toLowerCase().includes(q),
      ),
    })).filter((g) => g.permissions.length > 0)
  }, [search])

  const roleStats = useMemo(
    () =>
      ROLES.map((role) => {
        const full = ROLE_PERMISSIONS[role][0] === '*'
        const count = full
          ? TOTAL_UNIQUE
          : [...new Set(ALL_PERMISSIONS)].filter((p) => roleHasPermission(role, p)).length
        return { role, count, full }
      }),
    [],
  )

  return (
    <HrmsListShell current="Roles & permissions">
      <div className="hrms-rbac-page hrms-ref-page">
        <header className="wf-page-head" style={{ marginBottom: '1rem' }}>
          <h1 className="wf-h1">Roles & permissions</h1>
        </header>

        <div className="hrms-rbac-role-cards">
          {roleStats.map(({ role, count, full }) => (
            <div
              key={role}
              className={`hrms-rbac-role-card${full ? ' hrms-rbac-role-card--full' : ''}`}
              title={ROLE_LABELS[role]}
            >
              <div className="hrms-rbac-role-card__name">{ROLE_HEADER_SHORT[role] ?? ROLE_LABELS[role]}</div>
              <div className="hrms-rbac-role-card__count">
                {full ? 'All' : count}
                {!full ? <span> / {TOTAL_UNIQUE}</span> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="hrms-rbac-toolbar">
          <input
            type="search"
            className="hrms-rbac-search"
            placeholder="Search permission or module…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search permissions"
          />
          <div className="hrms-rbac-legend" aria-hidden>
            <span className="hrms-rbac-legend__item">
              <span className="hrms-rbac-matrix__badge hrms-rbac-matrix__badge--yes">✓</span>
              Granted
            </span>
            <span className="hrms-rbac-legend__item">
              <span className="hrms-rbac-matrix__badge hrms-rbac-matrix__badge--no">—</span>
              Not granted
            </span>
          </div>
        </div>

        <article className="hrms-ref-panel">
          <div className="hrms-rbac-matrix-wrap">
            <table className="hrms-rbac-matrix">
              <thead>
                <tr>
                  <th scope="col" className="hrms-rbac-matrix__perm-col">
                    Permission
                  </th>
                  {ROLES.map((role) => (
                    <th key={role} scope="col" title={ROLE_LABELS[role]}>
                      <span className="hrms-rbac-matrix__role-head">
                        <span className="hrms-rbac-matrix__role-abbr">
                          {ROLE_HEADER_SHORT[role]}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={ROLES.length + 1} className="hrms-empty" style={{ padding: '2rem' }}>
                      No permissions match your search.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <Fragment key={group.id}>
                      <tr className="hrms-rbac-matrix__group-row">
                        <td colSpan={ROLES.length + 1}>{group.label}</td>
                      </tr>
                      {group.permissions.map((perm) => (
                        <PermissionRow key={perm} permission={perm} />
                      ))}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>

        <p className="hrms-rbac-footer-link">
          <Link to="/admin/settings" className="hrms-rbac-quick-link">
            <i className="ri-settings-3-line" aria-hidden />
            Admin settings
          </Link>
        </p>
      </div>
    </HrmsListShell>
  )
}

function PermissionRow({ permission }: { permission: Permission }) {
  return (
    <tr>
      <td className="hrms-rbac-matrix__perm-cell">
        <span className="hrms-rbac-matrix__perm-label">{permissionLabel(permission)}</span>
        <code className="hrms-rbac-matrix__perm-code">{permission}</code>
      </td>
      {ROLES.map((role) => {
        const granted = roleHasPermission(role, permission)
        return (
          <td key={role} className="hrms-rbac-matrix__cell">
            <span
              className={`hrms-rbac-matrix__badge ${granted ? 'hrms-rbac-matrix__badge--yes' : 'hrms-rbac-matrix__badge--no'}`}
              title={granted ? 'Granted' : 'Not granted'}
              aria-label={`${ROLE_LABELS[role]}: ${granted ? 'granted' : 'not granted'}`}
            >
              {granted ? '✓' : '—'}
            </span>
          </td>
        )
      })}
    </tr>
  )
}
