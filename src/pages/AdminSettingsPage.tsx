import { useAuth } from '../auth/AuthContext'
import './pages.css'

const LEAVE_TYPES = ['Casual', 'Sick', 'Annual', 'Emergency']

export function AdminSettingsPage() {
  const { can } = useAuth()
  const canEdit = can('page:admin_settings')

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Admin settings</h1>

      <div className="wf-grid wf-grid--2">
        <section className="wf-card wf-card--flat">
          <h2 className="wf-h2">Leave types</h2>
          <ul className="wf-list">
            {LEAVE_TYPES.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>

        <section className="wf-card wf-card--flat">
          <h2 className="wf-h2">Office hours</h2>
          <dl className="wf-dl wf-dl--compact">
            <dt>Standard day</dt>
            <dd>8 hours (fixed)</dd>
            <dt>Core hours</dt>
            <dd>09:00 – 17:00 (demo)</dd>
            <dt>Flexible timing</dt>
            <dd>Disabled per client</dd>
          </dl>
        </section>

        <section className="wf-card wf-card--flat">
          <h2 className="wf-h2">Leave approval</h2>
          <label className="wf-field">
            <span>HR approval required after manager</span>
            <select defaultValue="yes" disabled={!canEdit}>
              <option value="yes">Yes</option>
              <option value="no">Manager only</option>
            </select>
          </label>
        </section>

        <section className="wf-card wf-card--flat">
          <h2 className="wf-h2">Recruitment pipeline</h2>
          <ol className="wf-list wf-list--ordered">
            <li>Job posted (public portal)</li>
            <li>Application received</li>
            <li>Shortlist</li>
            <li>Interview(s)</li>
            <li>Offer / reject</li>
            <li>Onboarding</li>
          </ol>
        </section>
      </div>

      {!canEdit ? (
        <p className="wf-note wf-note--warn">You have read-only access. Sign in as Executive Director to change settings.</p>
      ) : null}
    </div>
  )
}
