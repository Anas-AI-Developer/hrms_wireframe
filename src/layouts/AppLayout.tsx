import { Fragment } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { userRoleLabel } from '../auth/roleLabels'
import {
  CONFIG_NAV_GROUP,
  ESS_NAV,
  HR_NAV_GROUPS,
  PLANNING_NAV_GROUP,
  type NavItemDef,
} from '../components/hrms/navConfig'
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
      { to: '/reports', label: 'Reports hub', permission: 'page:reports' },
      { to: '/reports/attendance', label: 'Attendance analytics', permission: 'page:reports:attendance' },
      { to: '/reports/payroll', label: 'Payroll register', permission: 'page:reports:payroll' },
      { to: '/reports/employees', label: 'Employee analytics', permission: 'page:reports:employees' },
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

  const isEmployee = user?.role === 'employee'
  const homeTo = isEmployee ? '/ess' : '/dashboard'

  const groups: NavGroup[] = isEmployee
    ? [{ label: 'Self-service', accent: 'overview', items: ESS_NAV.filter((i) => can(i.permission)) }]
    : [
        ...HR_NAV_GROUPS.map((g) => ({
          ...g,
          items: g.items.filter((i) => can(i.permission)),
        })),
        {
          ...PLANNING_NAV_GROUP,
          accent: 'default' as const,
          items: PLANNING_NAV_GROUP.items.filter((i) => can(i.permission)),
        },
        {
          ...CONFIG_NAV_GROUP,
          items: CONFIG_NAV_GROUP.items.filter((i) => can(i.permission)),
        },
      ].filter((g) => g.items.length > 0)

  function onLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="wf-shell hrms-ui-ref nvqf-sidebar-layout">
      <aside className="wf-sidebar app-sidebar nvqf-sidebar" id="sidebar" aria-label="Main navigation">
        <header className="main-sidebar-header sidebar-brand-header">
          <NavLink to={homeTo} className="header-logo sidebar-brand-header__link wf-brand-link">
            <div className="logo-area">
              <div className="logo-badge" aria-hidden>
                <img
                  src="/images/navttclogo.png"
                  alt=""
                  className="logo-badge__img"
                  width={40}
                  height={40}
                  loading="eager"
                  decoding="async"
                />
              </div>
              <div className="logo-name">HRMS</div>
              <div className="logo-sub">Human Resources Management System</div>
            </div>
          </NavLink>
        </header>

        <div className="main-sidebar nvqf-sidebar__body">
          <div id="sidebar-scroll" className="nvqf-sidebar__scroll">
            <nav className="main-menu-container nav nvqf-sidebar__nav">
              <ul className="main-menu">
                {groups.map((group) => (
                  <Fragment key={group.label}>
                    <li
                      className={`slide__category slide__category--accent-${group.accent ?? 'default'}`}
                    >
                      <span className="category-name">{group.label}</span>
                    </li>
                    {group.items.map((item) => (
                      <li key={item.to} className="slide">
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            isActive ? 'side-menu__item active' : 'side-menu__item'
                          }
                        >
                          {item.icon}
                          <span className="side-menu__label">{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </Fragment>
                ))}
              </ul>
            </nav>
          </div>

          {user ? (
            <footer className="sidebar-footer nvqf-sidebar-footer-row wf-sidebar-footer">
              <div className="wf-user-chip">
                <div className="wf-user-chip-avatar" aria-hidden>
                  {initials(user.displayName)}
                </div>
                <div className="wf-user-chip-text">
                  <div className="wf-user-chip-name">{user.displayName}</div>
                  <div className="wf-user-chip-role">
                    {userRoleLabel(user.role, user.designation)}
                  </div>
                </div>
              </div>
              <button type="button" className="wf-sidebar-logout" onClick={onLogout}>
                Sign out
              </button>
            </footer>
          ) : null}
        </div>
      </aside>

      <div className="wf-main main-content app-content">
        <main className="wf-content wf-ref-canvas hrms-ref-canvas">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
