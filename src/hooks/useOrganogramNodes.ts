import { useSyncExternalStore } from 'react'
import { getOrgNodesSnapshot, subscribeOrganogramStore } from '../data/organogramStore'

export function useOrganogramNodes() {
  return useSyncExternalStore(subscribeOrganogramStore, getOrgNodesSnapshot, getOrgNodesSnapshot)
}
