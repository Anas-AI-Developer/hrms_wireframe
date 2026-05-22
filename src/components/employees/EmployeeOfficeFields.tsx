import {
  CompactFormField,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormRequired,
} from '../hrms/HrmsCompactForm'
import {
  formatOfficeOptionLabel,
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
  /** Disable until a role is chosen (create flow). */
  disabledUntilRole?: boolean
}

export function EmployeeOfficeFields({
  value,
  onChange,
  error,
  disabledUntilRole,
}: Props) {
  const disabled = Boolean(disabledUntilRole)

  function setCategory(category: OfficeCategorySelection) {
    if (!category) {
      onChange({ category: '', officeId: '' })
      return
    }
    if (category === 'head_office') {
      onChange({ category, officeId: NAVTTC_HEAD_OFFICE_ID })
      return
    }
    const keepRegional =
      value.category === 'regional_office' && value.officeId !== NAVTTC_HEAD_OFFICE_ID
        ? value.officeId
        : (REGIONAL_OFFICE_MAPPING_ROWS[0]?.officeId ?? '')
    onChange({ category, officeId: keepRegional })
  }

  function setOfficeId(officeId: string) {
    if (!officeId) {
      onChange({ category: value.category, officeId: '' })
      return
    }
    const category = officeId === NAVTTC_HEAD_OFFICE_ID ? 'head_office' : 'regional_office'
    onChange({ category, officeId })
  }

  const headOptions = [HEAD_OFFICE_MAPPING]
  const locationOptions =
    value.category === 'head_office'
      ? headOptions
      : value.category === 'regional_office'
        ? REGIONAL_OFFICE_MAPPING_ROWS
        : []

  return (
    <div className="hrms-org-placement">
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
              value={value.category}
              onChange={(e) => setCategory(e.target.value as OfficeCategorySelection)}
              required={!disabled}
              disabled={disabled}
            >
              <option value="">Select office type…</option>
              <option value="head_office">{OFFICE_CATEGORY_LABELS.head_office}</option>
              <option value="regional_office">{OFFICE_CATEGORY_LABELS.regional_office}</option>
            </select>
          </CompactFormInputWrap>
        </CompactFormField>

        {value.category ? (
          <CompactFormField
            label={
              <>
                Work location <CompactFormRequired />
              </>
            }
          >
            <CompactFormInputWrap icon="ri-map-pin-2-line">
              <select
                value={value.officeId}
                onChange={(e) => setOfficeId(e.target.value)}
                required
                disabled={disabled}
              >
                <option value="">Select location…</option>
                {locationOptions.map((row) => (
                  <option key={row.officeId} value={row.officeId}>
                    {formatOfficeOptionLabel(row)}
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
