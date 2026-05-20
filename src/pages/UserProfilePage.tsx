import { type FormEvent, type ReactNode, type Ref, useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import type { ProfileSection } from '../layouts/SidebarUserMenu'
import { useAuth } from '../auth/AuthContext'
import { userRoleLabel } from '../auth/roleLabels'
import {
  CompactFormAlert,
  CompactFormCard,
  CompactFormField,
  CompactFormFooter,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormPage,
  CompactFormRequired,
  CompactFormSection,
} from '../components/hrms/HrmsCompactForm'
import { getEmployee } from '../data/mock'
import './pages.css'

function defaultEmail(username: string, employeeEmail?: string) {
  return employeeEmail ?? `${username}@navttc.demo`
}

function parseSection(raw: string | null): ProfileSection | null {
  if (raw === 'details' || raw === 'password') return raw
  return null
}

type ProfilePanelProps = {
  id: string
  title: string
  description?: string
  highlight?: boolean
  panelRef?: Ref<HTMLElement>
  children: ReactNode
}

function ProfileOverviewPanel({ id, title, highlight, panelRef, children }: ProfilePanelProps) {
  return (
    <section
      ref={panelRef}
      id={id}
      className={`hrms-ref-panel${highlight ? ' hrms-ref-panel--highlight' : ''}`}
    >
      <header className="hrms-ref-panel-head">
        <h2 className="hrms-ref-panel-title">{title}</h2>
      </header>
      <div className="hrms-ref-panel-body">{children}</div>
    </section>
  )
}

export function UserProfilePage() {
  const { user, actorEmployeeId, updateProfile, changePassword } = useAuth()
  const [searchParams] = useSearchParams()
  const activeSection = parseSection(searchParams.get('section'))
  const profileSectionRef = useRef<HTMLElement>(null)
  const passwordSectionRef = useRef<HTMLElement>(null)
  const roster = actorEmployeeId ? getEmployee(actorEmployeeId) : undefined

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName)
    setEmail(user.email ?? defaultEmail(user.username, roster?.email))
    setPhone(user.phone ?? roster?.phone ?? '')
  }, [user, roster?.email, roster?.phone])

  useEffect(() => {
    const target =
      activeSection === 'password'
        ? passwordSectionRef.current
        : activeSection === 'details'
          ? profileSectionRef.current
          : null
    if (!target) return
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const focusable = target.querySelector<HTMLElement>('input, button, select, textarea')
    focusable?.focus({ preventScroll: true })
  }, [activeSection])

  if (!user) return null

  const isEmployee = user.role === 'employee'
  const homeTo = isEmployee ? '/ess' : '/dashboard'
  const homeLabel = isEmployee ? 'Self-service' : 'Dashboard'
  const showProfileForm = !activeSection || activeSection === 'details'
  const showPasswordForm = !activeSection || activeSection === 'password'

  function onProfileSubmit(ev: FormEvent) {
    ev.preventDefault()
    setProfileMessage(null)
    setProfileError(null)
    const result = updateProfile({ displayName, email, phone })
    if (result.ok) {
      setProfileMessage('Your profile has been updated.')
    } else {
      setProfileError(result.message)
    }
  }

  function onPasswordSubmit(ev: FormEvent) {
    ev.preventDefault()
    setPasswordMessage(null)
    setPasswordError(null)
    const result = changePassword({ currentPassword, newPassword, confirmPassword })
    if (result.ok) {
      setPasswordMessage('Your password has been updated.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      setPasswordError(result.message)
    }
  }

  return (
    <div className="hrms-ref-page">
      <div className="hrms-breadcrumb-row">
        <ol className="hrms-breadcrumb">
          <li className="hrms-breadcrumb-item">
            <Link to={homeTo}>{homeLabel}</Link>
          </li>
          <li className="hrms-breadcrumb-item active" aria-current="page">
            My profile
          </li>
        </ol>
      </div>

      <div className="wf-page-head" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="wf-h1">My profile</h1>
          <p className="wf-lead" style={{ marginBottom: 0 }}>
            Manage your account details and sign-in password.
          </p>
        </div>
      </div>

      <div className="hrms-profile-layout">
        <ProfileOverviewPanel id="account-overview" title="Account overview">
          <dl className="hrms-profile-meta-grid">
            <div className="hrms-profile-meta-item">
              <dt>Username</dt>
              <dd>
                <code>{user.username}</code>
              </dd>
            </div>
            <div className="hrms-profile-meta-item">
              <dt>Role</dt>
              <dd>{userRoleLabel(user.role, user.designation)}</dd>
            </div>
            {roster ? (
              <>
                <div className="hrms-profile-meta-item">
                  <dt>Employee record</dt>
                  <dd>
                    {roster.firstName} {roster.lastName} · {roster.employeeNo}
                  </dd>
                </div>
                <div className="hrms-profile-meta-item">
                  <dt>Post</dt>
                  <dd>{roster.sanctionedPost ?? '—'}</dd>
                </div>
                <div className="hrms-profile-meta-item">
                  <dt>Location</dt>
                  <dd>{roster.location}</dd>
                </div>
                {actorEmployeeId ? (
                  <div className="hrms-profile-meta-item">
                    <dt>Roster</dt>
                    <dd>
                      <Link to={`/employees/${actorEmployeeId}`}>View employee profile</Link>
                    </dd>
                  </div>
                ) : null}
              </>
            ) : null}
          </dl>
        </ProfileOverviewPanel>

        {showProfileForm ? (
          <section
            ref={profileSectionRef}
            id="profile-details"
            className={activeSection === 'details' ? 'hrms-compact-form-page--highlight-wrap' : undefined}
          >
            <CompactFormPage>
              <CompactFormCard
                icon="ri-user-settings-line"
                title="Profile details"
                description="How your name and contact details appear in HRMS."
              >
                <form onSubmit={onProfileSubmit}>
                  {profileError ? <CompactFormAlert>{profileError}</CompactFormAlert> : null}
                  {profileMessage ? (
                    <CompactFormAlert variant="ok">{profileMessage}</CompactFormAlert>
                  ) : null}
                  <CompactFormSection legend="Contact">
                    <CompactFormGrid>
                      <CompactFormField
                        full
                        htmlFor="profile-displayName"
                        label={
                          <>
                            Display name <CompactFormRequired />
                          </>
                        }
                      >
                        <CompactFormInputWrap icon="ri-user-line">
                          <input
                            id="profile-displayName"
                            name="displayName"
                            value={displayName}
                            onChange={(ev) => setDisplayName(ev.target.value)}
                            autoComplete="name"
                            required
                          />
                        </CompactFormInputWrap>
                      </CompactFormField>
                      <CompactFormGrid split>
                        <CompactFormField
                          htmlFor="profile-email"
                          label={
                            <>
                              Email <CompactFormRequired />
                            </>
                          }
                        >
                          <CompactFormInputWrap icon="ri-mail-line">
                            <input
                              id="profile-email"
                              type="email"
                              name="email"
                              value={email}
                              onChange={(ev) => setEmail(ev.target.value)}
                              autoComplete="email"
                              required
                            />
                          </CompactFormInputWrap>
                        </CompactFormField>
                        <CompactFormField htmlFor="profile-phone" label="Phone">
                          <CompactFormInputWrap icon="ri-phone-line">
                            <input
                              id="profile-phone"
                              type="tel"
                              name="phone"
                              value={phone}
                              onChange={(ev) => setPhone(ev.target.value)}
                              autoComplete="tel"
                              placeholder="Optional"
                            />
                          </CompactFormInputWrap>
                        </CompactFormField>
                      </CompactFormGrid>
                    </CompactFormGrid>
                  </CompactFormSection>
                  <CompactFormFooter>
                    <button type="submit" className="hrms-btn-primary">
                      <i className="ri-save-line" aria-hidden />
                      Save profile
                    </button>
                  </CompactFormFooter>
                </form>
              </CompactFormCard>
            </CompactFormPage>
          </section>
        ) : null}

        {showPasswordForm ? (
          <section ref={passwordSectionRef} id="change-password">
            <CompactFormPage>
              <CompactFormCard
                icon="ri-lock-password-line"
                title="Change password"
                description="Use a strong password you do not use elsewhere."
              >
                <form onSubmit={onPasswordSubmit}>
                  {passwordError ? <CompactFormAlert>{passwordError}</CompactFormAlert> : null}
                  {passwordMessage ? (
                    <CompactFormAlert variant="ok">{passwordMessage}</CompactFormAlert>
                  ) : null}
                  <CompactFormSection legend="Credentials">
                    <CompactFormGrid>
                      <CompactFormField
                        full
                        htmlFor="password-current"
                        label={
                          <>
                            Current password <CompactFormRequired />
                          </>
                        }
                      >
                        <CompactFormInputWrap icon="ri-lock-line">
                          <input
                            id="password-current"
                            type="password"
                            name="currentPassword"
                            value={currentPassword}
                            onChange={(ev) => setCurrentPassword(ev.target.value)}
                            autoComplete="current-password"
                            required
                          />
                        </CompactFormInputWrap>
                      </CompactFormField>
                      <CompactFormGrid split>
                        <CompactFormField
                          htmlFor="password-new"
                          label={
                            <>
                              New password <CompactFormRequired />
                            </>
                          }
                        >
                          <CompactFormInputWrap icon="ri-key-line">
                            <input
                              id="password-new"
                              type="password"
                              name="newPassword"
                              value={newPassword}
                              onChange={(ev) => setNewPassword(ev.target.value)}
                              autoComplete="new-password"
                              minLength={8}
                              required
                            />
                          </CompactFormInputWrap>
                        </CompactFormField>
                        <CompactFormField
                          htmlFor="password-confirm"
                          label={
                            <>
                              Confirm new password <CompactFormRequired />
                            </>
                          }
                        >
                          <CompactFormInputWrap icon="ri-key-2-line">
                            <input
                              id="password-confirm"
                              type="password"
                              name="confirmPassword"
                              value={confirmPassword}
                              onChange={(ev) => setConfirmPassword(ev.target.value)}
                              autoComplete="new-password"
                              minLength={8}
                              required
                            />
                          </CompactFormInputWrap>
                        </CompactFormField>
                      </CompactFormGrid>
                    </CompactFormGrid>
                  </CompactFormSection>
                  <CompactFormFooter>
                    <button type="submit" className="hrms-btn-primary">
                      <i className="ri-shield-check-line" aria-hidden />
                      Update password
                    </button>
                  </CompactFormFooter>
                </form>
              </CompactFormCard>
            </CompactFormPage>
          </section>
        ) : null}
      </div>
    </div>
  )
}
