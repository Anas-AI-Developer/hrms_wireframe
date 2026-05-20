import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type Tone = 'primary' | 'success' | 'warning' | 'info' | 'secondary'

type Props = {
  label: string
  value: string | number
  subtext?: string
  footnote?: ReactNode
  icon: ReactNode
  tone?: Tone
  /** When true, card is display-only (no link, no hover lift). */
  static?: boolean
  /** Compact padding and typography for dashboard top row. */
  compact?: boolean
  to?: string
  linkLabel?: string
}

export function DashboardKpiCard({
  label,
  value,
  subtext,
  footnote,
  icon,
  tone = 'primary',
  static: isStatic = false,
  compact = false,
  to,
  linkLabel,
}: Props) {
  const showLink = !isStatic && to && linkLabel

  return (
    <article
      className={`hrms-kpi-card hrms-kpi-card--${tone}${isStatic ? ' hrms-kpi-card--static' : ''}${compact ? ' hrms-kpi-card--compact' : ''}`}
    >
      <div className="hrms-kpi-card__body">
        <div className="hrms-kpi-card__top">
          <div className="hrms-kpi-card__meta">
            <span className="hrms-kpi-card__label">{label}</span>
            <p className="hrms-kpi-card__value">{value}</p>
            {subtext ? <p className="hrms-kpi-card__sub">{subtext}</p> : null}
          </div>
          <span className={`hrms-kpi-card__avatar hrms-kpi-card__avatar--${tone}`} aria-hidden>
            {icon}
          </span>
        </div>
        {footnote ? <div className="hrms-kpi-card__foot">{footnote}</div> : null}
        {showLink ? (
          <Link to={to} className="hrms-kpi-card__link">
            {linkLabel} <i className="ri-arrow-right-s-line" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  )
}

