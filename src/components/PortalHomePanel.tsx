import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import type { PortalLink } from '../portals/portalConfig'
import './PortalHomePanel.css'

type Section = {
  title: string
  accent?: 'overview' | 'administration'
  links: PortalLink[]
}

type Props = {
  panelTitle: string
  panelSubtitle: string
  sections: Section[]
}

export function PortalHomePanel({ panelTitle, panelSubtitle, sections }: Props) {
  const { can } = useAuth()

  const visibleSections = sections
    .map((s) => ({
      ...s,
      links: s.links.filter((l) => can(l.permission)),
    }))
    .filter((s) => s.links.length > 0)

  if (visibleSections.length === 0) return null

  return (
    <div className="hrms-portal-panel">
      <header className="hrms-portal-panel__header">
        <h2 className="hrms-portal-panel__title">{panelTitle}</h2>
        <p className="hrms-portal-panel__subtitle">{panelSubtitle}</p>
      </header>
      <div className="hrms-portal-panel__body">
        {visibleSections.map((section) => (
          <div key={section.title} className="hrms-portal-panel__section">
            {visibleSections.length > 1 ? (
              <p
                className={`hrms-portal-panel__section-label hrms-portal-panel__section-label--${section.accent ?? 'administration'}`}
              >
                {section.title}
              </p>
            ) : null}
            <ul className="hrms-portal-links">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hrms-portal-link">
                    <span className="hrms-portal-link__label">{link.label}</span>
                    {link.hint ? (
                      <span className="hrms-portal-link__hint">{link.hint}</span>
                    ) : null}
                    <span className="hrms-portal-link__arrow" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
