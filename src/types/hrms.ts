export type EmployeeStatus = 'active' | 'on_leave' | 'inactive'

export type RecordStatus = 'active' | 'inactive'

/** Matches client HR classification (see CLIENT_EMPLOYMENT_TYPE_COUNTS). */
export type EmploymentType =
  | 'regular'
  | 'deputation'
  | 'contingent'
  | 'dpl'
  | 'short_term_project'
  | 'vacant_post'
  | 'unknown'

/** NAVTTC office / regional location (parent of departments). */
export type NavttcOffice = {
  id: string
  name: string
  code: string
  status: RecordStatus
}

export type Department = {
  id: string
  officeId: string
  name: string
  code: string
  headName: string
  status: RecordStatus
  createdAt: string
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
  status: RecordStatus
  createdAt: string
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
  /** CNIC / NIC — wireframe format #####-#######-# */
  cnic?: string
  dateOfBirth?: string
  departmentId: string
  /** NAVTTC head office or regional office (see navttcOfficeMapping). */
  officeId?: string
  sectionId?: string
  /** NAVTTC HQ organogram placement (Organogram 2026) */
  orgHeadId?: string
  orgWingId?: string
  orgSectionId?: string
  orgSubSection1Id?: string
  orgSubSection2Id?: string
  designationId: string
  /** NAVTTC role level (Chairman → Employee). */
  roleLevelId?: string
  managerId?: string
  employmentType: EmploymentType
  status: EmployeeStatus
  joinDate: string
  /** Expected appointment length in whole months (e.g. 12, 24). */
  serviceDurationMonths?: number
  /** @deprecated Use serviceDurationMonths */
  serviceDurationYears?: number
  /** Derived separation date (join + duration); "—" when not applicable. */
  endDate: string
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
