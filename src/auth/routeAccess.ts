import { homePathForRole } from '../portals/homePath'
import { roleHasPermission } from './rolePermissions'
import type { Permission, RoleId } from './types'

function normalizePath(pathname: string): string {
  const base = pathname.split('?')[0].split('#')[0]
  if (base.length > 1 && base.endsWith('/')) return base.slice(0, -1)
  return base || '/'
}

/** Minimum permission for a path (mirrors App.tsx RequirePermission guards). */
export function permissionForPath(pathname: string): Permission | null {
  const path = normalizePath(pathname)

  if (path === '/' || path === '/login') return null

  if (path === '/dashboard') return 'page:dashboard'
  if (path === '/ess' || path === '/ess/') return 'page:dashboard'
  if (path === '/ess/leave') return 'page:leave'
  if (path === '/ess/attendance') return 'page:attendance'
  if (path === '/ess/performance') return 'page:performance'
  if (path === '/ess/training') return 'page:training'

  if (path === '/admin/settings') return 'page:admin_settings'
  if (path === '/admin/rbac') return 'page:rbac'

  if (path === '/employees/new' || /\/employees\/[^/]+\/edit$/.test(path)) {
    return 'page:employees:write'
  }
  if (path.startsWith('/employees')) return 'page:employees'

  if (path === '/departments') return 'page:departments'
  if (path.startsWith('/org/')) return 'page:departments'
  if (path === '/designations') return 'page:designations'

  if (path === '/attendance/import') return 'page:attendance:import'
  if (/^\/attendance\/employee\/[^/]+$/.test(path)) return 'page:attendance'
  if (path === '/attendance') return 'page:attendance'

  if (path === '/leave') return 'page:leave'

  if (path === '/jobs/new' || /^\/jobs\/[^/]+\/edit$/.test(path)) return 'page:recruitment'
  if (
    path === '/jobs' ||
    path === '/hiring-pipeline' ||
    path === '/schedule-interview' ||
    path === '/recruitment'
  ) {
    return 'page:recruitment'
  }

  if (path === '/onboarding/cases' || path === '/onboarding') return 'page:onboarding'

  if (path === '/reports/attendance') return 'page:reports:attendance'
  if (path === '/reports/employees') return 'page:reports:employees'
  if (path === '/reports') return 'page:reports'

  if (path === '/proposal') return 'page:proposal'
  if (path === '/performance') return 'page:performance:manage'
  if (path === '/training') return 'page:training'
  if (path === '/roadmap') return 'page:roadmap'
  if (path === '/modules') return 'page:modules'
  if (path === '/organogram/mapping') return 'page:organogram'
  if (path === '/organogram') return 'page:organogram'
  if (path === '/master-data') return 'page:master_data'

  return null
}

export function canAccessPath(role: RoleId, pathname: string): boolean {
  const perm = permissionForPath(pathname)
  if (!perm) return true
  return roleHasPermission(role, perm)
}

/** After login, only return `from` when the role is allowed on that route. */
export function resolvePostLoginPath(role: RoleId, from?: string | null): string {
  const home = homePathForRole(role)
  if (!from || from === '/login') return home
  const path = normalizePath(from)
  if (path === '/') return home
  return canAccessPath(role, path) ? path : home
}
