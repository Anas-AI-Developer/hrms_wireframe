import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'
import { RequireAuth } from './auth/RequireAuth'
import { RequirePermission } from './auth/RequirePermission'
import { homePathForRole } from './portals/homePath'
import { AppLayout } from './layouts/AppLayout'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { DashboardPage } from './pages/DashboardPage'
import { DepartmentListPage } from './pages/DepartmentListPage'
import { DesignationListPage } from './pages/DesignationListPage'
import { EmployeeDetailPage } from './pages/EmployeeDetailPage'
import { EmployeeFormPage } from './pages/EmployeeFormPage'
import { EmployeeListPage } from './pages/EmployeeListPage'
import { EssDashboardPage } from './pages/EssDashboardPage'
import { LoginPage } from './pages/LoginPage'
import { MasterDataCatalogPage } from './pages/MasterDataCatalogPage'
import { OrganogramPage } from './pages/OrganogramPage'
import { RbacMatrixPage } from './pages/RbacMatrixPage'
import { AttendanceImportPage } from './pages/AttendanceImportPage'
import { AttendanceListPage } from './pages/AttendanceListPage'
import { LeaveApprovalsPage } from './pages/LeaveApprovalsPage'
import { LeaveRequestsPage } from './pages/LeaveRequestsPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PayrollRunsPage } from './pages/PayrollRunsPage'
import { PayslipPage } from './pages/PayslipPage'
import { RecruitmentPage } from './pages/RecruitmentPage'
import { ReportsPage } from './pages/ReportsPage'
import { RoadmapPage } from './pages/RoadmapPage'
import { SprintModulesPage } from './pages/SprintModulesPage'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { RbacMatrixPage } from './pages/RbacMatrixPage'
import { EssDashboardPage } from './pages/EssDashboardPage'
import { AttendanceListPage } from './pages/AttendanceListPage'
import { LeaveListPage } from './pages/LeaveListPage'
import { JobPostingsListPage } from './pages/JobPostingsListPage'
import { HiringPipelinePage } from './pages/HiringPipelinePage'
import { ScheduleInterviewPage } from './pages/ScheduleInterviewPage'
import { OnboardingListPage } from './pages/OnboardingListPage'

function HomeRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={homePathForRole(user.role)} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="access-denied" element={<AccessDeniedPage />} />
            <Route index element={<HomeRedirect />} />
            <Route index element={<HomeRedirect />} />
            <Route
              path="dashboard"
              element={
                <RequirePermission permission="page:dashboard">
                  <DashboardPage />
                </RequirePermission>
              }
            />
            <Route
              path="ess"
              element={
                <RequirePermission permission="employee.view_self">
                  <EssDashboardPage />
                </RequirePermission>
              }
            />
            <Route
              path="admin/settings"
              element={
                <RequirePermission permission="page:admin_settings">
                  <AdminSettingsPage />
                </RequirePermission>
              }
            />
            <Route
              path="admin/rbac"
              element={
                <RequirePermission permission="page:rbac">
                  <RbacMatrixPage />
                </RequirePermission>
              }
            />
            <Route
              path="employees"
              element={
                <RequirePermission permission="page:employees">
                  <EmployeeListPage />
                </RequirePermission>
              }
            />
            <Route
              path="employees/new"
              element={
                <RequirePermission permission="page:employees:write">
                  <EmployeeFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="employees/:id"
              element={
                <RequirePermission permission="page:employees">
                  <EmployeeDetailPage />
                </RequirePermission>
              }
            />
            <Route
              path="employees/:id/edit"
              element={
                <RequirePermission permission="page:employees:write">
                  <EmployeeFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="departments"
              element={
                <RequirePermission permission="page:departments">
                  <DepartmentListPage />
                </RequirePermission>
              }
            />
            <Route
              path="designations"
              element={
                <RequirePermission permission="page:designations">
                  <DesignationListPage />
                </RequirePermission>
              }
            />
            <Route
              path="attendance"
              element={
                <RequirePermission permission="page:attendance">
                  <AttendanceListPage />
                </RequirePermission>
              }
            />
            <Route
              path="leave"
              element={
                <RequirePermission permission="page:leave">
                  <LeaveListPage />
                </RequirePermission>
              }
            />
            <Route
              path="jobs"
              element={
                <RequirePermission permission="page:recruitment">
                  <JobPostingsListPage />
                </RequirePermission>
              }
            />
            <Route
              path="hiring-pipeline"
              element={
                <RequirePermission permission="page:recruitment">
                  <HiringPipelinePage />
                </RequirePermission>
              }
            />
            <Route
              path="schedule-interview"
              element={
                <RequirePermission permission="page:recruitment">
                  <ScheduleInterviewPage />
                </RequirePermission>
              }
            />
            <Route
              path="onboarding"
              element={
                <RequirePermission permission="page:onboarding">
                  <OnboardingListPage />
                </RequirePermission>
              }
            />
            <Route
              path="roadmap"
              element={
                <RequirePermission permission="page:roadmap">
                  <RoadmapPage />
                </RequirePermission>
              }
            />
            <Route
              path="modules"
              element={
                <RequirePermission permission="page:modules">
                  <SprintModulesPage />
                </RequirePermission>
              }
            />
            <Route
              path="organogram"
              element={
                <RequirePermission permission="page:organogram">
                  <OrganogramPage />
                </RequirePermission>
              }
            />
            <Route
              path="master-data"
              element={
                <RequirePermission permission="page:master_data">
                  <MasterDataCatalogPage />
                </RequirePermission>
              }
            />
            <Route
              path="ess"
              element={
                <RequirePermission permission="page:dashboard">
                  <EssDashboardPage />
                </RequirePermission>
              }
            />
            <Route
              path="admin/settings"
              element={
                <RequirePermission permission="page:admin_settings">
                  <AdminSettingsPage />
                </RequirePermission>
              }
            />
            <Route
              path="admin/rbac"
              element={
                <RequirePermission permission="page:rbac">
                  <RbacMatrixPage />
                </RequirePermission>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
