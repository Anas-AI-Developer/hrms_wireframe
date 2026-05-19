export type EmployeeStatus = 'active' | 'on_leave' | 'inactive'

/** Matches client HR classification (see CLIENT_EMPLOYMENT_TYPE_COUNTS). */
export type EmploymentType =
  | 'regular'
  | 'deputation'
  | 'contingent'
  | 'dpl'
  | 'short_term_project'
  | 'vacant_post'
  | 'unknown'

export type Department = {
  id: string
  name: string
  code: string
  headName: string
}

/** Sub-unit within a centre (MasterList `section_field`). */
export type OrgSection = {
  id: string
  name: string
  departmentId: string
}

export type Designation = {
  id: string
  title: string
  grade: string
  departmentId: string
}

export type EmployeeHistoryEvent = {
  id: string
  employeeId: string
  date: string
  field: 'department' | 'designation' | 'manager' | 'status'
  fromLabel: string
  toLabel: string
  note?: string
}

export type Employee = {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  email: string
  phone: string
  departmentId: string
  sectionId?: string
  designationId: string
  managerId?: string
  employmentType: EmploymentType
  status: EmployeeStatus
  joinDate: string
  location: string
  masterSerial?: number
  section?: string
  sanctionedPost?: string
  workingAs?: string
  actualPost?: string
  bps?: number | string
  qualification?: string
  specialization?: string
  modeOfAppointment?: string
  parentDepartment?: string
  tenureInNavttc?: string
  domicile?: string
}
