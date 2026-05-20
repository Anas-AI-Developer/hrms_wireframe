export const EMPLOYEE_REQUEST_TYPES = [
  { id: 'marriage', label: 'Marriage / Nikah' },
  { id: 'hajj', label: 'Hajj / Umrah' },
  { id: 'bereavement', label: 'Bereavement / Condolence' },
  { id: 'child_birth', label: 'Child birth / Maternity / Paternity' },
  { id: 'education', label: 'Education / Exam leave' },
  { id: 'medical', label: 'Medical certificate / fitness' },
  { id: 'duty_travel', label: 'Duty travel / official visit' },
  { id: 'salary_certificate', label: 'Salary / service certificate' },
  { id: 'id_card', label: 'ID card / access card' },
  { id: 'equipment', label: 'Equipment / repair' },
  { id: 'transfer', label: 'Transfer / posting preference' },
  { id: 'general', label: 'General administrative' },
  { id: 'other', label: 'Other (specify in details)' },
] as const

export type EmployeeRequestTypeId = (typeof EMPLOYEE_REQUEST_TYPES)[number]['id']

const TYPE_LABEL_MAP = Object.fromEntries(
  EMPLOYEE_REQUEST_TYPES.map((t) => [t.id, t.label]),
) as Record<EmployeeRequestTypeId, string>

export function employeeRequestTypeLabel(typeId: string): string {
  return TYPE_LABEL_MAP[typeId as EmployeeRequestTypeId] ?? typeId
}

export function defaultSubjectForRequestType(typeId: EmployeeRequestTypeId): string {
  return employeeRequestTypeLabel(typeId)
}
