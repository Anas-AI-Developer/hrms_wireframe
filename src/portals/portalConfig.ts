import type { Permission, RoleId } from '../auth/types'

export type PortalId = 'executive' | 'directorate' | 'accounts' | 'employee'

export type PortalLink = {
  label: string
  to: string
  permission: Permission
  hint?: string
}

export type PortalDefinition = {
  id: PortalId
  title: string
  subtitle: string
  /** Shown under logo in sidebar */
  tagline: string
}

export const PORTALS: Record<Exclude<PortalId, 'employee'>, PortalDefinition> = {
  executive: {
    id: 'executive',
    title: 'Executive leadership portal',
    subtitle:
      'Top leadership view — organization-wide workforce, configuration, and delivery planning (mirrors full HRMS access).',
    tagline: 'Executive portal',
  },
  directorate: {
    id: 'directorate',
    title: 'Directorate HR portal',
    subtitle:
      'Manage departments, designations, and employee records for your directorate scope.',
    tagline: 'Directorate portal',
  },
  accounts: {
    id: 'accounts',
    title: 'Accounts & finance portal',
    subtitle:
      'Registers, master data, and read-only HR lists (wireframe).',
    tagline: 'Accounts portal',
  },
}

export function portalIdForRole(role: RoleId): PortalId {
  switch (role) {
    case 'executive_director':
    case 'director_general':
      return 'executive'
    case 'director':
    case 'deputy_director':
    case 'assistant_director':
      return 'directorate'
    case 'assistant_accounts_officer_accounts':
    case 'assistant_accounts_officer_finance':
      return 'accounts'
    case 'employee':
      return 'employee'
    default:
      return 'directorate'
  }
}

export function portalForUser(role: RoleId): PortalDefinition | null {
  const id = portalIdForRole(role)
  if (id === 'employee') return null
  const base = { ...PORTALS[id] }
  if (role === 'assistant_accounts_officer_finance') {
    return {
      ...base,
      title: 'Finance portal',
      subtitle:
        'Finance registers and master data — read-only HR lists (wireframe).',
      tagline: 'Finance portal',
    }
  }
  if (role === 'assistant_accounts_officer_accounts') {
    return {
      ...base,
      title: 'Accounts portal',
      subtitle:
        'Accounts registers and master data — read-only HR lists; aligned with AAO (Accounts) organogram post.',
      tagline: 'Accounts portal',
    }
  }
  return base
}

/** HR home links — same order as hrms/resources/views/filament/resources/dashboard/hrms-home.blade.php */
export const PORTAL_HR_LINKS: PortalLink[] = [
  { label: 'Wings', to: '/org/wings', permission: 'page:departments' },
  { label: 'Designations', to: '/designations', permission: 'page:designations' },
  { label: 'Employees', to: '/employees', permission: 'page:employees' },
]

export const PORTAL_ADMIN_LINKS: PortalLink[] = [
  { label: 'Admin settings', to: '/admin/settings', permission: 'page:admin_settings' },
  { label: 'Roles & permissions', to: '/admin/rbac', permission: 'page:rbac' },
]
