import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { userRoleLabel } from '../auth/roleLabels'
import type { Permission } from '../auth/types'
import './AppLayout.css'

type NavItem = { to: string; label: string; permission: Permission }

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', permission: 'page:dashboard' },
      { to: '/ess', label: 'Self-service', permission: 'employee.view_self' },
    ],
  },
  {
    label: 'Organisation',
    items: [
      { to: '/employees', label: 'Employees', permission: 'page:employees' },
      { to: '/departments', label: 'Centres & sections', permission: 'page:departments' },
      { to: '/designations', label: 'Designations', permission: 'page:designations' },
    ],
  },
  {
    label: 'Time & attendance',
    items: [
      { to: '/attendance', label: 'Attendance', permission: 'page:attendance' },
      { to: '/leave', label: 'Leave', permission: 'page:leave' },
      { to: '/leave/approvals', label: 'Leave approvals', permission: 'page:leave:approvals' },
    ],
  },
  {
    label: 'HR operations',
    items: [
      { to: '/recruitment', label: 'Recruitment', permission: 'page:recruitment' },
      { to: '/onboarding', label: 'Onboarding', permission: 'page:onboarding' },
      { to: '/performance', label: 'Performance', permission: 'page:performance' },
      { to: '/training', label: 'Training', permission: 'page:training' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { to: '/payroll', label: 'Payroll', permission: 'page:payroll' },
      { to: '/benefits', label: 'Benefits', permission: 'page:benefits' },
      { to: '/compliance', label: 'Compliance', permission: 'page:compliance' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: '/reports', label: 'Reports', permission: 'page:reports' },
      { to: '/proposal', label: 'Proposed flows', permission: 'page:proposal' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/admin/settings', label: 'System settings', permission: 'page:admin_settings' },
      { to: '/admin/rbac', label: 'Roles & permissions', permission: 'page:rbac' },
    ],
  },
  {
    label: 'Planning & reference',
    items: [
      { to: '/roadmap', label: 'Delivery phases', permission: 'page:roadmap' },
      { to: '/modules', label: 'Sprint modules', permission: 'page:modules' },
      { to: '/organogram', label: 'HQ organogram', permission: 'page:organogram' },
      { to: '/master-data', label: 'Client workbook', permission: 'page:master_data' },
    ],
  },
]

export function AppLayout() {
  const { user, logout, can } = useAuth()
  const navigate = useNavigate()

  const filteredGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => can(item.permission)),
    }))
    .filter((g) => g.items.length > 0)

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="wf-shell hrms-ui-ref">
      <aside className="wf-sidebar" aria-label="Main navigation">
        <div className="wf-brand">
          <span className="wf-brand-mark" aria-hidden />
          <div>
            <div className="wf-brand-title">HRMS</div>
            <div className="wf-brand-sub">Wireframe</div>
          </div>
        </div>
        <nav className="wf-nav">
          {filteredGroups.map((group) => (
            <div key={group.label} className="wf-nav-group">
              <div className="wf-nav-group-label">{group.label}</div>
              <ul>
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        isActive ? 'wf-nav-link wf-nav-link--active' : 'wf-nav-link'
                      }
                      end={item.to === '/dashboard'}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="wf-main">
        <header className="wf-topbar">
          <div className="wf-topbar-inner">
            <p className="wf-wireframe-strip">
              Mock data · session only. Colours match Filament / HRMS reference (
              <code>#4B62BE</code> / <code>#2F4798</code>).
            </p>
            {user ? (
              <div className="wf-userbar">
                <div className="wf-user-meta">
                  <span className="wf-user-name">{user.displayName}</span>
                  <span className="wf-user-role">
                    {userRoleLabel(user.role, user.designation)}
                  </span>
                </div>
                <button type="button" className="wf-btn-logout" onClick={onLogout}>
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </header>
        <main className="wf-content wf-ref-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
