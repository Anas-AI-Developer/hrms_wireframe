import { type FormEvent, useMemo, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import {
  BENEFIT_TYPE_LABELS,
  EMPLOYMENT_TYPES_FOR_BENEFITS,
  type BenefitType,
} from '../data/benefitsData'
import { employmentTypeLabel } from '../data/employmentStats'
import { useWireframeData } from '../data/WireframeDataContext'
import '../styles/benefits.css'

export function BenefitsPage() {
  const { can } = useAuth()
  const canManage = can('page:benefits:manage')
  const {
    benefitDefinitions,
    employmentTypeBenefitDefaults,
    addBenefitDefinition,
    setEmploymentTypeBenefitDefaults,
  } = useWireframeData()

  const [selectedType, setSelectedType] = useState(EMPLOYMENT_TYPES_FOR_BENEFITS[0])
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<BenefitType>('allowance')
  const [newContribution, setNewContribution] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const activeDefs = useMemo(
    () => benefitDefinitions.filter((d) => d.status === 'active'),
    [benefitDefinitions],
  )

  const selectedDefaults = useMemo(
    () => new Set(employmentTypeBenefitDefaults[selectedType] ?? []),
    [employmentTypeBenefitDefaults, selectedType],
  )

  function toggleDefault(benefitId: string, checked: boolean) {
    const current = employmentTypeBenefitDefaults[selectedType] ?? []
    const next = checked ? [...new Set([...current, benefitId])] : current.filter((id) => id !== benefitId)
    setEmploymentTypeBenefitDefaults(selectedType, next)
    setSavedMsg(`Defaults updated for ${employmentTypeLabel(selectedType)}.`)
    setTimeout(() => setSavedMsg(null), 2500)
  }

  function onAddBenefit(ev: FormEvent) {
    ev.preventDefault()
    if (!newName.trim() || !newContribution.trim()) return
    addBenefitDefinition({
      name: newName,
      type: newType,
      description: newDescription,
      employerContribution: newContribution,
      status: 'active',
    })
    setNewName('')
    setNewContribution('')
    setNewDescription('')
    setSavedMsg('Benefit added to catalog.')
    setTimeout(() => setSavedMsg(null), 2500)
  }

  return (
    <HrmsListShell current="Benefits">
      <header className="wf-page-head" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="wf-h1">Benefits</h1>
          <p className="wf-lead" style={{ marginBottom: 0 }}>
            Define the benefit catalog and default packages by employment type. New employees receive
            standard benefits automatically; HR can add extras on the employee form.
          </p>
        </div>
      </header>

      {savedMsg ? (
        <p className="hrms-ref-form-alert hrms-ref-form-alert--ok" style={{ marginBottom: '1rem' }}>
          {savedMsg}
        </p>
      ) : null}

      {canManage ? (
        <div className="hrms-benefits-page__grid">
          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Benefit catalog</h2>
              <p className="hrms-ref-panel-desc">Master list of allowances and entitlements</p>
            </header>
            <div className="hrms-ref-panel-body hrms-ref-panel-body--flush">
              <div className="hrms-data-table-wrap">
                <table className="hrms-data-table">
                  <thead>
                    <tr>
                      <th>Benefit</th>
                      <th>Type</th>
                      <th>Employer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefitDefinitions.map((p) => (
                      <tr key={p.id}>
                        <td className="font-medium">
                          {p.name}
                          {p.status === 'inactive' ? (
                            <span className="hrms-badge hrms-badge--inactive" style={{ marginLeft: '0.35rem' }}>
                              inactive
                            </span>
                          ) : null}
                        </td>
                        <td>{BENEFIT_TYPE_LABELS[p.type]}</td>
                        <td className="text-sm">{p.employerContribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form className="hrms-benefits-add-form hrms-ref-panel-body" onSubmit={onAddBenefit}>
                <h3 className="hrms-ref-panel-title" style={{ fontSize: '0.95rem' }}>
                  Add benefit
                </h3>
                <label className="hrms-ref-field">
                  <span className="hrms-ref-field-label">Name</span>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} required />
                </label>
                <label className="hrms-ref-field">
                  <span className="hrms-ref-field-label">Type</span>
                  <select value={newType} onChange={(e) => setNewType(e.target.value as BenefitType)}>
                    {(Object.keys(BENEFIT_TYPE_LABELS) as BenefitType[]).map((t) => (
                      <option key={t} value={t}>
                        {BENEFIT_TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="hrms-ref-field">
                  <span className="hrms-ref-field-label">Employer contribution</span>
                  <input
                    value={newContribution}
                    onChange={(e) => setNewContribution(e.target.value)}
                    placeholder="e.g. Fixed monthly"
                    required
                  />
                </label>
                <label className="hrms-ref-field">
                  <span className="hrms-ref-field-label">Description</span>
                  <input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Short policy note"
                  />
                </label>
                <button type="submit" className="hrms-btn-primary">
                  <i className="ri-add-line" aria-hidden /> Add to catalog
                </button>
              </form>
            </div>
          </article>

          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Default by employment type</h2>
              <p className="hrms-ref-panel-desc">
                Checked benefits auto-assign when HR creates an employee of that type
              </p>
            </header>
            <div className="hrms-ref-panel-body">
              <div className="hrms-benefits-defaults__toolbar" role="tablist">
                {EMPLOYMENT_TYPES_FOR_BENEFITS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="tab"
                    aria-selected={selectedType === t}
                    className={selectedType === t ? 'is-active' : undefined}
                    onClick={() => setSelectedType(t)}
                  >
                    {employmentTypeLabel(t)}
                  </button>
                ))}
              </div>
              <ul className="hrms-benefits-defaults__list">
                {activeDefs.map((def) => (
                  <li key={def.id}>
                    <label className="hrms-benefits-defaults__row">
                      <input
                        type="checkbox"
                        checked={selectedDefaults.has(def.id)}
                        onChange={(e) => toggleDefault(def.id, e.target.checked)}
                      />
                      <span className="hrms-benefits-defaults__row-body">
                        <span className="hrms-benefits-defaults__row-name">{def.name}</span>
                        <span className="hrms-benefits-defaults__row-meta">
                          {BENEFIT_TYPE_LABELS[def.type]} · {def.employerContribution}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <p className="hrms-list-footnote" style={{ marginTop: '1rem' }}>
                {selectedDefaults.size} benefit{selectedDefaults.size === 1 ? '' : 's'} in the standard
                package for {employmentTypeLabel(selectedType)}.
              </p>
            </div>
          </article>
        </div>
      ) : (
        <p className="wf-note">You have read-only access to benefits configuration.</p>
      )}
    </HrmsListShell>
  )
}
