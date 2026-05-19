import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { userRoleLabel } from '../auth/roleLabels'
import { IconLock, IconLogout, IconUserCircle } from '../components/hrms/icons'
import type { AuthUser } from '../auth/types'

export type ProfileSection = 'details' | 'password'

type SidebarUserMenuProps = {
  user: AuthUser
  initials: string
}

type MenuOptionProps = {
  icon: ReactNode
  label: string
  onClick: () => void
  variant?: 'default' | 'danger'
}

function MenuOption({ icon, label, onClick, variant = 'default' }: MenuOptionProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={`wf-user-menu-option${variant === 'danger' ? ' wf-user-menu-option--danger' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

export function SidebarUserMenu({ user, initials }: SidebarUserMenuProps) {
  const menuId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  const onProfilePage = location.pathname === '/profile'

  useEffect(() => {
    if (!open) return
    function onPointerDown(ev: MouseEvent) {
      if (!rootRef.current?.contains(ev.target as Node)) setOpen(false)
    }
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function choose(section: ProfileSection) {
    setOpen(false)
    navigate(`/profile?section=${section}`)
  }

  function onSignOut() {
    setOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="wf-user-menu" ref={rootRef}>
      <button
        type="button"
        className={`wf-user-chip wf-user-chip--trigger${open || onProfilePage ? ' is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="wf-user-chip-avatar" aria-hidden>
          {initials}
        </div>
        <div className="wf-user-chip-text">
          <div className="wf-user-chip-name">{user.displayName}</div>
          <div className="wf-user-chip-role">{userRoleLabel(user.role, user.designation)}</div>
        </div>
        <span className="wf-user-menu-chevron" aria-hidden />
      </button>

      {open ? (
        <div className="wf-user-menu-panel" id={menuId} role="menu" aria-label="Account options">
          <p className="wf-user-menu-panel__label">Account</p>
          <MenuOption
            icon={<IconUserCircle />}
            label="Update profile"
            onClick={() => choose('details')}
          />
          <MenuOption
            icon={<IconLock />}
            label="Change password"
            onClick={() => choose('password')}
          />
          <div className="wf-user-menu-divider" role="separator" />
          <MenuOption icon={<IconLogout />} label="Sign out" onClick={onSignOut} variant="danger" />
        </div>
      ) : null}
    </div>
  )
}
