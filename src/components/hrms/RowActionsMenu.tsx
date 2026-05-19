import { useEffect, useRef, useState } from 'react'

export type RowAction = {
  label: string
  onClick?: () => void
  href?: string
  danger?: boolean
  disabled?: boolean
}

export function RowActionsMenu({ id, actions }: { id: string; actions: RowAction[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  return (
    <div className="hrms-row-actions" ref={ref}>
      <button
        type="button"
        className="hrms-row-actions-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={`row-menu-${id}`}
        onClick={() => setOpen((v) => !v)}
      >
        Actions
        <i className="ri-arrow-down-s-line hrms-row-actions-btn__icon" aria-hidden />
      </button>
      {open ? (
        <ul id={`row-menu-${id}`} className="hrms-row-actions-menu" role="menu">
          {actions.map((a) => (
            <li key={a.label} role="none">
              {a.href ? (
                <a
                  href={a.href}
                  className={a.danger ? 'hrms-danger' : undefined}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  {a.label}
                </a>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  className={a.danger ? 'hrms-danger' : undefined}
                  disabled={a.disabled}
                  onClick={() => {
                    a.onClick?.()
                    setOpen(false)
                  }}
                >
                  {a.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
