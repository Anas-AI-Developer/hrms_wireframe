import type { AttendanceLog } from './attendanceMock'
import { ATTENDANCE_POLICY, getAttendanceForEmployee } from './attendanceMock'
import type { EmployeeBenefit } from './benefitsMock'
import { employeeBenefits } from './benefitsMock'
import type { LeaveRequest } from './leaveMock'
import { getLeaveBalance, getLeaveRequestsForEmployee, type LeaveBalance } from './leaveMock'
import type { Payslip } from './payrollMock'
import { getPayslipForEmployee, payslips } from './payrollMock'
import type { PerformanceGoal } from './performanceMock'
import { appraisalCycles } from './performanceMock'
import { getPerformanceGoalsForEmployee } from './performanceStore'
import type { TrainingEnrollment } from './trainingMock'
import { trainingCatalog, trainingEnrollments } from './trainingMock'

/** Primary demo ESS account (Data Entry Operator login). */
export const ESS_PRIMARY_EMPLOYEE_ID = 'm-8'

const EXTRA_LEAVE: LeaveRequest[] = [
  {
    id: 'ess-lr-1',
    employeeId: ESS_PRIMARY_EMPLOYEE_ID,
    leaveType: 'casual',
    fromDate: '2026-05-10',
    toDate: '2026-05-11',
    days: 2,
    reason: 'Family function in hometown',
    status: 'approved',
    submittedAt: '2026-04-28',
    approverNote: 'Approved by Assistant Director',
  },
  {
    id: 'ess-lr-2',
    employeeId: ESS_PRIMARY_EMPLOYEE_ID,
    leaveType: 'sick',
    fromDate: '2026-05-18',
    toDate: '2026-05-18',
    days: 1,
    reason: 'Fever — medical certificate attached',
    status: 'pending',
    submittedAt: '2026-05-17',
  },
  {
    id: 'ess-lr-3',
    employeeId: ESS_PRIMARY_EMPLOYEE_ID,
    leaveType: 'annual',
    fromDate: '2026-06-02',
    toDate: '2026-06-06',
    days: 5,
    reason: 'Annual leave — summer break',
    status: 'pending',
    submittedAt: '2026-05-15',
  },
  {
    id: 'ess-lr-4',
    employeeId: ESS_PRIMARY_EMPLOYEE_ID,
    leaveType: 'emergency',
    fromDate: '2026-04-05',
    toDate: '2026-04-05',
    days: 1,
    reason: 'Emergency travel',
    status: 'rejected',
    submittedAt: '2026-04-04',
    approverNote: 'Please use casual leave for this period (demo)',
  },
]

const EXTRA_ATTENDANCE: AttendanceLog[] = [
  { id: 'ess-att-1', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-12', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8, status: 'present', source: 'import' },
  { id: 'ess-att-2', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-13', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8, status: 'present', source: 'import' },
  { id: 'ess-att-3', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-14', checkIn: '09:18', checkOut: '17:18', hoursWorked: 8, status: 'late', source: 'import', note: 'Traffic delay' },
  { id: 'ess-att-4', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-15', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8, status: 'present', source: 'manual' },
  { id: 'ess-att-5', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-16', checkIn: '—', checkOut: '—', hoursWorked: 0, status: 'on_leave', source: 'import', note: 'Approved casual leave' },
  { id: 'ess-att-6', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-17', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8, status: 'present', source: 'import' },
  { id: 'ess-att-7', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-18', checkIn: '09:05', checkOut: '17:05', hoursWorked: 8, status: 'present', source: 'import' },
  { id: 'ess-att-8', employeeId: ESS_PRIMARY_EMPLOYEE_ID, date: '2026-05-19', checkIn: '09:00', checkOut: '17:00', hoursWorked: 8, status: 'present', source: 'manual' },
]

const EXTRA_PAYSLIP: Payslip = {
  id: 'ps-m8-2026-04',
  employeeId: ESS_PRIMARY_EMPLOYEE_ID,
  runId: 'pr-2026-04',
  periodLabel: 'April 2026',
  payDate: '2026-05-05',
  basic: 78_000,
  lines: [
    { label: 'Basic pay', amount: 78_000, type: 'earning' },
    { label: 'Adhoc relief', amount: 8_500, type: 'earning' },
    { label: 'Conveyance', amount: 5_000, type: 'earning' },
    { label: 'Income tax', amount: -2_100, type: 'deduction' },
    { label: 'GP fund', amount: -3_900, type: 'deduction' },
  ],
  netPay: 85_500,
}

export function getEssLeaveRequests(employeeId: string): LeaveRequest[] {
  const base = getLeaveRequestsForEmployee(employeeId)
  const extra = EXTRA_LEAVE.filter((r) => r.employeeId === employeeId)
  const seen = new Set(base.map((r) => r.id))
  return [...base, ...extra.filter((r) => !seen.has(r.id))].sort(
    (a, b) => b.submittedAt.localeCompare(a.submittedAt),
  )
}

function essDemoAttendanceFor(employeeId: string): AttendanceLog[] {
  return EXTRA_ATTENDANCE.map((l) => ({
    ...l,
    id: `${l.id}-${employeeId}`,
    employeeId,
  }))
}

export function getEssAttendance(employeeId: string): AttendanceLog[] {
  const base = getAttendanceForEmployee(employeeId)
  const extra =
    employeeId === ESS_PRIMARY_EMPLOYEE_ID
      ? EXTRA_ATTENDANCE
      : essDemoAttendanceFor(employeeId)
  const byDate = new Map<string, AttendanceLog>()
  for (const l of base) byDate.set(l.date, l)
  for (const l of extra) byDate.set(l.date, l)
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
}

function essDemoPayslipFor(employeeId: string): Payslip {
  return {
    ...EXTRA_PAYSLIP,
    id: `ps-${employeeId}-2026-04`,
    employeeId,
  }
}

export function getEssPayslip(employeeId: string): Payslip {
  const match = payslips.find((p) => p.employeeId === employeeId)
  if (match) return match
  if (employeeId === ESS_PRIMARY_EMPLOYEE_ID) return EXTRA_PAYSLIP
  const fallback = getPayslipForEmployee(employeeId)
  if (fallback.employeeId === employeeId) return fallback
  return essDemoPayslipFor(employeeId)
}

export function getEssLeaveBalance(employeeId: string): LeaveBalance {
  return (
    getLeaveBalance(employeeId) ?? {
      employeeId,
      casual: 8,
      sick: 6,
      annual: 14,
      emergency: 3,
    }
  )
}

export function getEssGoals(employeeId: string): PerformanceGoal[] {
  return getPerformanceGoalsForEmployee(employeeId)
}

export function getEssTraining(employeeId: string): TrainingEnrollment[] {
  return trainingEnrollments.filter((e) => e.employeeId === employeeId)
}

export function getEssBenefits(employeeId: string): EmployeeBenefit[] {
  return employeeBenefits.filter((b) => b.employeeId === employeeId)
}

export function getEssOpenCycle() {
  return appraisalCycles.find((c) => c.status === 'open') ?? appraisalCycles[0]
}

export { trainingCatalog, ATTENDANCE_POLICY }
