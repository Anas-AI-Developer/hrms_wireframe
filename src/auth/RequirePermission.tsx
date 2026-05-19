import { Navigate } from 'react-router-dom'
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
    return <Navigate to="/access-denied" replace />
  }

  return children
}
