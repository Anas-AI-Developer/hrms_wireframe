import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type {
  Department,
  Designation,
  Employee,
  EmployeeHistoryEvent,
  NavttcOffice,
  OrgSection,
} from '../types/hrms'
import { getActiveOffices, getDepartmentsForOffice } from './navttcOffices'
import type { EmploymentType } from '../types/hrms'
import {
  addBenefitDefinition,
  addDepartment,
  addDesignation,
  addEmployee,
  deleteDepartment,
  deleteDesignation,
  getEmployees,
  getWireframeStore,
  resetWireframeStore,
  setEmploymentTypeBenefitDefaults,
  subscribeWireframeStore,
  updateDepartment,
  updateDesignation,
  updateEmployee,
  type BenefitDefinitionInput,
  type DepartmentInput,
  type DesignationInput,
  type EmployeeInput,
} from './wireframeStore'
import type { BenefitDefinition, EmployeeBenefitEnrollment } from './benefitsData'
import {
  getDepartment,
  getDesignation,
  getEmployee,
  getEmployeeHistory,
  getDirectReports,
  getEmployeeBenefitIds,
  getSection,
} from './wireframeStore'

type WireframeDataValue = {
  offices: NavttcOffice[]
  departments: Department[]
  designations: Designation[]
  getDepartmentsForOffice: (officeId: string) => Department[]
  sections: OrgSection[]
  employees: Employee[]
  employeeHistory: EmployeeHistoryEvent[]
  benefitDefinitions: BenefitDefinition[]
  employmentTypeBenefitDefaults: Record<EmploymentType, string[]>
  employeeBenefitEnrollments: EmployeeBenefitEnrollment[]
  addDepartment: (input: DepartmentInput) => Department
  updateDepartment: (id: string, input: DepartmentInput) => Department | undefined
  deleteDepartment: (id: string) => void
  addDesignation: (input: DesignationInput) => Designation
  updateDesignation: (id: string, input: DesignationInput) => Designation | undefined
  deleteDesignation: (id: string) => void
  addEmployee: (input: EmployeeInput) => Employee
  updateEmployee: (id: string, input: EmployeeInput) => Employee | undefined
  addBenefitDefinition: (input: BenefitDefinitionInput) => BenefitDefinition
  setEmploymentTypeBenefitDefaults: (employmentType: EmploymentType, benefitIds: string[]) => void
  getEmployeeBenefitIds: (employeeId: string) => string[]
  resetAll: () => void
  getDepartment: typeof getDepartment
  getDesignation: typeof getDesignation
  getEmployee: typeof getEmployee
  getSection: typeof getSection
  getEmployeeHistory: typeof getEmployeeHistory
  getDirectReports: typeof getDirectReports
}

const WireframeDataContext = createContext<WireframeDataValue | null>(null)

function useStoreSnapshot() {
  return useSyncExternalStore(
    subscribeWireframeStore,
    () => getWireframeStore(),
    () => getWireframeStore(),
  )
}

export function WireframeDataProvider({ children }: { children: ReactNode }) {
  const snapshot = useStoreSnapshot()

  const resetAll = useCallback(() => resetWireframeStore(), [])

  const value = useMemo<WireframeDataValue>(
    () => ({
      offices: getActiveOffices(),
      departments: snapshot.departments,
      getDepartmentsForOffice: (officeId: string) =>
        getDepartmentsForOffice(officeId, snapshot.departments),
      designations: snapshot.designations,
      sections: snapshot.sections,
      employees: snapshot.employees,
      employeeHistory: snapshot.employeeHistory,
      benefitDefinitions: snapshot.benefitDefinitions,
      employmentTypeBenefitDefaults: snapshot.employmentTypeBenefitDefaults,
      employeeBenefitEnrollments: snapshot.employeeBenefitEnrollments,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addDesignation,
      updateDesignation,
      deleteDesignation,
      addEmployee,
      updateEmployee,
      addBenefitDefinition,
      setEmploymentTypeBenefitDefaults,
      getEmployeeBenefitIds,
      resetAll,
      getDepartment,
      getDesignation,
      getEmployee,
      getSection,
      getEmployeeHistory,
      getDirectReports,
    }),
    [snapshot, resetAll],
  )

  return <WireframeDataContext.Provider value={value}>{children}</WireframeDataContext.Provider>
}

export function useWireframeData() {
  const ctx = useContext(WireframeDataContext)
  if (!ctx) throw new Error('useWireframeData must be used within WireframeDataProvider')
  return ctx
}

/** Subscribe without context (e.g. auth scope). */
export function useWireframeEmployees() {
  return useSyncExternalStore(subscribeWireframeStore, getEmployees, getEmployees)
}
