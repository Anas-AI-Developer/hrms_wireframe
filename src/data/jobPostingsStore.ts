import {
  jobPostingsSeed,
  type JobPosting,
  type JobStatus,
} from './recruitmentMock'
import { WIREFRAME_TODAY } from '../utils/attendanceStats'

const STORAGE_KEY = 'hrms-wireframe-job-postings-v1'

function cloneSeed(): JobPosting[] {
  return jobPostingsSeed.map((j) => ({ ...j }))
}

function mergeSeed(rows: JobPosting[]): JobPosting[] {
  const ids = new Set(rows.map((j) => j.id))
  const missing = jobPostingsSeed.filter((j) => !ids.has(j.id))
  return missing.length ? [...missing, ...rows] : rows
}

function loadJobs(): JobPosting[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneSeed()
    const parsed = JSON.parse(raw) as JobPosting[]
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

let jobs: JobPosting[] = loadJobs()
const listeners = new Set<() => void>()

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch {
    /* ignore */
  }
}

function emit() {
  listeners.forEach((fn) => fn())
}

export function subscribeJobPostingsStore(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getJobPostings(): JobPosting[] {
  return jobs
}

export function getJobPosting(id: string): JobPosting | undefined {
  return jobs.find((j) => j.id === id)
}

export type NewJobPostingInput = {
  title: string
  code?: string
  department: string
  bps: string
  vacancies: number
  status: JobStatus
  closesAt: string
  portalVisible: boolean
}

function buildJobCode(title: string, custom?: string): string {
  const trimmed = custom?.trim()
  if (trimmed) return trimmed.toUpperCase()
  const words = title.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).filter(Boolean)
  const abbr = words
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 8)
  const suffix = Date.now().toString(36).slice(-4).toUpperCase()
  return `JOB-${abbr || 'NEW'}-${suffix}`
}

export function addJobPosting(input: NewJobPostingInput): JobPosting {
  const now = new Date().toISOString()
  const status = input.status
  const entry: JobPosting = {
    id: `job-${Date.now()}`,
    code: buildJobCode(input.title, input.code),
    title: input.title.trim(),
    department: input.department.trim(),
    bps: input.bps.trim(),
    vacancies: Math.max(1, input.vacancies),
    status,
    closesAt: input.closesAt,
    portalVisible: input.portalVisible,
    createdAt: now,
    ...(status === 'published' ? { publishedAt: WIREFRAME_TODAY } : {}),
  }
  jobs = [entry, ...jobs]
  persist()
  emit()
  return entry
}

export function updateJobPosting(
  id: string,
  patch: Partial<Omit<JobPosting, 'id' | 'createdAt'>>,
): JobPosting | undefined {
  const idx = jobs.findIndex((j) => j.id === id)
  if (idx < 0) return undefined
  const prev = jobs[idx]!
  const next: JobPosting = {
    ...prev,
    ...patch,
    ...(patch.status === 'published' && !prev.publishedAt
      ? { publishedAt: WIREFRAME_TODAY }
      : {}),
  }
  jobs = [...jobs.slice(0, idx), next, ...jobs.slice(idx + 1)]
  persist()
  emit()
  return next
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
}
