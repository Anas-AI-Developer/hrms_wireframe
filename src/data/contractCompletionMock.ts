import type { Employee } from '../types/hrms'
import { addDaysIso, WIREFRAME_TODAY } from '../utils/attendanceStats'
import { formatEmployeeDate } from '../utils/formatDate'
import { expectedEndDateFromMonths, resolveEmployeeDurationMonths } from '../utils/serviceDuration'
import { DASHBOARD_JOB_FILTERS, employmentLabelForEmployee } from './dashboardEmployment'

export type ContractCompletionRow = {
  id: string
  employeeId: string
  employeeNo: string
  name: string
  email: string
  centre: string
  jobType: string
  completionDate: string
  status: 'upcoming' | 'completed'
  daysLeft: number | null
}

const CONTRACT_TYPES = new Set(
  DASHBOARD_JOB_FILTERS.flatMap((f) => (f.id === 'permanent' ? [] : f.types)),
)

function daysUntil(endIso: string): number {
  const today = new Date(`${WIREFRAME_TODAY}T12:00:00`)
  const end = new Date(`${endIso}T12:00:00`)
  return Math.ceil((end.getTime() - today.getTime()) / 86400000)
}

function statusForEndDate(endIso: string): Pick<ContractCompletionRow, 'status' | 'daysLeft'> {
  if (endIso < WIREFRAME_TODAY) {
    return { status: 'completed', daysLeft: null }
  }
  return { status: 'upcoming', daysLeft: Math.max(0, daysUntil(endIso)) }
}

export type ContractStatusDisplay = {
  tone: 'upcoming' | 'completed'
  primary: string
  secondary: string
}

function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Ends today'
  if (days === 1) return '1 day remaining'
  return `${days} days remaining`
}

function formatDaysSince(endIso: string): string {
  const days = Math.max(0, -daysUntil(endIso))
  if (days === 0) return 'Ended today'
  if (days === 1) return 'Ended 1 day ago'
  return `Ended ${days} days ago`
}

/** Date-first status copy for the contract completion table. */
export function getContractStatusDisplay(row: ContractCompletionRow): ContractStatusDisplay {
  const endLabel = formatEmployeeDate(row.completionDate)
  if (row.status === 'completed') {
    return {
      tone: 'completed',
      primary: `Ended ${endLabel}`,
      secondary: formatDaysSince(row.completionDate),
    }
  }
  const days = row.daysLeft ?? 0
  return {
    tone: 'upcoming',
    primary: `Ends ${endLabel}`,
    secondary: formatDaysRemaining(days),
  }
}

export function buildContractCompletions(
  employees: Employee[],
  centreName: (departmentId: string) => string,
): ContractCompletionRow[] {
  const contractStaff = employees.filter((e) => CONTRACT_TYPES.has(e.employmentType))

  return contractStaff
    .map((e, i) => {
      const months = resolveEmployeeDurationMonths(e)
      const fromDuration =
        months != null && e.joinDate && e.joinDate !== '—'
          ? expectedEndDateFromMonths(e.joinDate, months)
          : null
      const completionDate =
        e.endDate && e.endDate !== '—'
          ? e.endDate
          : fromDuration ?? addDaysIso(WIREFRAME_TODAY, 15 + (i % 8) * 22 - (i % 3) * 40)
      const { status, daysLeft } = statusForEndDate(completionDate)
      return {
        id: `cc-${e.id}`,
        employeeId: e.id,
        employeeNo: e.employeeNo,
        name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        centre: centreName(e.departmentId),
        jobType: employmentLabelForEmployee(e),
        completionDate,
        status,
        daysLeft,
      }
    })
    .sort((a, b) => a.completionDate.localeCompare(b.completionDate))
}

export type EmployeeTrendPoint = {
  month: string
  permanent: number
  contract: number
  project: number
}

/** Demo trend — scaled from current roster for dashboard chart. */
export function buildEmployeeTrend(
  permanent: number,
  contract: number,
  project: number,
): EmployeeTrendPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, i) => {
    const factor = 0.88 + i * 0.025
    return {
      month,
      permanent: Math.max(1, Math.round(permanent * factor)),
      contract: Math.max(0, Math.round(contract * (0.85 + i * 0.04))),
      project: Math.max(0, Math.round(project * (0.9 + i * 0.03))),
    }
  })
}

/** @deprecated Use buildEmployeeTrend */
export const buildWorkforceTrend = buildEmployeeTrend

export type WorkforceTrendPoint = EmployeeTrendPoint
