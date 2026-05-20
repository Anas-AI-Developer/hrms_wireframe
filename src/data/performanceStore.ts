import {
  performanceGoals as seedGoals,
  type PerformanceGoal,
} from './performanceMock'

const STORAGE_KEY = 'hrms-wireframe-performance-v1'

function cloneSeed(): PerformanceGoal[] {
  return seedGoals.map((g) => ({ ...g }))
}

function mergeSeed(goals: PerformanceGoal[]): PerformanceGoal[] {
  const ids = new Set(goals.map((g) => g.id))
  const missing = seedGoals.filter((g) => !ids.has(g.id))
  return missing.length ? [...missing, ...goals] : goals
}

function loadGoals(): PerformanceGoal[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneSeed()
    const parsed = JSON.parse(raw) as PerformanceGoal[]
    if (!Array.isArray(parsed)) return cloneSeed()
    const merged = mergeSeed(parsed)
    if (merged.length !== parsed.length) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
    }
    return merged
  } catch {
    return cloneSeed()
  }
}

let goals: PerformanceGoal[] = loadGoals()
const listeners = new Set<() => void>()

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((fn) => fn())
}

export function subscribePerformanceStore(fn: () => void) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getPerformanceGoals(): PerformanceGoal[] {
  return goals
}

export function getPerformanceGoalsForEmployee(employeeId: string): PerformanceGoal[] {
  return goals.filter((g) => g.employeeId === employeeId)
}

export type PerformanceGoalInput = {
  employeeId: string
  employeeName: string
  goalTitle: string
  target: string
  cycleId?: string
}

export function addPerformanceGoal(input: PerformanceGoalInput): PerformanceGoal {
  const entry: PerformanceGoal = {
    id: `pg-${Date.now()}`,
    employeeId: input.employeeId,
    employeeName: input.employeeName,
    goalTitle: input.goalTitle.trim(),
    target: input.target.trim(),
    cycleId: input.cycleId,
  }
  goals = [entry, ...goals]
  persist()
  emit()
  return entry
}

export function updatePerformanceGoal(
  id: string,
  patch: Partial<Pick<PerformanceGoal, 'selfRating' | 'managerRating' | 'managerComment' | 'goalTitle' | 'target'>>,
): PerformanceGoal | undefined {
  const idx = goals.findIndex((g) => g.id === id)
  if (idx < 0) return undefined
  const next = { ...goals[idx], ...patch }
  goals = [...goals.slice(0, idx), next, ...goals.slice(idx + 1)]
  persist()
  emit()
  return next
}

export const PERFORMANCE_RATINGS = ['1/5', '2/5', '3/5', '4/5', '5/5'] as const

export function ratingScore(value?: string): number | null {
  if (!value) return null
  const m = /^(\d)\/5$/.exec(value.trim())
  return m ? Number(m[1]) : null
}
