import type { AttendanceLog } from './attendanceMock'
import { ATTENDANCE_POLICY, getAttendanceForEmployee } from './attendanceMock'
import type { EmployeeBenefit } from './benefitsMock'
import {
  buildEssAttendanceLogs,
  buildEssBenefits,
  buildEssLeaveRequests,
  buildEssPayslip,
  buildEssPerformanceGoals,
  buildEssTrainingEnrollments,
} from './essDemoData'
import { getWireframeStore } from './wireframeStore'
import type { LeaveRequest } from './leaveMock'
import { getLeaveBalance, type LeaveBalance } from './leaveMock'
import { getLeaveRequestsForEmployee } from './leaveStore'
import type { Payslip } from './payrollMock'
import { getPayslipForEmployee, payslips } from './payrollMock'
import type { PerformanceGoal } from './performanceMock'
import { appraisalCycles } from './performanceMock'
import { getPerformanceGoalsForEmployee } from './performanceStore'
import type { TrainingEnrollment } from './trainingMock'
import { trainingCatalog, trainingEnrollments } from './trainingMock'

/** Primary demo ESS account (Data Entry Operator login). */
export const ESS_PRIMARY_EMPLOYEE_ID = 'm-8'

export function getEssLeaveRequests(employeeId: string): LeaveRequest[] {
  const base = getLeaveRequestsForEmployee(employeeId)
  const demo = buildEssLeaveRequests(employeeId)
  const seen = new Set(base.map((r) => r.id))
  return [...base, ...demo.filter((r) => !seen.has(r.id))].sort(
    (a, b) => b.submittedAt.localeCompare(a.submittedAt),
  )
}

export function getEssAttendance(employeeId: string): AttendanceLog[] {
  const base = getAttendanceForEmployee(employeeId)
  const demo = buildEssAttendanceLogs(employeeId)
  const byDate = new Map<string, AttendanceLog>()
  for (const l of base) byDate.set(l.date, l)
  for (const l of demo) byDate.set(l.date, l)
  return [...byDate.values()].sort((a, b) => b.date.localeCompare(a.date))
}

export function getEssPayslip(employeeId: string): Payslip {
  const match = payslips.find((p) => p.employeeId === employeeId)
  if (match) return match
  const fallback = getPayslipForEmployee(employeeId)
  if (fallback.employeeId === employeeId) return fallback
  return buildEssPayslip(employeeId)
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
  const base = getPerformanceGoalsForEmployee(employeeId)
  if (base.length > 0) return base
  return buildEssPerformanceGoals(employeeId)
}

export function getEssTraining(employeeId: string): TrainingEnrollment[] {
  const base = trainingEnrollments.filter((e) => e.employeeId === employeeId)
  if (base.length > 0) return base
  return buildEssTrainingEnrollments(employeeId)
}

export function getEssBenefits(employeeId: string): EmployeeBenefit[] {
  const { benefitDefinitions, employeeBenefitEnrollments } = getWireframeStore()
  const fromStore = employeeBenefitEnrollments
    .filter((e) => e.employeeId === employeeId && e.status === 'active')
    .map((en) => {
      const def = benefitDefinitions.find((d) => d.id === en.benefitId)
      return {
        id: en.id,
        employeeId,
        planName: def?.name ?? 'Benefit',
        enrolledSince: en.enrolledSince,
        status: en.status,
      }
    })
  if (fromStore.length > 0) return fromStore
  return buildEssBenefits(employeeId)
}

export function getEssOpenCycle() {
  return appraisalCycles.find((c) => c.status === 'open') ?? appraisalCycles[0]
}

export { trainingCatalog, ATTENDANCE_POLICY }
