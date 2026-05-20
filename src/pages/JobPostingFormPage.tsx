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
} from '../components/hrms/HrmsCompactForm'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { JOB_STATUS_LABELS, addJobPosting, getJobPosting, updateJobPosting } from '../data/jobPostingsStore'
import type { JobStatus } from '../data/recruitmentMock'
import { useWireframeData } from '../data/WireframeDataContext'
import { addDaysIso, WIREFRAME_TODAY } from '../utils/attendanceStats'

export function JobPostingFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { departments } = useWireframeData()
  const existing = id ? getJobPosting(id) : undefined
  const isEdit = Boolean(existing)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [code, setCode] = useState(existing?.code ?? '')
  const [department, setDepartment] = useState(existing?.department ?? '')
  const [bps, setBps] = useState(existing?.bps ?? '')
  const [vacancies, setVacancies] = useState(String(existing?.vacancies ?? 1))
  const [status, setStatus] = useState<JobStatus>(existing?.status ?? 'draft')
  const [closesAt, setClosesAt] = useState(existing?.closesAt ?? addDaysIso(WIREFRAME_TODAY, 30))
  const [portalVisible, setPortalVisible] = useState(existing?.portalVisible ?? false)
  const [error, setError] = useState<string | null>(null)

  function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!title.trim() || !department.trim() || !bps.trim() || !closesAt) {
      setError('Title, centre, BPS scale, and closing date are required.')
      return
    }
    const vac = Number.parseInt(vacancies, 10)
    if (!Number.isFinite(vac) || vac < 1) {
      setError('Vacancies must be at least 1.')
      return
    }

    const payload = {
      title,
      code: code.trim() || undefined,
      department,
      bps,
      vacancies: vac,
      status,
      closesAt,
      portalVisible: status === 'published' ? portalVisible : false,
    }

    if (isEdit && id) {
      updateJobPosting(id, payload)
      navigate('/jobs')
      return
    }
    addJobPosting(payload)
    navigate('/jobs')
  }

  const heading = isEdit ? 'Edit job posting' : 'New job posting'

  return (
    <HrmsListShell current={heading} dashboardHref="/jobs">
      <CompactFormPage>
        <CompactFormCard icon="ri-briefcase-line" title={heading}>
          <form onSubmit={onSubmit}>
            {error ? <CompactFormAlert>{error}</CompactFormAlert> : null}
            <CompactFormSection legend="Position details">
              <CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Job title <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-briefcase-line">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Deputy Director (Technical)"
                      required
                      autoFocus
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormGrid split>
                  <CompactFormField label="Posting code">
                    <CompactFormInputWrap icon="ri-hashtag">
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Auto-generated if blank"
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField
                    label={
                      <>
                        BPS scale <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-bar-chart-line">
                      <input
                        value={bps}
                        onChange={(e) => setBps(e.target.value)}
                        placeholder="e.g. 17"
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormField
                  full
                  label={
                    <>
                      Centre / department <CompactFormRequired />
                    </>
                  }
                >
                  <CompactFormInputWrap icon="ri-building-line">
                    <input
                      list="job-dept-options"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. NAVTTC HQs"
                      required
                    />
                  </CompactFormInputWrap>
                  <datalist id="job-dept-options">
                    {departments.map((d) => (
                      <option key={d.id} value={d.name} />
                    ))}
                  </datalist>
                </CompactFormField>
                <CompactFormGrid split>
                  <CompactFormField
                    label={
                      <>
                        Vacancies <CompactFormRequired />
                      </>
                    }
                  >
                    <CompactFormInputWrap icon="ri-group-line">
                      <input
                        type="number"
                        min={1}
                        value={vacancies}
                        onChange={(e) => setVacancies(e.target.value)}
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                  <CompactFormField label="Closing date">
                    <CompactFormInputWrap icon="ri-calendar-line">
                      <input
                        type="date"
                        value={closesAt}
                        onChange={(e) => setClosesAt(e.target.value)}
                        required
                      />
                    </CompactFormInputWrap>
                  </CompactFormField>
                </CompactFormGrid>
                <CompactFormField label="Status">
                  <CompactFormInputWrap icon="ri-flag-line">
                    <select
                      value={status}
                      onChange={(e) => {
                        const next = e.target.value as JobStatus
                        setStatus(next)
                        if (next === 'published') setPortalVisible(true)
                        if (next === 'draft') setPortalVisible(false)
                      }}
                    >
                      {(Object.keys(JOB_STATUS_LABELS) as JobStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {JOB_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </CompactFormInputWrap>
                </CompactFormField>
                {status === 'published' ? (
                  <CompactFormField full label="Public careers portal">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={portalVisible}
                        onChange={(e) => setPortalVisible(e.target.checked)}
                      />
                      Visible on public job portal (wireframe)
                    </label>
                  </CompactFormField>
                ) : null}
              </CompactFormGrid>
            </CompactFormSection>
            <CompactFormFooter>
              <Link to="/jobs" className="hrms-ref-btn-secondary">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                <i className={isEdit ? 'ri-save-line' : 'ri-add-line'} aria-hidden />
                {isEdit ? 'Save posting' : 'Create posting'}
              </button>
            </CompactFormFooter>
          </form>
        </CompactFormCard>
      </CompactFormPage>
    </HrmsListShell>
  )
}
