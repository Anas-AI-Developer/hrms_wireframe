import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './auth/RequireAuth'
import { RequirePermission } from './auth/RequirePermission'
import { AppLayout } from './layouts/AppLayout'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { DashboardPage } from './pages/DashboardPage'
import { DepartmentListPage } from './pages/DepartmentListPage'
import { DesignationListPage } from './pages/DesignationListPage'
import { EmployeeDetailPage } from './pages/EmployeeDetailPage'
import { EmployeeFormPage } from './pages/EmployeeFormPage'
import { EmployeeListPage } from './pages/EmployeeListPage'
import { LoginPage } from './pages/LoginPage'
import { MasterDataCatalogPage } from './pages/MasterDataCatalogPage'
import { OrganogramPage } from './pages/OrganogramPage'
import { RoadmapPage } from './pages/RoadmapPage'
import { SprintModulesPage } from './pages/SprintModulesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="access-denied" element={<AccessDeniedPage />} />
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <RequirePermission permission="page:dashboard">
                  <DashboardPage />
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
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
