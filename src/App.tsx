import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { HomeRedirect } from './components/HomeRedirect'
import { RequireAuth } from './auth/RequireAuth'
import { RequirePermission } from './auth/RequirePermission'
import { AppLayout } from './layouts/AppLayout'
import { AdminSettingsPage } from './pages/AdminSettingsPage'
import { AttendanceImportPage } from './pages/AttendanceImportPage'
import { AttendanceListPage } from './pages/AttendanceListPage'
import { AttendanceReportPage } from './pages/AttendanceReportPage'
import { BenefitsPage } from './pages/BenefitsPage'
import { CompliancePage } from './pages/CompliancePage'
import { DashboardPage } from './pages/DashboardPage'
import { DepartmentListPage } from './pages/DepartmentListPage'
import { DesignationListPage } from './pages/DesignationListPage'
import { EmployeeDetailPage } from './pages/EmployeeDetailPage'
import { EmployeeFormPage } from './pages/EmployeeFormPage'
import { EmployeeAnalyticsPage } from './pages/EmployeeAnalyticsPage'
import { EmployeeListPage } from './pages/EmployeeListPage'
import { EssLayout } from './layouts/EssLayout'
import { EssAttendancePage } from './pages/ess/EssAttendancePage'
import { EssBenefitsPage } from './pages/ess/EssBenefitsPage'
import { EssLeavePage } from './pages/ess/EssLeavePage'
import { EssDashboardPage } from './pages/ess/EssDashboardPage'
import { EssPayslipPage } from './pages/ess/EssPayslipPage'
import { EssPerformancePage } from './pages/ess/EssPerformancePage'
import { EssTrainingPage } from './pages/ess/EssTrainingPage'
import { HiringPipelinePage } from './pages/HiringPipelinePage'
import { JobPostingsListPage } from './pages/JobPostingsListPage'
import { LeaveApprovalsPage } from './pages/LeaveApprovalsPage'
import { LeaveManagementPage } from './pages/LeaveManagementPage'
import { LeaveHubProvider } from './leave/LeaveHubContext'
import { LoginPage } from './pages/LoginPage'
import { MasterDataCatalogPage } from './pages/MasterDataCatalogPage'
import { OnboardingListPage } from './pages/OnboardingListPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { OrganogramPage } from './pages/OrganogramPage'
import { PayrollReportPage } from './pages/PayrollReportPage'
import { PayrollRunsPage } from './pages/PayrollRunsPage'
import { PayslipPage } from './pages/PayslipPage'
import { PerformancePage } from './pages/PerformancePage'
import { RbacMatrixPage } from './pages/RbacMatrixPage'
import { RecruitmentPage } from './pages/RecruitmentPage'
import { ReportsPage } from './pages/ReportsPage'
import { RoadmapPage } from './pages/RoadmapPage'
import { ScheduleInterviewPage } from './pages/ScheduleInterviewPage'
import { SprintModulesPage } from './pages/SprintModulesPage'
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
                <RequirePermission permission="employee.view_self">
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
                path="payslip"
                element={
                  <RequirePermission permission="page:payslip">
                    <EssPayslipPage />
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
              <Route
                path="benefits"
                element={
                  <RequirePermission permission="page:benefits">
                    <EssBenefitsPage />
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
              <Route
                path="approvals"
                element={
                  <RequirePermission permission="page:leave:approvals">
                    <LeaveApprovalsPage />
                  </RequirePermission>
                }
              />
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
              path="payroll"
              element={
                <RequirePermission permission="page:payroll">
                  <PayrollRunsPage />
                </RequirePermission>
              }
            />
            <Route
              path="payslip"
              element={
                <RequirePermission permission="page:payslip">
                  <PayslipPage />
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
              path="reports/payroll"
              element={
                <RequirePermission permission="page:reports:payroll">
                  <PayrollReportPage />
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
                <RequirePermission permission="page:performance">
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
            <Route
              path="benefits"
              element={
                <RequirePermission permission="page:benefits">
                  <BenefitsPage />
                </RequirePermission>
              }
            />
            <Route
              path="compliance"
              element={
                <RequirePermission permission="page:compliance">
                  <CompliancePage />
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
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
