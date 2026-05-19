import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { homePathForRole } from '../portals/homePath'

export function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homePathForRole(user.role)} replace />
}
