import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { HomeRedirect } from './components/HomeRedirect'
import { RequireAuth } from './auth/RequireAuth'
import { RequirePermission } from './auth/RequirePermission'
import { AppLayout } from './layouts/AppLayout'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { AttendanceImportPage } from './pages/AttendanceImportPage'
import { AttendanceListPage } from './pages/AttendanceListPage'
import { EmployeeAttendanceHistoryPage } from './pages/EmployeeAttendanceHistoryPage'
import { AttendanceReportPage } from './pages/AttendanceReportPage'
import { DashboardPage } from './pages/DashboardPage'
import { DepartmentFormPage } from './pages/DepartmentFormPage'
import { DepartmentListPage } from './pages/DepartmentListPage'
import { OrgStructurePage } from './pages/OrgStructurePage'
import { OrgUnitFormPage } from './pages/OrgUnitFormPage'
import { DesignationFormPage } from './pages/DesignationFormPage'
import { DesignationListPage } from './pages/DesignationListPage'
import { EmployeeDetailPage } from './pages/EmployeeDetailPage'
import { EmployeeFormPage } from './pages/EmployeeFormPage'
import { EmployeeAnalyticsPage } from './pages/EmployeeAnalyticsPage'
import { EmployeeListPage } from './pages/EmployeeListPage'
import { EssLayout } from './layouts/EssLayout'
import { EssAttendancePage } from './pages/ess/EssAttendancePage'
import { EssLeavePage } from './pages/ess/EssLeavePage'
import { EssDashboardPage } from './pages/ess/EssDashboardPage'
import { EssPerformancePage } from './pages/ess/EssPerformancePage'
import { EssTrainingPage } from './pages/ess/EssTrainingPage'
import { HiringPipelinePage } from './pages/HiringPipelinePage'
import { JobPostingFormPage } from './pages/JobPostingFormPage'
import { JobPostingsListPage } from './pages/JobPostingsListPage'
import { LeaveManagementPage } from './pages/LeaveManagementPage'
import { LeaveHubProvider } from './leave/LeaveHubContext'
import { LoginPage } from './pages/LoginPage'
import { OnboardingListPage } from './pages/OnboardingListPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OrganogramMappingPage } from './pages/OrganogramMappingPage'
import { OrganogramPage } from './pages/OrganogramPage'
import { PerformancePage } from './pages/PerformancePage'
import { RbacMatrixPage } from './pages/RbacMatrixPage'
import { RecruitmentPage } from './pages/RecruitmentPage'
import { ReportsPage } from './pages/ReportsPage'
import { ScheduleInterviewPage } from './pages/ScheduleInterviewPage'
import { SystemProposalPage } from './pages/SystemProposalPage'
import { TrainingPage } from './pages/TrainingPage'
import { UserProfilePage } from './pages/UserProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="access-denied" element={<HomeRedirect />} />
            <Route path="profile" element={<UserProfilePage />} />
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
                <RequirePermission permission="page:dashboard">
                  <EssLayout />
                </RequirePermission>
              }
            >
              <Route index element={<EssDashboardPage />} />
              <Route
                path="leave"
                element={
                  <RequirePermission permission="page:leave">
                    <EssLeavePage />
                  </RequirePermission>
                }
              />
              <Route
                path="attendance"
                element={
                  <RequirePermission permission="page:attendance">
                    <EssAttendancePage />
                  </RequirePermission>
                }
              />
              <Route
                path="performance"
                element={
                  <RequirePermission permission="page:performance">
                    <EssPerformancePage />
                  </RequirePermission>
                }
              />
              <Route
                path="training"
                element={
                  <RequirePermission permission="page:training">
                    <EssTrainingPage />
                  </RequirePermission>
                }
              />
            </Route>
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
              path="organogram"
              element={
                <RequirePermission permission="page:organogram">
                  <OrganogramPage />
                </RequirePermission>
              }
            />
            <Route
              path="organogram/mapping"
              element={
                <RequirePermission permission="page:organogram">
                  <OrganogramMappingPage />
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
            <Route path="departments" element={<Navigate to="/org/wings" replace />} />
            <Route
              path="org/:levelKey/new"
              element={
                <RequirePermission permission="page:departments:write">
                  <OrgUnitFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="org/:levelKey/:id/edit"
              element={
                <RequirePermission permission="page:departments:write">
                  <OrgUnitFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="org/:levelKey"
              element={
                <RequirePermission permission="page:departments">
                  <OrgStructurePage />
                </RequirePermission>
              }
            />
            <Route
              path="departments/list"
              element={
                <RequirePermission permission="page:departments">
                  <DepartmentListPage />
                </RequirePermission>
              }
            />
            <Route
              path="departments/new"
              element={
                <RequirePermission permission="page:departments:write">
                  <DepartmentFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="departments/:id/edit"
              element={
                <RequirePermission permission="page:departments:write">
                  <DepartmentFormPage />
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
              path="designations/new"
              element={
                <RequirePermission permission="page:designations:write">
                  <DesignationFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="designations/:id/edit"
              element={
                <RequirePermission permission="page:designations:write">
                  <DesignationFormPage />
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
              path="attendance/employee/:employeeId"
              element={
                <RequirePermission permission="page:attendance">
                  <EmployeeAttendanceHistoryPage />
                </RequirePermission>
              }
            />
            <Route
              path="attendance/import"
              element={
                <RequirePermission permission="page:attendance:import">
                  <AttendanceImportPage />
                </RequirePermission>
              }
            />
            <Route
              path="leave"
              element={
                <RequirePermission permission="page:leave">
                  <LeaveHubProvider>
                    <Outlet />
                  </LeaveHubProvider>
                </RequirePermission>
              }
            >
              <Route index element={<LeaveManagementPage />} />
            </Route>
            <Route
              path="jobs"
              element={
                <RequirePermission permission="page:recruitment">
                  <JobPostingsListPage />
                </RequirePermission>
              }
            />
            <Route
              path="jobs/new"
              element={
                <RequirePermission permission="page:recruitment">
                  <JobPostingFormPage />
                </RequirePermission>
              }
            />
            <Route
              path="jobs/:id/edit"
              element={
                <RequirePermission permission="page:recruitment">
                  <JobPostingFormPage />
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
              path="recruitment"
              element={
                <RequirePermission permission="page:recruitment">
                  <RecruitmentPage />
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
              path="onboarding/cases"
              element={
                <RequirePermission permission="page:onboarding">
                  <OnboardingPage />
                </RequirePermission>
              }
            />
            <Route
              path="reports"
              element={
                <RequirePermission permission="page:reports">
                  <ReportsPage />
                </RequirePermission>
              }
            />
            <Route
              path="reports/attendance"
              element={
                <RequirePermission permission="page:reports:attendance">
                  <AttendanceReportPage />
                </RequirePermission>
              }
            />
            <Route
              path="reports/employees"
              element={
                <RequirePermission permission="page:reports:employees">
                  <EmployeeAnalyticsPage />
                </RequirePermission>
              }
            />
            <Route
              path="proposal"
              element={
                <RequirePermission permission="page:proposal">
                  <SystemProposalPage />
                </RequirePermission>
              }
            />
            <Route
              path="performance"
              element={
                <RequirePermission permission="page:performance:manage">
                  <PerformancePage />
                </RequirePermission>
              }
            />
            <Route
              path="training"
              element={
                <RequirePermission permission="page:training">
                  <TrainingPage />
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
