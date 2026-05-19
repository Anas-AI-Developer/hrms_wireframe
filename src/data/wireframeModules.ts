import type { RecordStatus } from '../types/hrms'

export type WireframeRow = {
  id: string
  name: string
  code: string
  status: RecordStatus
  createdAt: string
  extra?: string
}

const baseDate = Date.UTC(2026, 4, 8, 16, 22)

function row(
  id: string,
  name: string,
  code: string,
  dayOffset: number,
  extra?: string,
): WireframeRow {
  return {
    id,
    name,
    code,
    status: 'active',
    createdAt: new Date(baseDate + dayOffset * 86400000).toISOString(),
    extra,
  }
}

export const attendanceRows: WireframeRow[] = [
  row('a1', 'May 2026 — HQ sheet', 'ATT-2026-05', 0, 'Imported · 35 rows'),
  row('a2', 'Apr 2026 — HQ sheet', 'ATT-2026-04', -2, 'Locked'),
  row('a3', 'Mar 2026 — Regional', 'ATT-2026-03-R', -5, 'Draft'),
]

export const leaveRows: WireframeRow[] = [
  row('l1', 'Casual — Ahmed Khan', 'LR-1042', 0, 'Pending approval'),
  row('l2', 'Annual — Sara Ali', 'LR-1041', -1, 'Approved'),
  row('l3', 'Sick — Vacant post', 'LR-1040', -2, 'Rejected'),
]

export const jobRows: WireframeRow[] = [
  row('j1', 'Deputy Director (Technical)', 'JOB-DD-T', 0, 'Open · 12 applicants'),
  row('j2', 'Data Entry Operator', 'JOB-DEO', -1, 'Closed'),
]

export const pipelineRows: WireframeRow[] = [
  row('p1', 'Shortlisted — DEO', 'PIPE-DEO-01', 0, 'Interview scheduled'),
  row('p2', 'Applied — Assistant Director', 'PIPE-AD-02', -1, 'Screening'),
]

export const interviewRows: WireframeRow[] = [
  row('i1', 'Panel A — Room 204', 'INT-2026-14', 0, 'May 22, 2026 10:00'),
  row('i2', 'Panel B — Virtual', 'INT-2026-15', 1, 'May 24, 2026 14:30'),
]

export const onboardingRows: WireframeRow[] = [
  row('o1', 'New hire — EMP-1204', 'ONB-1204', 0, '3 / 8 checklist items'),
  row('o2', 'Transfer — EMP-0891', 'ONB-0891', -3, 'Documents pending'),
]
