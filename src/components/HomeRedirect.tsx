import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function HomeRedirect() {
  const { user } = useAuth()
  if (user?.role === 'employee') {
    return <Navigate to="/ess" replace />
  }
  return <Navigate to="/dashboard" replace />
}
