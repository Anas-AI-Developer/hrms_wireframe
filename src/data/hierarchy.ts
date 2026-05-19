import type { Employee } from '../types/hrms'

const LEADERSHIP_TITLES: { match: RegExp; rank: number }[] = [
  { match: /executive\s*director/i, rank: 5 },
  { match: /director\s*general/i, rank: 4 },
  { match: /deputy\s*director/i, rank: 2 },
  { match: /assistant\s*director/i, rank: 1 },
  { match: /\bdirector\b/i, rank: 3 },
]

export function bpsValue(e: Pick<Employee, 'bps'>): number {
  if (typeof e.bps === 'number' && e.bps > 0) return e.bps
  const n = parseInt(String(e.bps ?? ''), 10)
  return Number.isFinite(n) ? n : 0
}

function leadershipRank(post: string): number {
  const t = post.trim()
  for (const { match, rank } of LEADERSHIP_TITLES) {
    if (match.test(t)) return rank
  }
  return 0
}

function postTitle(e: Employee): string {
  return (e.sanctionedPost || e.workingAs || '').trim()
}

function isFilled(e: Employee): boolean {
  return e.status === 'active' && !/^vacant$/i.test(e.firstName)
}

/** Derive single manager per employee from organogram order + BPS within centre. */
export function assignManagers(rows: Employee[]): Employee[] {
  const byDept = new Map<string, Employee[]>()
  for (const e of rows) {
    const list = byDept.get(e.departmentId) ?? []
    list.push(e)
    byDept.set(e.departmentId, list)
  }

  const managerById = new Map<string, string | undefined>()

  for (const group of byDept.values()) {
    const filled = group.filter(isFilled)
    const byRank = new Map<number, Employee>()
    for (const e of filled) {
      const r = leadershipRank(postTitle(e))
      if (r > 0 && !byRank.has(r)) byRank.set(r, e)
    }

    const ed = byRank.get(5)
    const dg = byRank.get(4)
    const dir = byRank.get(3)
    const dd = byRank.get(2)
    const ad = byRank.get(1)

    for (const e of group) {
      if (!isFilled(e)) {
        managerById.set(e.id, undefined)
        continue
      }
      const rank = leadershipRank(postTitle(e))
      let manager: Employee | undefined
      if (rank >= 5) manager = undefined
      else if (rank === 4) manager = ed
      else if (rank === 3) manager = dg ?? ed
      else if (rank === 2) manager = dir ?? dg ?? ed
      else if (rank === 1) manager = dd ?? dir ?? dg ?? ed
      else {
        const myBps = bpsValue(e)
        const section = e.section?.toLowerCase() ?? ''
        const candidates = filled
          .filter((c) => c.id !== e.id && bpsValue(c) > myBps)
          .sort((a, b) => bpsValue(b) - bpsValue(a))
        const sameSection = section
          ? candidates.find((c) => (c.section?.toLowerCase() ?? '') === section)
          : undefined
        manager =
          sameSection ??
          candidates[0] ??
          ad ??
          dd ??
          dir ??
          dg ??
          ed
      }
      managerById.set(e.id, manager?.id)
    }
  }

  return rows.map((e) => ({
    ...e,
    managerId: managerById.get(e.id),
  }))
}

export function mapEmploymentType(mode: string): Employee['employmentType'] {
  const m = mode.toLowerCase()
  if (m.includes('deput')) return 'deputation'
  if (m.includes('contract')) return 'contract'
  if (m.includes('intern')) return 'intern'
  if (m.includes('regular') || m.includes('appointment') || m.includes('promot')) return 'permanent'
  if (m) return 'other'
  return 'permanent'
}
