import type { FormEvent } from 'react'
import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { MOCK_USERS, roleLabelForUser } from '../auth/mockUsers'
import './LoginPage.css'

export function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRoleCreds, setShowRoleCreds] = useState(false)

  if (user) {
    return <Navigate to={from === '/login' ? '/dashboard' : from} replace />
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const result = login(username, password)
    if (!result.ok) {
      setError(result.message)
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="nvqf-login-page">
      <div className="nvqf-login-shell">
        <aside className="nvqf-panel-brand" aria-label="Welcome">
          <div className="nvqf-panel-brand-inner">
            <div className="nvqf-brand-logo" aria-hidden>
              <span className="nvqf-brand-logo-text">HRMS</span>
            </div>

            <h2 className="nvqf-brand-welcome-title">Welcome to HRMS Wireframe</h2>
            <p className="nvqf-brand-welcome-urdu"> ہیومن ریسورسز مینجمنٹ · UI prototype</p>
            <p className="nvqf-brand-mission">
              This screen mirrors the NAVTTC / NVQF Filament login layout and colours from the reference
              Laravel app (blues #4B62BE / #2F4798). Authentication here is mock only — use{' '}
              <strong>Show role cred</strong> below the login button for demo accounts.
            </p>

            <div className="nvqf-brand-info">
              <p>
                <strong>Wireframe</strong> — no API calls. Session is stored in{' '}
                <code className="nvqf-inline-code">sessionStorage</code> until you sign out or close the
                tab.
              </p>
            </div>
          </div>
        </aside>

        <main className="nvqf-panel-form">
          <div className="nvqf-form-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to continue</p>
          </div>

          {error ? (
            <div className="nvqf-login-alert" role="alert">
              {error}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="nvqf-login-form">
            <label className="nvqf-field">
              <span className="nvqf-field-label nvqf-field-label--accent">Email or username</span>
              <input
                className="nvqf-input"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                placeholder="e.g. executive.director"
                required
              />
            </label>
            <label className="nvqf-field">
              <span className="nvqf-field-label">Password</span>
              <input
                className="nvqf-input"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="••••••••"
                required
              />
            </label>
            <label className="nvqf-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(ev) => setRemember(ev.target.checked)}
              />
              Remember me
            </label>
            <button type="submit" className="nvqf-btn-login">
              Login
            </button>
          </form>

          <div className="nvqf-role-creds-wrap">
            <button
              type="button"
              className="nvqf-btn-show-creds"
              aria-expanded={showRoleCreds}
              aria-controls="role-creds-table"
              onClick={() => setShowRoleCreds((v) => !v)}
            >
              {showRoleCreds ? 'Hide role cred' : 'Show role cred'}
            </button>
            {showRoleCreds ? (
              <div id="role-creds-table" className="nvqf-role-creds-panel">
                <table className="nvqf-role-creds-table">
                  <caption className="nvqf-sr-only">Demo login credentials by role</caption>
                  <thead>
                    <tr>
                      <th scope="col">Role</th>
                      <th scope="col">Designation</th>
                      <th scope="col">Username</th>
                      <th scope="col">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USERS.map((u) => (
                      <tr key={u.username}>
                        <td>{roleLabelForUser(u)}</td>
                        <td>{u.designation ?? '—'}</td>
                        <td>
                          <code>{u.username}</code>
                        </td>
                        <td>
                          <code>{u.password}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="nvqf-role-creds-hint">Wireframe demo only — same password for every role.</p>
              </div>
            ) : null}
          </div>

          <div className="nvqf-form-footer">
            <p>
              Reference app: sibling folder <code className="nvqf-inline-code">hrms</code> (read-only).
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
