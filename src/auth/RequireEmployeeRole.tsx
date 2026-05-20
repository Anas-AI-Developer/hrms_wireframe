import { Navigate } from 'react-router-dom'
import { homePathForRole } from '../portals/homePath'
import { useAuth } from './AuthContext'

/** ESS routes that are only for the employee role (not leadership / HR). */
export function RequireEmployeeRole({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'employee') {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return children
}
