import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '../auth/AuthContext'
import {
  getEssAttendance,
  getEssGoals,
  getEssLeaveBalance,
  getEssLeaveRequests,
  getEssOpenCycle,
  getEssTraining,
} from '../data/essSeed'
import type { LeaveRequest } from '../data/leaveMock'
import { subscribeLeaveStore } from '../data/leaveStore'
import type { TrainingCourse, TrainingEnrollment } from '../data/trainingMock'
import { trainingCatalog } from '../data/trainingMock'
import { isLeaveActiveOnDate } from '../utils/leaveStats'

export type EssDashboardMetrics = {
  leaveRecords: number
  onLeaveToday: number
  presentDays: number
  lateDays: number
  trainingTotal: number
  trainingNominated: number
  trainingApproved: number
  goalsCount: number
  goalsWithSelfRating: number
  appraisalCycle: string
}

type EssSessionValue = {
  employeeId: string
  leaveRequests: LeaveRequest[]
  enrollments: TrainingEnrollment[]
  catalog: TrainingCourse[]
  leaveBalance: ReturnType<typeof getEssLeaveBalance> | undefined
  metrics: EssDashboardMetrics
  nominateTraining: (course: TrainingCourse) => { ok: true } | { ok: false; message: string }
  cancelTrainingNomination: (enrollmentId: string) => void
}

const EssSessionContext = createContext<EssSessionValue | null>(null)

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

function buildMetrics(
  employeeId: string,
  leaveRequests: LeaveRequest[],
  enrollments: TrainingEnrollment[],
): EssDashboardMetrics {
  const attendance = employeeId ? getEssAttendance(employeeId) : []
  const goals = employeeId ? getEssGoals(employeeId) : []
  const cycle = getEssOpenCycle()
  const activeEnrollments = enrollments.filter((e) => e.status !== 'cancelled')

  const today = new Date().toISOString().slice(0, 10)
  return {
    leaveRecords: leaveRequests.filter((r) => r.status === 'approved').length,
    onLeaveToday: leaveRequests.filter((r) => isLeaveActiveOnDate(r, today)).length,
    presentDays: attendance.filter((a) => a.status === 'present').length,
    lateDays: attendance.filter((a) => a.status === 'late').length,
    trainingTotal: activeEnrollments.length,
    trainingNominated: activeEnrollments.filter((e) => e.status === 'nominated').length,
    trainingApproved: activeEnrollments.filter((e) => e.status === 'approved' || e.status === 'completed')
      .length,
    goalsCount: goals.length,
    goalsWithSelfRating: goals.filter((g) => g.selfRating).length,
    appraisalCycle: cycle?.title ?? '—',
  }
}

export function EssSessionProvider({ children }: { children: ReactNode }) {
  const { actorEmployeeId } = useAuth()
  const employeeId = actorEmployeeId ?? ''

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [enrollments, setEnrollments] = useState<TrainingEnrollment[]>([])
  const [catalog, setCatalog] = useState<TrainingCourse[]>([])

  useEffect(() => {
    if (!employeeId) {
      setLeaveRequests([])
      setEnrollments([])
      setCatalog([...trainingCatalog])
      return
    }
    const syncLeave = () => setLeaveRequests(getEssLeaveRequests(employeeId))
    syncLeave()
    const unsubLeave = subscribeLeaveStore(syncLeave)
    setEnrollments(getEssTraining(employeeId))
    setCatalog([...trainingCatalog])
    return () => {
      unsubLeave()
    }
  }, [employeeId])

  const leaveBalance = employeeId ? getEssLeaveBalance(employeeId) : undefined

  const metrics = useMemo(
    () => buildMetrics(employeeId, leaveRequests, enrollments),
    [employeeId, leaveRequests, enrollments],
  )

  const nominateTraining = useCallback(
    (course: TrainingCourse): { ok: true } | { ok: false; message: string } => {
      if (!employeeId) return { ok: false, message: 'No employee profile linked.' }
      if (course.status === 'full' || course.status === 'closed') {
        return { ok: false, message: `${course.title} is not open for nominations.` }
      }
      const already = enrollments.some((e) => e.courseId === course.id && e.status !== 'cancelled')
      if (already) return { ok: false, message: `You already nominated ${course.title}.` }

      const entry: TrainingEnrollment = {
        id: `te-local-${Date.now()}`,
        employeeId,
        courseId: course.id,
        courseTitle: course.title,
        provider: course.provider,
        durationDays: course.durationDays,
        status: 'nominated',
        nominatedAt: todayIso(),
      }
      setEnrollments((prev) => [entry, ...prev])
      setCatalog((prev) =>
        prev.map((c) =>
          c.id === course.id ? { ...c, enrolled: Math.min(c.enrolled + 1, c.capacity) } : c,
        ),
      )
      return { ok: true }
    },
    [employeeId, enrollments],
  )

  const cancelTrainingNomination = useCallback((enrollmentId: string) => {
    const row = enrollments.find((e) => e.id === enrollmentId)
    if (!row || row.status !== 'nominated') return
    setEnrollments((prev) =>
      prev.map((e) => (e.id === enrollmentId ? { ...e, status: 'cancelled' as const } : e)),
    )
    setCatalog((prev) =>
      prev.map((c) => (c.id === row.courseId ? { ...c, enrolled: Math.max(0, c.enrolled - 1) } : c)),
    )
  }, [enrollments])

  const value = useMemo(
    () => ({
      employeeId,
      leaveRequests,
      enrollments,
      catalog,
      leaveBalance,
      metrics,
      nominateTraining,
      cancelTrainingNomination,
    }),
    [
      employeeId,
      leaveRequests,
      enrollments,
      catalog,
      leaveBalance,
      metrics,
      nominateTraining,
      cancelTrainingNomination,
    ],
  )

  return <EssSessionContext.Provider value={value}>{children}</EssSessionContext.Provider>
}

export function useEssSession() {
  const ctx = useContext(EssSessionContext)
  if (!ctx) throw new Error('useEssSession must be used within EssSessionProvider')
  return ctx
}
