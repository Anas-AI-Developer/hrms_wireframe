import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RECRUITMENT_STAGES } from '../data/recruitmentMock'
import '../styles/admin-settings.css'
import './pages.css'

const LEAVE_TYPES = [
  { id: 'casual', label: 'Casual', icon: 'ri-sun-line' },
  { id: 'sick', label: 'Sick', icon: 'ri-heart-pulse-line' },
  { id: 'annual', label: 'Annual', icon: 'ri-calendar-check-line' },
  { id: 'emergency', label: 'Emergency', icon: 'ri-alarm-warning-line' },
] as const

const OFFICE_HOURS = [
  { label: 'Standard day', value: '8 hours (fixed)', icon: 'ri-time-line' },
  { label: 'Core hours', value: '09:00 – 17:00', icon: 'ri-timer-line' },
  { label: 'Flexible timing', value: 'Disabled per client', icon: 'ri-loop-left-line' },
] as const

const PIPELINE_STEPS = [
  'Job posted (public portal)',
  'Application received',
  ...RECRUITMENT_STAGES.map((s) => s.label),
]

export function AdminSettingsPage() {
  const { can } = useAuth()
  const canEdit = can('page:admin_settings')

  return (
    <HrmsListShell current="Admin settings">
      <div className="hrms-admin-settings hrms-ref-page">
        <header className="wf-page-head" style={{ marginBottom: '1.25rem' }}>
          <div>
            <h1 className="wf-h1">Admin settings</h1>
          </div>
        </header>

        {!canEdit ? (
          <p className="hrms-admin-settings__alert" role="status">
            <i className="ri-information-line" aria-hidden style={{ marginRight: '0.35rem' }} />
            Read-only view. Sign in as Executive Director to change configuration.
          </p>
        ) : null}

        <div className="hrms-admin-settings__grid">
          <article className="hrms-ref-panel hrms-admin-settings__panel">
            <header className="hrms-ref-panel-head">
              <div className="hrms-admin-settings__panel-head">
                <span className="hrms-admin-settings__panel-icon" aria-hidden>
                  <i className="ri-calendar-event-line" />
                </span>
                <div className="hrms-admin-settings__panel-head-text">
                  <h2 className="hrms-ref-panel-title">Leave types</h2>
                  <p className="hrms-ref-panel-desc">Available leave categories for requests and balances</p>
                </div>
              </div>
            </header>
            <div className="hrms-ref-panel-body">
              <ul className="hrms-admin-settings__chips">
                {LEAVE_TYPES.map((t) => (
                  <li key={t.id}>
                    <span className="hrms-admin-settings__chip">
                      <i className={t.icon} aria-hidden />
                      {t.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="hrms-ref-panel hrms-admin-settings__panel">
            <header className="hrms-ref-panel-head">
              <div className="hrms-admin-settings__panel-head">
                <span className="hrms-admin-settings__panel-icon" aria-hidden>
                  <i className="ri-time-line" />
                </span>
                <div className="hrms-admin-settings__panel-head-text">
                  <h2 className="hrms-ref-panel-title">Office hours</h2>
                  <p className="hrms-ref-panel-desc">Attendance and timekeeping defaults</p>
                </div>
              </div>
            </header>
            <div className="hrms-ref-panel-body">
              <ul className="hrms-admin-settings__rows">
                {OFFICE_HOURS.map((row) => (
                  <li key={row.label} className="hrms-admin-settings__row">
                    <i className={`${row.icon} hrms-admin-settings__row-icon`} aria-hidden />
                    <div>
                      <span className="hrms-admin-settings__row-label">{row.label}</span>
                      <span className="hrms-admin-settings__row-value">{row.value}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="hrms-ref-panel hrms-admin-settings__panel">
            <header className="hrms-ref-panel-head">
              <div className="hrms-admin-settings__panel-head">
                <span className="hrms-admin-settings__panel-icon" aria-hidden>
                  <i className="ri-user-search-line" />
                </span>
                <div className="hrms-admin-settings__panel-head-text">
                  <h2 className="hrms-ref-panel-title">Recruitment pipeline</h2>
                  <p className="hrms-ref-panel-desc">Stages from public posting to onboarding</p>
                </div>
              </div>
            </header>
            <div className="hrms-ref-panel-body">
              <ol className="hrms-admin-settings__pipeline">
                {PIPELINE_STEPS.map((label, index) => (
                  <li key={label} className="hrms-admin-settings__pipeline-step">
                    <span className="hrms-admin-settings__pipeline-num" aria-hidden>
                      {index + 1}
                    </span>
                    <span className="hrms-admin-settings__pipeline-label">{label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </article>
        </div>

        <div className="hrms-admin-settings__footer-links">
          <Link to="/admin/rbac" className="hrms-admin-settings__quick-link">
            <i className="ri-shield-user-line" aria-hidden />
            Roles &amp; permissions
          </Link>
          <Link to="/leave" className="hrms-admin-settings__quick-link">
            <i className="ri-calendar-line" aria-hidden />
            Leave management
          </Link>
          <Link to="/jobs" className="hrms-admin-settings__quick-link">
            <i className="ri-briefcase-line" aria-hidden />
            Job postings
          </Link>
        </div>
      </div>
    </HrmsListShell>
  )
}
