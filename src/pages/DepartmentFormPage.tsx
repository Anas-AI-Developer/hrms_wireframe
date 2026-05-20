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

  const heading = isEdit ? 'Edit department' : 'Create department'

  return (
    <HrmsListShell
      current={isEdit ? 'Edit department' : 'New department'}
      dashboardHref="/departments"
    >
      <CompactFormPage>
        <CompactFormCard icon="ri-building-4-line" title={heading}>
          <form onSubmit={onSubmit}>
            {error ? <CompactFormAlert>{error}</CompactFormAlert> : null}
            <CompactFormSection legend="Centre details">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Name <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-building-line">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Regional Centre Lahore"
                      required
                      autoFocus
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormGrid split>
                  <CompactFormField
                    label={
                      <>
                        Code <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-hashtag">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="RCL"
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Status">
                    <CompactFormStatus
                      name="department-status"
                      value={status}
                      onChange={setStatus}
                      options={[
                        { value: 'active', label: 'Active' },
                        { value: 'inactive', label: 'Inactive' },
                      ]}
                    />
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormField full label="Head name">
                  <CompactFormInputWrap icon="ri-user-line">
                    <input
                      value={headName}
                      onChange={(e) => setHeadName(e.target.value)}
                      placeholder="—"
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
              </CompactFormGrid>
            </CompactFormSection>
            <CompactFormFooter>
              <Link to="/departments" className="hrms-ref-btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                <i className={isEdit ? 'ri-save-line' : 'ri-add-line'} aria-hidden />
                {isEdit ? 'Save changes' : 'Create department'}
              </button>
            </CompactFormFooter>
          </form>
        </CompactFormCard>
      </CompactFormPage>
    </HrmsListShell>
  )
}
