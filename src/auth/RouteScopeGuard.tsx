import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { homePathForRole } from '../portals/homePath'
import { canAccessPath } from './routeAccess'
import { useAuth } from './AuthContext'

/** Silently send users away from URLs their role cannot open (no error page). */
export function RouteScopeGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { pathname } = useLocation()

  if (user && !canAccessPath(user.role, pathname)) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return children
}
