import type { AttendanceLog } from './attendanceMock'
import type { EmployeeBenefit } from './benefitsMock'
import type { EmployeeRequest } from './employeeRequestsStore'
import type { LeaveRequest, LeaveTypeId } from './leaveMock'
import type { Payslip } from './payrollMock'
import type { PerformanceGoal } from './performanceMock'
import { getEmployee } from './mock'
import type { TrainingEnrollment } from './trainingMock'
import { addDaysIso, WIREFRAME_TODAY } from '../utils/attendanceStats'

function seedOffset(employeeId: string, salt = 0): number {
  let h = salt
  for (const ch of employeeId) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return h % 97
}

const LEAVE_TYPES: LeaveTypeId[] = ['casual', 'sick', 'annual', 'emergency']

export function buildEssLeaveRequests(employeeId: string): LeaveRequest[] {
  const n = seedOffset(employeeId, 1)
  const emp = getEmployee(employeeId)
  const post = emp?.sanctionedPost ?? 'staff'
  return [
    {
      id: `ess-lr-${employeeId}-1`,
      employeeId,
      leaveType: LEAVE_TYPES[n % 4]!,
      fromDate: '2026-05-10',
      toDate: '2026-05-11',
      days: 2,
      reason: `Family commitment — ${post}`,
      status: 'approved',
      submittedAt: '2026-04-28',
      approverNote: 'Approved by Assistant Director (demo)',
    },
    {
      id: `ess-lr-${employeeId}-2`,
      employeeId,
      leaveType: 'sick',
      fromDate: '2026-05-18',
      toDate: '2026-05-18',
      days: 1,
      reason: 'Medical leave — fever',
      status: 'pending',
      submittedAt: '2026-05-17',
    },
    {
      id: `ess-lr-${employeeId}-3`,
      employeeId,
      leaveType: 'annual',
      fromDate: '2026-06-02',
      toDate: '2026-06-06',
      days: 5,
      reason: 'Annual leave — planned break',
      status: 'pending',
      submittedAt: '2026-05-15',
    },
    {
      id: `ess-lr-${employeeId}-4`,
      employeeId,
      leaveType: 'emergency',
      fromDate: '2026-04-05',
      toDate: '2026-04-05',
      days: 1,
      reason: 'Emergency travel',
      status: n % 3 === 0 ? 'rejected' : 'approved',
      submittedAt: '2026-04-04',
      ...(n % 3 === 0 ? { approverNote: 'Use casual leave for this period (demo)' } : {}),
    },
  ]
}

export function buildEssAttendanceLogs(employeeId: string): AttendanceLog[] {
  const dates = [12, 13, 14, 15, 16, 17, 18, 19].map((d) =>
    addDaysIso(WIREFRAME_TODAY, d - 19),
  )
  const statuses: AttendanceLog['status'][] = [
    'present',
    'present',
    'late',
    'present',
    'on_leave',
    'present',
    'present',
    'present',
  ]
  return dates.map((date, i) => {
    const status = statuses[i]!
    const onLeave = status === 'on_leave' || status === 'absent'
    const late = status === 'late'
    return {
      id: `ess-att-${employeeId}-${date}`,
      employeeId,
      date,
      checkIn: onLeave ? '—' : late ? '09:22' : '09:00',
      checkOut: onLeave ? '—' : late ? '17:22' : '17:00',
      hoursWorked: onLeave ? 0 : 8,
      status,
      source: i % 2 === 0 ? 'import' : 'manual',
      ...(late ? { note: 'Traffic delay (demo)' } : {}),
      ...(onLeave && i === 4 ? { note: 'Approved leave' } : {}),
    }
  })
}

export function buildEssPayslip(employeeId: string): Payslip {
  const n = seedOffset(employeeId, 2)
  const basic = 45_000 + (n % 12) * 2_500
  const conveyance = 4_000 + (n % 5) * 500
  const relief = 6_000 + (n % 4) * 1_000
  const tax = -(1_500 + (n % 6) * 200)
  const gp = -(2_500 + (n % 4) * 300)
  const lines = [
    { label: 'Basic pay', amount: basic, type: 'earning' as const },
    { label: 'Adhoc relief', amount: relief, type: 'earning' as const },
    { label: 'Conveyance', amount: conveyance, type: 'earning' as const },
    { label: 'Income tax', amount: tax, type: 'deduction' as const },
    { label: 'GP fund', amount: gp, type: 'deduction' as const },
  ]
  const netPay = lines.reduce((sum, l) => sum + l.amount, 0)
  return {
    id: `ps-${employeeId}-2026-04`,
    employeeId,
    runId: 'pr-2026-04',
    periodLabel: 'April 2026',
    payDate: '2026-05-05',
    basic,
    lines,
    netPay,
  }
}

export function buildEssEmployeeRequests(employeeId: string): EmployeeRequest[] {
  const emp = getEmployee(employeeId)
  const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'
  return [
    {
      id: `ess-er-${employeeId}-1`,
      employeeId,
      requestType: 'salary_certificate',
      subject: 'Salary / service certificate',
      details: `Request salary certificate for bank account update — ${name}.`,
      fromDate: '2026-05-01',
      toDate: '2026-05-31',
      status: 'approved',
      submittedAt: '2026-05-02',
      decidedAt: '2026-05-04',
      hrNote: 'Certificate issued by HR (demo).',
    },
    {
      id: `ess-er-${employeeId}-2`,
      employeeId,
      requestType: 'marriage',
      subject: 'Marriage / Nikah',
      details: 'Request leave and administrative support for marriage ceremony (family event).',
      fromDate: '2026-05-20',
      toDate: '2026-06-03',
      status: 'submitted',
      submittedAt: '2026-05-16',
    },
    {
      id: `ess-er-${employeeId}-3`,
      employeeId,
      requestType: 'id_card',
      subject: 'ID card / access card',
      details: 'Lost access card — request reprint for building entry.',
      fromDate: WIREFRAME_TODAY,
      toDate: WIREFRAME_TODAY,
      status: 'submitted',
      submittedAt: '2026-05-18',
    },
  ]
}

export function buildEssTrainingEnrollments(employeeId: string): TrainingEnrollment[] {
  return [
    {
      id: `ess-te-${employeeId}-1`,
      employeeId,
      courseId: 'tr-3',
      courseTitle: 'Occupational Safety',
      provider: 'In-house',
      durationDays: 1,
      status: 'approved',
      nominatedAt: '2026-04-15',
      scheduledStart: '2026-05-22',
      scheduledEnd: '2026-05-22',
    },
    {
      id: `ess-te-${employeeId}-2`,
      employeeId,
      courseId: 'tr-4',
      courseTitle: 'Records management & filing',
      provider: 'NAVTTC Academy',
      durationDays: 2,
      status: 'nominated',
      nominatedAt: '2026-05-01',
    },
  ]
}

export function buildEssPerformanceGoals(employeeId: string): PerformanceGoal[] {
  const emp = getEmployee(employeeId)
  const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee'
  const post = emp?.sanctionedPost ?? 'assigned duties'
  return [
    {
      id: `ess-pg-${employeeId}-1`,
      employeeId,
      employeeName: name,
      goalTitle: 'Timely completion of daily tasks',
      target: '95% on-time delivery',
      selfRating: '4/5',
      cycleId: 'ap-2026',
    },
    {
      id: `ess-pg-${employeeId}-2`,
      employeeId,
      employeeName: name,
      goalTitle: `Role excellence — ${post}`,
      target: 'Meet KPIs for Q2 2026',
      cycleId: 'ap-2026',
    },
  ]
}

export function buildEssBenefits(employeeId: string): EmployeeBenefit[] {
  return [
    {
      id: `ess-ben-${employeeId}-1`,
      employeeId,
      planName: 'Medical reimbursement',
      enrolledSince: '2024-07-01',
      status: 'active',
    },
    {
      id: `ess-ben-${employeeId}-2`,
      employeeId,
      planName: 'Conveyance allowance',
      enrolledSince: '2024-07-01',
      status: 'active',
    },
    {
      id: `ess-ben-${employeeId}-3`,
      employeeId,
      planName: 'Group life insurance',
      enrolledSince: '2024-07-01',
      status: 'active',
    },
  ]
}
