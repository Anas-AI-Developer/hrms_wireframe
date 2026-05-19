import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { HomeRedirect } from './components/HomeRedirect'
import { RequireAuth } from './auth/RequireAuth'
import { RequirePermission } from './auth/RequirePermission'
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
import { SystemProposalPage } from './pages/SystemProposalPage'
import { PerformancePage } from './pages/PerformancePage'
import { TrainingPage } from './pages/TrainingPage'
import { BenefitsPage } from './pages/BenefitsPage'
import { CompliancePage } from './pages/CompliancePage'
import { AttendanceReportPage } from './pages/AttendanceReportPage'
import { PayrollReportPage } from './pages/PayrollReportPage'
import { EmployeeAnalyticsPage } from './pages/EmployeeAnalyticsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="access-denied" element={<AccessDeniedPage />} />
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
                  <LeaveRequestsPage />
                </RequirePermission>
              }
            />
            <Route
              path="leave/approvals"
              element={
                <RequirePermission permission="page:leave:approvals">
                  <LeaveApprovalsPage />
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
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
