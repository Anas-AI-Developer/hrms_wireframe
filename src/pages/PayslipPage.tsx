import { useAuth } from '../auth/AuthContext'
import { PageBreadcrumb } from '../components/hrms/PageBreadcrumb'
import { PayslipEmptyState, PayslipView } from '../components/payslip/PayslipView'
import { getEmployee } from '../data/mock'
import { getPayslipForEmployee } from '../data/payrollMock'
import '../styles/ess-payslip.css'

export function PayslipPage() {
  const { user, actorEmployeeId } = useAuth()
  const employeeId = actorEmployeeId ?? 'm-1'
  const profile = getEmployee(employeeId)
  const slip = getPayslipForEmployee(employeeId)
  return (
    <div className="hrms-ref-page ess-payslip-page">
      <PageBreadcrumb
        current="Payslip"
        dashboardHref={user?.role === 'employee' ? '/ess' : '/dashboard'}
      />
      {slip ? <PayslipView slip={slip} profile={profile} /> : <PayslipEmptyState />}
    </div>
  )
}
