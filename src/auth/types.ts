/** Client system roles (organogram / RBAC). */
export type RoleId =
  | 'executive_director'
  | 'director_general'
  | 'director'
  | 'deputy_director'
  | 'assistant_director'
  | 'assistant_accounts_officer_accounts'
  | 'assistant_accounts_officer_finance'
  | 'employee'

/** Route pages and feature actions (module.action style). */
export type Permission =
  | 'page:dashboard'
  | 'page:employees'
  | 'page:employees:write'
  | 'page:departments'
  | 'page:departments:write'
  | 'page:designations'
  | 'page:designations:write'
  | 'page:admin_settings'
  | 'page:rbac'
  | 'page:roadmap'
  | 'page:modules'
  | 'page:organogram'
  | 'page:master_data'
  | 'employee.view_all'
  | 'employee.view_team'
  | 'employee.view_self'
  | 'leave.approve'
  | 'payroll.run'
  | 'payroll.view'

export type AuthUser = {
  username: string
  displayName: string
  role: RoleId
  designation?: string
  /** Linked roster row for scope (manager team / ESS self). */
  employeeId?: string
}

export const STORAGE_KEY = 'hrms_wireframe_session_v3'
