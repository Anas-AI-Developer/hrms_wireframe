import { Outlet, useLocation } from 'react-router-dom'
import { EssSessionProvider } from '../ess/EssSessionContext'
import './EssLayout.css'

export function EssLayout() {
  const location = useLocation()
  const isDashboard = location.pathname === '/ess' || location.pathname === '/ess/'

  return (
    <EssSessionProvider>
      <div className={`ess-shell hrms-ref-page ${isDashboard ? '' : 'ess-shell--sub'}`}>
        <div className="ess-content">
          <Outlet />
        </div>
      </div>
    </EssSessionProvider>
  )
}
