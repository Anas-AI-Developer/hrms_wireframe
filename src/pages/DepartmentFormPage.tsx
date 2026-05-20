import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { useWireframeData } from '../data/WireframeDataContext'
import type { RecordStatus } from '../types/hrms'

export function DepartmentFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDepartment, addDepartment, updateDepartment } = useWireframeData()
  const existing = id ? getDepartment(id) : undefined
  const isEdit = Boolean(existing)

  const [name, setName] = useState(existing?.name ?? '')
  const [code, setCode] = useState(existing?.code ?? '')
  const [headName, setHeadName] = useState(existing?.headName ?? '')
  const [status, setStatus] = useState<RecordStatus>(existing?.status ?? 'active')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!name.trim() || !code.trim()) {
      setError('Name and code are required.')
      return
    }
    const input = {
      name,
      code,
      headName: headName.trim() || '—',
      status,
    }
    if (isEdit && id) {
      updateDepartment(id, input)
      navigate('/departments')
      return
    }
    addDepartment(input)
    navigate('/departments')
  }

  return (
    <HrmsListShell
      current={isEdit ? 'Edit department' : 'New department'}
      dashboardHref="/departments"
    >
      <article className="hrms-ref-panel" style={{ maxWidth: '40rem' }}>
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">{isEdit ? 'Edit department' : 'Create department'}</h2>
        </header>
        <div className="hrms-ref-panel-body">
          <form className="hrms-ref-form-grid" onSubmit={onSubmit}>
            {error ? <p className="hrms-ref-form-alert hrms-ref-form-alert--warn">{error}</p> : null}
            <label className="hrms-ref-field hrms-ref-field--full">
              <span className="hrms-ref-field-label">
                Name <span className="hrms-ref-required">*</span>
              </span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">
                Code <span className="hrms-ref-required">*</span>
              </span>
              <input value={code} onChange={(e) => setCode(e.target.value)} required />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as RecordStatus)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <label className="hrms-ref-field hrms-ref-field--full">
              <span className="hrms-ref-field-label">Head name</span>
              <input value={headName} onChange={(e) => setHeadName(e.target.value)} placeholder="—" />
            </label>
            <div className="hrms-ref-form-footer hrms-ref-field--full">
              <Link to="/departments" className="hrms-ref-btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                {isEdit ? 'Save changes' : 'Create department'}
              </button>
            </div>
          </form>
        </div>
      </article>
    </HrmsListShell>
  )
}
