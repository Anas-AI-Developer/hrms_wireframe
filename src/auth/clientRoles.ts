import type { RoleId } from './types'

/** Shared demo password for all wireframe accounts. */
export const DEMO_PASSWORD = '11223344'

/** Job titles that log in under the Employee role (ESS / self-service portal). */
export const EMPLOYEE_DESIGNATIONS = [
  { slug: 'private-secretary', title: 'Private Secretary' },
  { slug: 'aps', title: 'APS' },
  { slug: 'librarian', title: 'Librarian / Building Care Taker' },
  { slug: 'mto', title: 'Mechanical Transport Officer' },
  { slug: 'cashier', title: 'Cashier' },
  { slug: 'assistant', title: 'Assistant' },
  { slug: 'stenotypist', title: 'Stenotypist' },
  { slug: 'deo', title: 'Data Entry Operator' },
  { slug: 'receptionist', title: 'Receptionist' },
  { slug: 'hardware-technician', title: 'Hardware Technician' },
  { slug: 'maintenance-worker', title: 'General Maintenance Worker' },
  { slug: 'dispatch-rider', title: 'Dispatch Rider' },
  { slug: 'driver', title: 'Driver' },
  { slug: 'dmo', title: 'DMO' },
  { slug: 'electrician', title: 'Electrician' },
  { slug: 'naib-qasid', title: 'Naib Qasid' },
  { slug: 'chowkidar', title: 'Chowkidar' },
  { slug: 'sanitary-worker', title: 'Sanitary Workers' },
] as const

type LeadershipRole = Exclude<RoleId, 'employee'>

export const LEADERSHIP_ACCOUNTS: {
  role: LeadershipRole
  username: string
  displayName: string
  description: string
}[] = [
  {
    role: 'executive_director',
    username: 'executive.director',
    displayName: 'Demo — Executive Director',
    description: 'Top leadership — full system access.',
  },
  {
    role: 'director_general',
    username: 'director.general',
    displayName: 'Demo — Director General',
    description: 'Top leadership — full system access.',
  },
  {
    role: 'director',
    username: 'director',
    displayName: 'Demo — Director',
    description: 'Directorate-level HR and organization management.',
  },
  {
    role: 'deputy_director',
    username: 'deputy.director',
    displayName: 'Demo — Deputy Director',
    description: 'Directorate-level HR and organization management.',
  },
  {
    role: 'assistant_director',
    username: 'assistant.director',
    displayName: 'Demo — Assistant Director',
    description: 'HR dashboard, employees, leave, attendance, recruitment (not ESS /admin).',
  },
  {
    role: 'assistant_accounts_officer_accounts',
    username: 'aao.accounts',
    displayName: 'Demo — AAO (Accounts)',
    description: 'Accounts view — registers, master data, read-only HR lists.',
  },
  {
    role: 'assistant_accounts_officer_finance',
    username: 'aao.finance',
    displayName: 'Demo — AAO (Finance)',
    description: 'Finance view — registers, master data, read-only HR lists.',
  },
]
