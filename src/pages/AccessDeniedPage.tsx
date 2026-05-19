import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import './pages.css'

export function AccessDeniedPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function switchUser() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="wf-page wf-page--centered">
      <h1 className="wf-h1">Access denied</h1>
      <p className="wf-lead">
        Your role does not include permission for this screen. Sign in with a different demo account
        from the login page, or ask an administrator to extend your role in the real system.
      </p>
      <div className="wf-actions" style={{ marginTop: '1rem' }}>
        <Link className="wf-btn wf-btn--ghost" to="/dashboard">
          Back to dashboard
        </Link>
        <button type="button" className="wf-btn wf-btn--primary" onClick={switchUser}>
          Switch user
        </button>
      </div>
    </div>
  )
}
