import type { FormEvent, ReactNode } from 'react'

type CompactFormPageProps = {
  wide?: boolean
  children: ReactNode
}

export function CompactFormPage({ wide, children }: CompactFormPageProps) {
  return (
    <div className={`hrms-compact-form-page${wide ? ' hrms-compact-form-page--wide' : ''}`}>
      {children}
    </div>
  )
}

type CompactFormCardProps = {
  icon: string
  title: string
  description?: string
  children: ReactNode
}

export function CompactFormCard({ icon, title, description, children }: CompactFormCardProps) {
  return (
    <article className="hrms-compact-form-card">
      <header className="hrms-compact-form-card__hero">
        <span className="hrms-compact-form-card__icon" aria-hidden>
          <i className={icon} />
        </span>
        <div>
          <h2 className="hrms-compact-form-card__title">{title}</h2>
          {description ? <p className="hrms-compact-form-card__desc">{description}</p> : null}
        </div>
      </header>
      <div className="hrms-compact-form-card__body">{children}</div>
    </article>
  )
}

type CompactFormAlertProps = {
  variant?: 'warn' | 'ok'
  children: ReactNode
}

export function CompactFormAlert({ variant = 'warn', children }: CompactFormAlertProps) {
  const icon = variant === 'ok' ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'
  return (
    <p
      className={`hrms-compact-form-alert${variant === 'ok' ? ' hrms-compact-form-alert--ok' : ''}`}
      role="alert"
    >
      <i className={icon} aria-hidden />
      {children}
    </p>
  )
}

type CompactFormSectionProps = {
  legend: string
  children: ReactNode
}

export function CompactFormSection({ legend, children }: CompactFormSectionProps) {
  return (
    <fieldset className="hrms-compact-form-section">
      <legend className="hrms-compact-form-section__label">{legend}</legend>
      {children}
    </fieldset>
  )
}

type CompactFormGridProps = {
  split?: boolean
  children: ReactNode
}

export function CompactFormGrid({ split, children }: CompactFormGridProps) {
  return (
    <div className={`hrms-compact-form-grid${split ? ' hrms-compact-form-grid--split' : ''}`}>
      {children}
    </div>
  )
}

type CompactFormFieldProps = {
  label: ReactNode
  hint?: string
  full?: boolean
  htmlFor?: string
  children: ReactNode
}

export function CompactFormField({ label, hint, full, htmlFor, children }: CompactFormFieldProps) {
  const Tag = htmlFor ? 'label' : 'div'
  return (
    <Tag
      className={`hrms-compact-form-field${full ? ' hrms-compact-form-field--full' : ''}`}
      htmlFor={htmlFor}
    >
      <span className="hrms-compact-form-field__label">{label}</span>
      {children}
      {hint ? <p className="hrms-compact-form-field__hint">{hint}</p> : null}
    </Tag>
  )
}

type CompactFormInputWrapProps = {
  icon?: string
  children: ReactNode
}

export function CompactFormInputWrap({ icon, children }: CompactFormInputWrapProps) {
  return (
    <div
      className={`hrms-compact-form-input-wrap${icon ? '' : ' hrms-compact-form-input-wrap--plain'}`}
    >
      {icon ? <i className={icon} aria-hidden /> : null}
      {children}
    </div>
  )
}

type StatusOption<T extends string> = {
  value: T
  label: string
}

type CompactFormStatusProps<T extends string> = {
  name: string
  value: T
  onChange: (value: T) => void
  options: StatusOption<T>[]
  ariaLabel?: string
}

export function CompactFormStatus<T extends string>({
  name,
  value,
  onChange,
  options,
  ariaLabel = 'Status',
}: CompactFormStatusProps<T>) {
  return (
    <div className="hrms-compact-form-status" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => (
        <label key={opt.value} className="hrms-compact-form-status__option">
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          <span className="hrms-compact-form-status__dot" aria-hidden />
          {opt.label}
        </label>
      ))}
    </div>
  )
}

type CompactFormFooterProps = {
  children: ReactNode
}

export function CompactFormFooter({ children }: CompactFormFooterProps) {
  return <footer className="hrms-compact-form-footer">{children}</footer>
}

/** Form wrapper for modal dialogs (no card shell). */
type CompactFormModalProps = {
  id?: string
  onSubmit: (ev: FormEvent) => void
  children: ReactNode
}

export function CompactFormModal({ id, onSubmit, children }: CompactFormModalProps) {
  return (
    <form id={id} className="hrms-compact-form-modal" onSubmit={onSubmit}>
      {children}
    </form>
  )
}

export function CompactFormRequired() {
  return <span className="hrms-ref-required">*</span>
}

type CompactFormCalloutProps = {
  children: ReactNode
}

export function CompactFormCallout({ children }: CompactFormCalloutProps) {
  return (
    <p className="hrms-compact-form-callout" aria-live="polite">
      {children}
    </p>
  )
}
