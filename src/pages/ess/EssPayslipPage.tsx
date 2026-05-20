import { useAuth } from '../../auth/AuthContext'
import { PayslipEmptyState, PayslipView } from '../../components/payslip/PayslipView'
import { getEmployee } from '../../data/mock'
import { getEssPayslip } from '../../data/essSeed'
import '../../styles/ess-payslip.css'

export function EssPayslipPage() {
  const { actorEmployeeId } = useAuth()
  const employeeId = actorEmployeeId ?? ''
  const profile = employeeId ? getEmployee(employeeId) : undefined
  const slip = employeeId ? getEssPayslip(employeeId) : null

  return (
    <div className="ess-page ess-payslip-page">
      {slip ? <PayslipView slip={slip} profile={profile} /> : <PayslipEmptyState />}
    </div>
  )
}
