import { Navigate } from 'react-router-dom'
import { homePathForRole } from '../portals/homePath'
import { useAuth } from './AuthContext'
import type { Permission } from './types'

export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: React.ReactNode
}) {
  const { can, user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!can(permission)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return children
}
