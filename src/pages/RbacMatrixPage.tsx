import { ALL_PERMISSIONS, ROLE_PERMISSIONS } from '../auth/rolePermissions'
import { ROLE_LABELS } from '../auth/roleLabels'
import type { RoleId } from '../auth/types'
import './pages.css'

const ROLES = Object.keys(ROLE_LABELS) as RoleId[]

function roleHas(role: RoleId, perm: (typeof ALL_PERMISSIONS)[number]): boolean {
  const raw = ROLE_PERMISSIONS[role]
  if (raw[0] === '*') return true
  return (raw as readonly (typeof ALL_PERMISSIONS)[number][]).includes(perm)
}

export function RbacMatrixPage() {
  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Roles & permissions</h1>
      <p className="wf-lead">
        Module- and feature-level access per client organogram role. Production system will persist this matrix
        in <code>hrms_role_permissions</code>.
      </p>

      <div className="wf-table-wrap wf-table-wrap--scroll">
        <table className="wf-table wf-table--compact">
          <thead>
            <tr>
              <th scope="col">Permission</th>
              {ROLES.map((r) => (
                <th key={r} scope="col" className="wf-table-th-vertical">
                  {ROLE_LABELS[r]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_PERMISSIONS.map((p) => (
              <tr key={p}>
                <td>
                  <code>{p}</code>
                </td>
                {ROLES.map((r) => (
                  <td key={r} className="wf-table-cell-center">
                    {roleHas(r, p) ? '✓' : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
