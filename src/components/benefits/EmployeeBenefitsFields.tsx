import { useMemo } from 'react'
import {
  BENEFIT_TYPE_LABELS,
  type BenefitDefinition,
} from '../../data/benefitsData'
import { employmentTypeLabel } from '../../data/employmentStats'
import type { EmploymentType } from '../../types/hrms'

type Props = {
  employmentType: EmploymentType
  defaultBenefitIds: string[]
  selectedBenefitIds: string[]
  onChange: (ids: string[]) => void
  definitions: BenefitDefinition[]
  readOnly?: boolean
}

export function EmployeeBenefitsFields({
  employmentType,
  defaultBenefitIds,
  selectedBenefitIds,
  onChange,
  definitions,
  readOnly,
}: Props) {
  const activeDefs = useMemo(
    () => definitions.filter((d) => d.status === 'active'),
    [definitions],
  )

  const defaultSet = useMemo(() => new Set(defaultBenefitIds), [defaultBenefitIds])
  const standard = activeDefs.filter((d) => defaultSet.has(d.id))
  const optional = activeDefs.filter((d) => !defaultSet.has(d.id))

  function toggle(id: string, checked: boolean) {
    if (readOnly) return
    if (checked) {
      onChange([...new Set([...selectedBenefitIds, id])])
    } else {
      onChange(selectedBenefitIds.filter((x) => x !== id))
    }
  }

  return (
    <div className="hrms-emp-benefits">
      <p className="hrms-emp-benefits__intro">
        Standard package for <strong>{employmentTypeLabel(employmentType)}</strong> is applied
        automatically. Add optional benefits below.
      </p>

      <div className="hrms-emp-benefits__group">
        <h4 className="hrms-emp-benefits__group-title">
          <i className="ri-checkbox-circle-line" aria-hidden /> Standard (by employment type)
        </h4>
        {standard.length === 0 ? (
          <p className="hrms-emp-benefits__empty">No default benefits defined for this type.</p>
        ) : (
          <ul className="hrms-emp-benefits__list">
            {standard.map((def) => {
              const on = selectedBenefitIds.includes(def.id)
              return (
                <li key={def.id}>
                  <label className={`hrms-benefit-chip hrms-benefit-chip--standard${on ? ' is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={readOnly}
                      onChange={(e) => toggle(def.id, e.target.checked)}
                    />
                    <span className="hrms-benefit-chip__body">
                      <span className="hrms-benefit-chip__name">{def.name}</span>
                      <span className="hrms-benefit-chip__meta">
                        {BENEFIT_TYPE_LABELS[def.type]} · {def.employerContribution}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {optional.length > 0 ? (
        <div className="hrms-emp-benefits__group">
          <h4 className="hrms-emp-benefits__group-title">
            <i className="ri-add-circle-line" aria-hidden /> Additional benefits
          </h4>
          <ul className="hrms-emp-benefits__list">
            {optional.map((def) => {
              const on = selectedBenefitIds.includes(def.id)
              return (
                <li key={def.id}>
                  <label className={`hrms-benefit-chip hrms-benefit-chip--extra${on ? ' is-on' : ''}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={readOnly}
                      onChange={(e) => toggle(def.id, e.target.checked)}
                    />
                    <span className="hrms-benefit-chip__body">
                      <span className="hrms-benefit-chip__name">{def.name}</span>
                      <span className="hrms-benefit-chip__meta">
                        {BENEFIT_TYPE_LABELS[def.type]} · {def.description}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <p className="hrms-emp-benefits__count" aria-live="polite">
        {selectedBenefitIds.length} benefit{selectedBenefitIds.length === 1 ? '' : 's'} selected
      </p>
    </div>
  )
}
