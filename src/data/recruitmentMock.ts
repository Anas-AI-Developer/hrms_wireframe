export type JobStatus = 'draft' | 'published' | 'closed'
export type CandidateStage =
  | 'applied'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'hired'

export type JobPosting = {
  id: string
  code: string
  title: string
  department: string
  bps: string
  vacancies: number
  status: JobStatus
  publishedAt?: string
  closesAt: string
  portalVisible: boolean
  createdAt: string
}

export type Candidate = {
  id: string
  jobId: string
  name: string
  email: string
  appliedAt: string
  stage: CandidateStage
  interviewRound?: number
}

export const jobPostingsSeed: JobPosting[] = [
  {
    id: 'job-1',
    code: 'JOB-AD-P',
    title: 'Assistant Director (Planning)',
    department: 'NAVTTC HQs',
    bps: '17',
    vacancies: 2,
    status: 'published',
    publishedAt: '2026-04-01',
    closesAt: '2026-05-30',
    portalVisible: true,
    createdAt: '2026-04-01T10:00:00.000Z',
  },
  {
    id: 'job-2',
    code: 'JOB-DEO',
    title: 'Data Entry Operator',
    department: 'RO Lahore',
    bps: '14',
    vacancies: 5,
    status: 'published',
    publishedAt: '2026-04-15',
    closesAt: '2026-06-15',
    portalVisible: true,
    createdAt: '2026-04-15T10:00:00.000Z',
  },
  {
    id: 'job-3',
    code: 'JOB-DD-T',
    title: 'Deputy Director (Technical)',
    department: 'NAVTTC HQs',
    bps: '18',
    vacancies: 1,
    status: 'draft',
    closesAt: '2026-07-01',
    portalVisible: false,
    createdAt: '2026-05-01T10:00:00.000Z',
  },
]

/** @deprecated use jobPostingsStore */
export const jobPostings = jobPostingsSeed

export const candidates: Candidate[] = [
  {
    id: 'c-1',
    jobId: 'job-1',
    name: 'Sanaullah Khan',
    email: 'sanaullah.k@example.com',
    appliedAt: '2026-04-20',
    stage: 'interview',
    interviewRound: 2,
  },
  {
    id: 'c-2',
    jobId: 'job-1',
    name: 'Ayesha Malik',
    email: 'ayesha.m@example.com',
    appliedAt: '2026-04-22',
    stage: 'shortlisted',
  },
  {
    id: 'c-3',
    jobId: 'job-2',
    name: 'Bilal Hussain',
    email: 'bilal.h@example.com',
    appliedAt: '2026-05-01',
    stage: 'applied',
  },
  {
    id: 'c-4',
    jobId: 'job-2',
    name: 'Hina Rafiq',
    email: 'hina.r@example.com',
    appliedAt: '2026-05-03',
    stage: 'offer',
  },
]

export const RECRUITMENT_STAGES: { id: CandidateStage; label: string }[] = [
  { id: 'applied', label: 'Application received' },
  { id: 'shortlisted', label: 'Shortlist' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer / reject' },
  { id: 'hired', label: 'Selected → onboarding' },
]

export function getJob(id: string) {
  return jobPostingsSeed.find((j) => j.id === id)
}

export function getCandidatesForJob(jobId: string) {
  return candidates.filter((c) => c.jobId === jobId)
}
