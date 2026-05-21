import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './auth/AuthContext'
import { WireframeDataProvider } from './data/WireframeDataContext'
import './index.css'
import './styles/hrms-ref.css'
import './styles/hrms-compact-form.css'
import './styles/sidebar.css'
import './styles/dashboard.css'
import './styles/ess-leave.css'
import './styles/ess-attendance.css'
import './styles/ess-payslip.css'
import './styles/benefits.css'
import './styles/attendance-history-page.css'
import './styles/admin-settings.css'
import './styles/employee-org-placement.css'
import './styles/organogram-mapping.css'
import './styles/rbac-matrix.css'
import './styles/ess-requests.css'
import './styles/ess-performance.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <WireframeDataProvider>
        <App />
      </WireframeDataProvider>
    </AuthProvider>
  </StrictMode>,
)
