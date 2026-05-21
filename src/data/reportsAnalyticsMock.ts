/** Sprint 4 — mock aggregates for report wireframes. */

export type AttendanceCentreSummary = {
  centre: string
  present: number
  absent: number
  late: number
  onLeave: number
  attendanceRate: string
}

export type PayrollCentreSummary = {
  centre: string
  headcount: number
  gross: number
  deductions: number
  net: number
}

export type EmployeeCentreHeadcount = {
  centre: string
  active: number
  onLeave: number
  vacant: number
  regular: number
  deputation: number
}

export const attendanceReportMonth = 'April 2026'

export const attendanceByCentre: AttendanceCentreSummary[] = [
  { centre: 'HQ Islamabad', present: 142, absent: 4, late: 11, onLeave: 8, attendanceRate: '96.2%' },
  { centre: 'Regional — Lahore', present: 38, absent: 2, late: 3, onLeave: 2, attendanceRate: '94.1%' },
  { centre: 'Regional — Karachi', present: 31, absent: 1, late: 2, onLeave: 1, attendanceRate: '95.8%' },
  { centre: 'Regional — Peshawar', present: 22, absent: 0, late: 1, onLeave: 1, attendanceRate: '97.0%' },
]

export const payrollByCentre: PayrollCentreSummary[] = [
  { centre: 'HQ Islamabad', headcount: 168, gross: 28_400_000, deductions: 3_100_000, net: 25_300_000 },
  { centre: 'Regional — Lahore', headcount: 42, gross: 6_800_000, deductions: 720_000, net: 6_080_000 },
  { centre: 'Regional — Karachi', headcount: 28, gross: 4_200_000, deductions: 450_000, net: 3_750_000 },
  { centre: 'Regional — Peshawar', headcount: 10, gross: 1_100_000, deductions: 95_000, net: 1_005_000 },
]

export const headcountByCentre: EmployeeCentreHeadcount[] = [
  { centre: 'HQ Islamabad', active: 168, onLeave: 12, vacant: 6, regular: 152, deputation: 16 },
  { centre: 'Regional — Lahore', active: 45, onLeave: 3, vacant: 2, regular: 40, deputation: 5 },
  { centre: 'Regional — Karachi', active: 30, onLeave: 2, vacant: 1, regular: 28, deputation: 2 },
  { centre: 'Regional — Peshawar', active: 11, onLeave: 1, vacant: 0, regular: 10, deputation: 1 },
]

export const executiveKpis = {
  totalActive: 254,
  openRecruitment: 3,
  leavePending: 7,
  onboardingInProgress: 4,
  trainingEnrollments: 18,
  appraisalCycleOpen: 'FY 2025–26',
}
