import { portalIdForRole } from './portalConfig'
import type { RoleId } from '../auth/types'

/** Post-login landing route per role. */
export function homePathForRole(role: RoleId): string {
  if (portalIdForRole(role) === 'employee') return '/ess'
  return '/dashboard'
}
