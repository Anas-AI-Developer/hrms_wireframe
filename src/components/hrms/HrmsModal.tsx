import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function HrmsModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: Props) {
  useEffect(() => {
    if (!open) return
    function onKey(ev: KeyboardEvent) {
      if (ev.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="hrms-modal" role="presentation">
      <button type="button" className="hrms-modal__backdrop" onClick={onClose} aria-label="Close dialog" />
      <div
        className={`hrms-modal__dialog hrms-modal__dialog--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hrms-modal-title"
        aria-describedby={description ? 'hrms-modal-desc' : undefined}
      >
        <header className="hrms-modal__head">
          <div>
            <h2 id="hrms-modal-title" className="hrms-modal__title">
              {title}
            </h2>
            {description ? (
              <p id="hrms-modal-desc" className="hrms-modal__desc">
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className="hrms-modal__close" onClick={onClose} aria-label="Close">
            <i className="ri-close-line" aria-hidden />
          </button>
        </header>
        <div className="hrms-modal__body">{children}</div>
        {footer ? <footer className="hrms-modal__foot">{footer}</footer> : null}
      </div>
    </div>
  )
}
