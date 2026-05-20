import { useSyncExternalStore } from 'react'
import { getJobPostings, subscribeJobPostingsStore } from '../data/jobPostingsStore'

export function useJobPostings() {
  return useSyncExternalStore(
    subscribeJobPostingsStore,
    getJobPostings,
    getJobPostings,
  )
}
