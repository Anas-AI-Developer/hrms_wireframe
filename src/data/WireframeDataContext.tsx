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
  OrgSection,
} from '../types/hrms'
import {
  addDepartment,
  addDesignation,
  addEmployee,
  deleteDepartment,
  deleteDesignation,
  getEmployees,
  getWireframeStore,
  resetWireframeStore,
  subscribeWireframeStore,
  updateDepartment,
  updateDesignation,
  updateEmployee,
  type DepartmentInput,
  type DesignationInput,
  type EmployeeInput,
} from './wireframeStore'
import {
  getDepartment,
  getDesignation,
  getEmployee,
  getEmployeeHistory,
  getDirectReports,
  getSection,
} from './wireframeStore'

type WireframeDataValue = {
  departments: Department[]
  designations: Designation[]
  sections: OrgSection[]
  employees: Employee[]
  employeeHistory: EmployeeHistoryEvent[]
  addDepartment: (input: DepartmentInput) => Department
  updateDepartment: (id: string, input: DepartmentInput) => Department | undefined
  deleteDepartment: (id: string) => void
  addDesignation: (input: DesignationInput) => Designation
  updateDesignation: (id: string, input: DesignationInput) => Designation | undefined
  deleteDesignation: (id: string) => void
  addEmployee: (input: EmployeeInput) => Employee
  updateEmployee: (id: string, input: EmployeeInput) => Employee | undefined
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
      departments: snapshot.departments,
      designations: snapshot.designations,
      sections: snapshot.sections,
      employees: snapshot.employees,
      employeeHistory: snapshot.employeeHistory,
      addDepartment,
      updateDepartment,
      deleteDepartment,
      addDesignation,
      updateDesignation,
      deleteDesignation,
      addEmployee,
      updateEmployee,
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
