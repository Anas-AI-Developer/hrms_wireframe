import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import type { Permission } from '../../auth/types'

export type QuickAccessItem = {
  label: string
  to: string
  permission: Permission
  icon: React.ReactNode
  description?: string
}

type Props = {
  title?: string
  items: QuickAccessItem[]
}

export function QuickAccessGrid({ title = 'Quick access', items }: Props) {
  const { can } = useAuth()
  const visible = items.filter((i) => can(i.permission))
  if (visible.length === 0) return null

  return (
    <section className="hrms-dash-quick">
      <h2 className="hrms-dash-section-title">{title}</h2>
      <ul className="hrms-dash-quick-grid">
        {visible.map((item) => (
          <li key={item.to}>
            <Link to={item.to} className="hrms-dash-quick-card">
              <span className="hrms-dash-quick-card__icon" aria-hidden>
                {item.icon}
              </span>
              <span className="hrms-dash-quick-card__text">
                <span className="hrms-dash-quick-card__label">{item.label}</span>
                {item.description ? (
                  <span className="hrms-dash-quick-card__desc">{item.description}</span>
                ) : null}
              </span>
              <i className="ri-arrow-right-s-line hrms-dash-quick-card__arrow" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
