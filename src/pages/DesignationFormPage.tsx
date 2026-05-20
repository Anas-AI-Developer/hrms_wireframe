import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { useWireframeData } from '../data/WireframeDataContext'
import type { RecordStatus } from '../types/hrms'

export function DesignationFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { departments, getDesignation, addDesignation, updateDesignation } = useWireframeData()
  const existing = id ? getDesignation(id) : undefined
  const isEdit = Boolean(existing)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [grade, setGrade] = useState(existing?.grade ?? '')
  const [departmentId, setDepartmentId] = useState(
    existing?.departmentId ?? departments[0]?.id ?? '',
  )
  const [status, setStatus] = useState<RecordStatus>(existing?.status ?? 'active')
  const [error, setError] = useState<string | null>(null)

  const activeDepartments = departments.filter((d) => d.status === 'active')

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!title.trim() || !grade.trim() || !departmentId) {
      setError('Title, grade, and centre are required.')
      return
    }
    const input = { title, grade, departmentId, status }
    if (isEdit && id) {
      updateDesignation(id, input)
      navigate('/designations')
      return
    }
    addDesignation(input)
    navigate('/designations')
  }

  return (
    <HrmsListShell
      current={isEdit ? 'Edit designation' : 'New designation'}
      dashboardHref="/designations"
    >
      <article className="hrms-ref-panel" style={{ maxWidth: '40rem' }}>
        <header className="hrms-ref-panel-head">
          <h2 className="hrms-ref-panel-title">{isEdit ? 'Edit designation' : 'Create designation'}</h2>
        </header>
        <div className="hrms-ref-panel-body">
          <form className="hrms-ref-form-grid" onSubmit={onSubmit}>
            {error ? <p className="hrms-ref-form-alert hrms-ref-form-alert--warn">{error}</p> : null}
            <label className="hrms-ref-field hrms-ref-field--full">
              <span className="hrms-ref-field-label">
                Title <span className="hrms-ref-required">*</span>
              </span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">
                Grade / BPS <span className="hrms-ref-required">*</span>
              </span>
              <input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="BPS 17"
                required
              />
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">
                Centre <span className="hrms-ref-required">*</span>
              </span>
              <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required>
                {activeDepartments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="hrms-ref-field">
              <span className="hrms-ref-field-label">Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value as RecordStatus)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="hrms-ref-form-footer hrms-ref-field--full">
              <Link to="/designations" className="hrms-ref-btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                {isEdit ? 'Save changes' : 'Create designation'}
              </button>
            </div>
          </form>
        </div>
      </article>
    </HrmsListShell>
  )
}
