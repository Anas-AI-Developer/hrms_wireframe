import type { AuthUser } from './types'

export const PROFILE_OVERRIDES_KEY = 'hrms_wireframe_profile_overrides_v1'

export type ProfileOverride = {
  displayName?: string
  email?: string
  phone?: string
  password?: string
}

type OverrideMap = Record<string, ProfileOverride>

function readMap(): OverrideMap {
  try {
    const raw = sessionStorage.getItem(PROFILE_OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as OverrideMap
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: OverrideMap) {
  sessionStorage.setItem(PROFILE_OVERRIDES_KEY, JSON.stringify(map))
}

export function getProfileOverride(username: string): ProfileOverride | undefined {
  return readMap()[username.toLowerCase()]
}

export function patchProfileOverride(username: string, patch: ProfileOverride) {
  const key = username.toLowerCase()
  const map = readMap()
  map[key] = { ...map[key], ...patch }
  writeMap(map)
}

export function getEffectivePassword(username: string, defaultPassword: string): string {
  return getProfileOverride(username)?.password ?? defaultPassword
}

export function applyProfileOverrides(user: AuthUser): AuthUser {
  const o = getProfileOverride(user.username)
  if (!o) return user
  return {
    ...user,
    ...(o.displayName ? { displayName: o.displayName } : {}),
    ...(o.email !== undefined ? { email: o.email } : {}),
    ...(o.phone !== undefined ? { phone: o.phone } : {}),
  }
}
