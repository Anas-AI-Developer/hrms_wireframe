export type TrainingCourse = {
  id: string
  title: string
  provider: string
  durationDays: number
  capacity: number
  enrolled: number
  status: 'open' | 'full' | 'closed'
}

export type TrainingEnrollment = {
  id: string
  employeeId: string
  courseId: string
  courseTitle: string
  provider: string
  durationDays: number
  status: 'nominated' | 'approved' | 'completed' | 'cancelled'
  nominatedAt: string
  scheduledStart?: string
  scheduledEnd?: string
  completedAt?: string
}

export const trainingCatalog: TrainingCourse[] = [
  {
    id: 'tr-1',
    title: 'Leadership for Public Sector',
    provider: 'NAVTTC Academy',
    durationDays: 5,
    capacity: 25,
    enrolled: 18,
    status: 'open',
  },
  {
    id: 'tr-2',
    title: 'Excel for HR Analytics',
    provider: 'External vendor',
    durationDays: 2,
    capacity: 40,
    enrolled: 40,
    status: 'full',
  },
  {
    id: 'tr-3',
    title: 'Occupational Safety',
    provider: 'In-house',
    durationDays: 1,
    capacity: 60,
    enrolled: 12,
    status: 'open',
  },
  {
    id: 'tr-4',
    title: 'Records management & filing',
    provider: 'NAVTTC Academy',
    durationDays: 2,
    capacity: 30,
    enrolled: 8,
    status: 'open',
  },
  {
    id: 'tr-5',
    title: 'First aid at workplace',
    provider: 'Red Crescent partner',
    durationDays: 1,
    capacity: 20,
    enrolled: 20,
    status: 'full',
  },
]

export const trainingEnrollments: TrainingEnrollment[] = [
  {
    id: 'te-1',
    employeeId: 'm-8',
    courseId: 'tr-2',
    courseTitle: 'Excel for HR Analytics',
    provider: 'External vendor',
    durationDays: 2,
    status: 'nominated',
    nominatedAt: '2026-05-01',
  },
  {
    id: 'te-2',
    employeeId: 'm-8',
    courseId: 'tr-3',
    courseTitle: 'Occupational Safety',
    provider: 'In-house',
    durationDays: 1,
    status: 'approved',
    nominatedAt: '2026-04-15',
    scheduledStart: '2026-05-22',
    scheduledEnd: '2026-05-22',
  },
  {
    id: 'te-3',
    employeeId: 'm-8',
    courseId: 'tr-4',
    courseTitle: 'Records management & filing',
    provider: 'NAVTTC Academy',
    durationDays: 2,
    status: 'completed',
    nominatedAt: '2026-02-10',
    scheduledStart: '2026-03-05',
    scheduledEnd: '2026-03-06',
    completedAt: '2026-03-06',
  },
]
