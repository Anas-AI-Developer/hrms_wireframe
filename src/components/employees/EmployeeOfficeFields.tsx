import { useMemo } from 'react'
import {
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormRequired,
} from '../hrms/HrmsCompactForm'
import {
  formatOfficePlacement,
  HEAD_OFFICE_MAPPING,
  NAVTTC_HEAD_OFFICE_ID,
  OFFICE_CATEGORY_LABELS,
  REGIONAL_OFFICE_MAPPING_ROWS,
  type EmployeeOfficePlacement,
  type OfficeCategorySelection,
} from '../../data/navttcOfficeMapping'

type Props = {
  value: EmployeeOfficePlacement
  onChange: (next: EmployeeOfficePlacement) => void
  error?: string | null
  /** When true, office is fixed to Head Office (HQ leadership roles). */
  lockHeadOffice?: boolean
  /** Disable office fields until a role is chosen (create flow). */
  disabledUntilRole?: boolean
}

export function EmployeeOfficeFields({
  value,
  onChange,
  error,
  lockHeadOffice,
  disabledUntilRole,
}: Props) {
  const pathPreview = useMemo(() => formatOfficePlacement(value), [value])
  const fieldsDisabled = disabledUntilRole && !lockHeadOffice

  function setCategory(category: OfficeCategorySelection) {
    if (!category) {
      onChange({ category: '', officeId: '' })
      return
    }
    if (category === 'head_office') {
      onChange({ category, officeId: NAVTTC_HEAD_OFFICE_ID })
      return
    }
    const firstRegional = REGIONAL_OFFICE_MAPPING_ROWS[0]
    onChange({
      category,
      officeId:
        value.category === 'regional_office' && value.officeId !== NAVTTC_HEAD_OFFICE_ID
          ? value.officeId
          : (firstRegional?.officeId ?? ''),
    })
  }

  function setRegionalOfficeId(officeId: string) {
    onChange({ category: 'regional_office', officeId })
  }

  const selectValue = lockHeadOffice ? 'head_office' : value.category

  return (
    <div className="hrms-org-placement">
      {pathPreview ? (
        <p className="hrms-org-placement__path" aria-live="polite">
          <i className="ri-map-pin-line" aria-hidden />
          {pathPreview}
        </p>
      ) : null}

      {error ? (
        <p className="hrms-org-placement__error" role="alert">
          {error}
        </p>
      ) : null}

      <CompactFormGrid>
        <CompactFormField
          label={
            <>
              Office type <CompactFormRequired />
            </>
          }
        >
          <CompactFormInputWrap icon="ri-building-2-line">
            <select
              value={selectValue}
              onChange={(e) => setCategory(e.target.value as OfficeCategorySelection)}
              required={!fieldsDisabled}
              disabled={lockHeadOffice || fieldsDisabled}
            >
              {!lockHeadOffice ? <option value="">— Select office type —</option> : null}
              <option value="head_office">{OFFICE_CATEGORY_LABELS.head_office}</option>
              <option value="regional_office">{OFFICE_CATEGORY_LABELS.regional_office}</option>
            </select>
          </CompactFormInputWrap>
        </CompactFormField>

        {value.category === 'head_office' && value.officeId ? (
          <CompactFormField label="Head office">
            <CompactFormInputWrap icon="ri-government-line">
              <input
                readOnly
                value={`${HEAD_OFFICE_MAPPING.name} (${HEAD_OFFICE_MAPPING.code}) · ${HEAD_OFFICE_MAPPING.city}`}
              />
            </CompactFormInputWrap>
          </CompactFormField>
        ) : null}

        {value.category === 'regional_office' ? (
          <CompactFormField
            label={
              <>
                Regional office <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon="ri-map-pin-2-line">
              <select
                value={value.officeId}
                onChange={(e) => setRegionalOfficeId(e.target.value)}
                required
                disabled={fieldsDisabled}
              >
                <option value="">Select regional office…</option>
                {REGIONAL_OFFICE_MAPPING_ROWS.map((row) => (
                  <option key={row.officeId} value={row.officeId}>
                    {row.name} ({row.code}) — {row.city}
                  </option>
                ))}
              </select>
            </CompactFormInputWrap>
          </CompactFormField>
        ) : null}
      </CompactFormGrid>
    </div>
  )
}
