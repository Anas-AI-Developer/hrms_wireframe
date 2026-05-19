import { Fragment } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { RouteScopeGuard } from '../auth/RouteScopeGuard'
import { useAuth } from '../auth/AuthContext'
import {
  CONFIG_NAV_GROUP,
  ESS_NAV,
  HR_NAV_GROUPS,
  PLANNING_NAV_GROUP,
  type NavGroupDef,
} from '../components/hrms/navConfig'
import { SidebarUserMenu } from './SidebarUserMenu'
import './AppLayout.css'

function initials(displayName: string): string {
  const parts = displayName.split(/\s+/).filter((part) => /[a-zA-Z]/.test(part))
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AppLayout() {
  const { user, can } = useAuth()

  const isEmployee = user?.role === 'employee'
  const homeTo = isEmployee ? '/ess' : '/dashboard'

  const groups: NavGroupDef[] = isEmployee
    ? [{ label: 'Self-service', accent: 'overview', items: ESS_NAV.filter((i) => can(i.permission)) }]
    : [
        ...HR_NAV_GROUPS.map((g) => ({
          ...g,
          items: g.items.filter((i) => can(i.permission)),
        })),
        {
          ...PLANNING_NAV_GROUP,
          items: PLANNING_NAV_GROUP.items.filter((i) => can(i.permission)),
        },
        {
          ...CONFIG_NAV_GROUP,
          items: CONFIG_NAV_GROUP.items.filter((i) => can(i.permission)),
        },
      ].filter((g) => g.items.length > 0)

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
              <SidebarUserMenu user={user} initials={initials(user.displayName)} />
            </footer>
          ) : null}
        </div>
      </aside>

      <div className="wf-main main-content app-content">
        <main className="wf-content wf-ref-canvas hrms-ref-canvas">
          <RouteScopeGuard>
            <Outlet />
          </RouteScopeGuard>
        </main>
      </div>
    </div>
  )
}
