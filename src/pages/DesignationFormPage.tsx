import { type FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  CompactFormAlert,
  CompactFormCard,
  CompactFormField,
  CompactFormFooter,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormPage,
  CompactFormRequired,
  CompactFormSection,
  CompactFormStatus,
} from '../components/hrms/HrmsCompactForm'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { useWireframeData } from '../data/WireframeDataContext'
import type { RecordStatus } from '../types/hrms'

export function DesignationFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getDesignation, addDesignation, updateDesignation } = useWireframeData()
  const existing = id ? getDesignation(id) : undefined
  const isEdit = Boolean(existing)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [grade, setGrade] = useState(existing?.grade ?? '')
  const [status, setStatus] = useState<RecordStatus>(existing?.status ?? 'active')
  const [error, setError] = useState<string | null>(null)

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!title.trim() || !grade.trim()) {
      setError('Title and grade are required.')
      return
    }
    const input = {
      title,
      grade,
      departmentId: existing?.departmentId ?? '',
      status,
    }
    if (isEdit && id) {
      updateDesignation(id, input)
      navigate('/designations')
      return
    }
    addDesignation(input)
    navigate('/designations')
  }

  const heading = isEdit ? 'Edit designation' : 'Create designation'
  const sub = isEdit
    ? 'Update the post title, pay scale, or availability for this designation.'
    : 'Add a post title and BPS grade. Designations are organization-wide and can be assigned to employees.'

  return (
    <HrmsListShell
      current={isEdit ? 'Edit designation' : 'New designation'}
      dashboardHref="/designations"
    >
      <CompactFormPage>
        <CompactFormCard icon="ri-briefcase-4-line" title={heading} description={sub}>
          <form onSubmit={onSubmit}>
            {error ? <CompactFormAlert>{error}</CompactFormAlert> : null}
            <CompactFormSection legend="Designation details">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Title <CompactFormRequired />
                    </>
                  }
                  hint="Official post name as used on orders and payroll."
                >
                  <CompactFormInputWrap icon="ri-text">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Deputy Director"
                      required
                      autoFocus
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormGrid split>
                  <CompactFormField
                    label={
                      <>
                        Grade / BPS <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-bar-chart-horizontal-line">
                      <input
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        placeholder="BPS 17"
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField
                    label="Status"
                    hint="Inactive posts are hidden from new assignments."
                  >
                    <CompactFormStatus
                      name="designation-status"
                      value={status}
                      onChange={setStatus}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </CompactFormField>
                </CompactFormGrid>
              </CompactFormGrid>
            </CompactFormSection>
            <CompactFormFooter>
              <Link to="/designations" className="hrms-ref-btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                <i className={isEdit ? 'ri-save-line' : 'ri-add-line'} aria-hidden />
                {isEdit ? 'Save changes' : 'Create designation'}
              </button>
            </CompactFormFooter>
          </form>
        </CompactFormCard>
      </CompactFormPage>
    </HrmsListShell>
  )
}
