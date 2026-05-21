/** Selectable appointment lengths (value = total months). */
export const APPOINTMENT_DURATION_PRESETS: { months: number; label: string }[] = [
  { months: 6, label: '6 months' },
  { months: 12, label: '1 year (12 months)' },
  { months: 18, label: '18 months' },
  { months: 24, label: '2 years (24 months)' },
  { months: 36, label: '3 years (36 months)' },
  { months: 48, label: '4 years (48 months)' },
  { months: 60, label: '5 years (60 months)' },
]

function parseIsoDate(iso: string): Date | null {
  if (!iso || iso === '—') return null
  const d = new Date(`${iso}T12:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatDurationMonths(months: number): string {
  const preset = APPOINTMENT_DURATION_PRESETS.find((o) => o.months === months)
  if (preset) return preset.label
  if (months > 0 && months % 12 === 0) {
    const years = months / 12
    return years === 1 ? '1 year' : `${years} years`
  }
  return months === 1 ? '1 month' : `${months} months`
}

/** Calendar end date = join date + duration in months. */
export function expectedEndDateFromMonths(joinDate: string, months: number): string | null {
  const join = parseIsoDate(joinDate)
  if (!join || months <= 0) return null
  const end = new Date(join)
  end.setMonth(end.getMonth() + months)
  return end.toISOString().slice(0, 10)
}

/** @deprecated Use expectedEndDateFromMonths */
export function expectedEndDateIso(joinDate: string, durationYears: number): string | null {
  return expectedEndDateFromMonths(joinDate, durationYears * 12)
}

/** Whole months between join and end (legacy rows with end date only). */
export function durationMonthsBetweenDates(joinDate: string, endDate: string): number | null {
  const join = parseIsoDate(joinDate)
  const end = parseIsoDate(endDate)
  if (!join || !end || end <= join) return null
  let months = (end.getFullYear() - join.getFullYear()) * 12 + (end.getMonth() - join.getMonth())
  if (end.getDate() < join.getDate()) months -= 1
  return Math.max(1, months)
}

export function resolveEmployeeDurationMonths(emp: {
  serviceDurationMonths?: number
  serviceDurationYears?: number
  joinDate: string
  endDate: string
}): number | null {
  if (emp.serviceDurationMonths != null && emp.serviceDurationMonths > 0) {
    return emp.serviceDurationMonths
  }
  if (emp.serviceDurationYears != null && emp.serviceDurationYears > 0) {
    return emp.serviceDurationYears * 12
  }
  if (emp.joinDate && emp.joinDate !== '—' && emp.endDate && emp.endDate !== '—') {
    return durationMonthsBetweenDates(emp.joinDate, emp.endDate)
  }
  return null
}

export function formatEmployeeDuration(emp: {
  serviceDurationMonths?: number
  serviceDurationYears?: number
  joinDate: string
  endDate: string
}): string {
  const months = resolveEmployeeDurationMonths(emp)
  if (months == null) return '—'
  return formatDurationMonths(months)
}

export function initialDurationMonthsValue(emp: {
  serviceDurationMonths?: number
  serviceDurationYears?: number
  joinDate: string
  endDate: string
}): string {
  const months = resolveEmployeeDurationMonths(emp)
  if (months == null) return ''
  const preset = APPOINTMENT_DURATION_PRESETS.some((o) => o.months === months)
  return preset ? String(months) : ''
}

export function isValidPresetDurationMonths(months: number): boolean {
  return APPOINTMENT_DURATION_PRESETS.some((o) => o.months === months)
}
