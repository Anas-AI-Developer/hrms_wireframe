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
  courseTitle: string
  status: 'nominated' | 'approved' | 'completed' | 'cancelled'
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
]

export const trainingEnrollments: TrainingEnrollment[] = [
  { id: 'te-1', employeeId: 'm-8', courseTitle: 'Excel for HR Analytics', status: 'nominated' },
  { id: 'te-2', employeeId: 'm-8', courseTitle: 'Occupational Safety', status: 'approved' },
]
