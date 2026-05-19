export type PayrollRunStatus = 'draft' | 'processing' | 'posted' | 'locked'

export type PayrollRun = {
  id: string
  periodLabel: string
  month: string
  status: PayrollRunStatus
  employeeCount: number
  grossTotal: number
  netTotal: number
  runBy: string
  runAt: string
}

export type PayslipLine = {
  label: string
  amount: number
  type: 'earning' | 'deduction'
}

export type Payslip = {
  id: string
  employeeId: string
  runId: string
  periodLabel: string
  payDate: string
  basic: number
  lines: PayslipLine[]
  netPay: number
}

export const payrollRuns: PayrollRun[] = [
  {
    id: 'pr-2026-04',
    periodLabel: 'April 2026',
    month: '2026-04',
    status: 'posted',
    employeeCount: 248,
    grossTotal: 42_500_000,
    netTotal: 38_200_000,
    runBy: 'AAO Accounts',
    runAt: '2026-05-05',
  },
  {
    id: 'pr-2026-05',
    periodLabel: 'May 2026',
    month: '2026-05',
    status: 'draft',
    employeeCount: 251,
    grossTotal: 0,
    netTotal: 0,
    runBy: '—',
    runAt: '—',
  },
]

const demoLines: PayslipLine[] = [
  { label: 'Basic pay', amount: 185_000, type: 'earning' },
  { label: 'House rent', amount: 45_000, type: 'earning' },
  { label: 'Conveyance', amount: 12_000, type: 'earning' },
  { label: 'Income tax', amount: -18_500, type: 'deduction' },
  { label: 'GP fund', amount: -9_200, type: 'deduction' },
]

export const payslips: Payslip[] = [
  {
    id: 'ps-demo-1',
    employeeId: 'm-1',
    runId: 'pr-2026-04',
    periodLabel: 'April 2026',
    payDate: '2026-05-05',
    basic: 185_000,
    lines: demoLines,
    netPay: 214_300,
  },
]

export function getPayslipForEmployee(employeeId: string) {
  return payslips.find((p) => p.employeeId === employeeId) ?? payslips[0]
}

export function getPayrollRun(id: string) {
  return payrollRuns.find((r) => r.id === id)
}
