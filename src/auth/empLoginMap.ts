/**
 * Maps each `emp.<slug>` demo login to a roster employee id (wireframe dummyDataset).
 */
export const EMP_LOGIN_EMPLOYEE_ID: Record<string, string> = {
  'private-secretary': 'm-6',
  aps: 'm-25',
  librarian: 'm-26',
  mto: 'm-27',
  cashier: 'm-22',
  assistant: 'm-28',
  stenotypist: 'm-11',
  deo: 'm-8',
  receptionist: 'm-20',
  'hardware-technician': 'm-24',
  'maintenance-worker': 'm-29',
  'dispatch-rider': 'm-23',
  driver: 'm-14',
  dmo: 'm-21',
  electrician: 'm-30',
  'naib-qasid': 'm-31',
  chowkidar: 'm-32',
  'sanitary-worker': 'm-33',
}

export function employeeIdForEmpUsername(username: string): string | undefined {
  const normalized = username.trim().toLowerCase()
  if (!normalized.startsWith('emp.')) return undefined
  return EMP_LOGIN_EMPLOYEE_ID[normalized.slice(4)]
}
