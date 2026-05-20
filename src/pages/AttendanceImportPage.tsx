import { Link } from 'react-router-dom'
import {
  CompactFormCard,
  CompactFormField,
  CompactFormFooter,
  CompactFormGrid,
  CompactFormInputWrap,
  CompactFormPage,
  CompactFormSection,
} from '../components/hrms/HrmsCompactForm'
import { ATTENDANCE_POLICY } from '../data/attendanceMock'
import './pages.css'

export function AttendanceImportPage() {
  return (
    <div className="wf-page">
      <div className="wf-breadcrumb">
        <Link to="/attendance">Attendance</Link>
        <span aria-hidden> / </span>
        <span>Import</span>
      </div>
      <h1 className="wf-h1">Import attendance sheet</h1>
      <p className="wf-lead">
        Upload Excel/CSV from biometric or manual registers. Wireframe only — no file is processed yet.
      </p>

      <CompactFormPage>
        <CompactFormCard
          icon="ri-upload-cloud-2-line"
          title="Upload register"
          description="Map columns to employee codes and clock times. Validation runs before merge."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert(
                'Wireframe: import would validate columns (employee code, date, in, out) and merge logs.',
              )
            }}
          >
            <CompactFormSection legend="File & defaults">
              <CompactFormGrid>
                <CompactFormField full label="File">
                  <CompactFormInputWrap>
                    <input type="file" accept=".xlsx,.xls,.csv" />
                  </CompactFormInputWrap>
                </CompactFormField>
                <CompactFormField
                  label="Default hours if missing"
                  hint={`Uses ${ATTENDANCE_POLICY.standardHours}h when in/out times are blank.`}
                >
                  <CompactFormInputWrap icon="ri-time-line">
                    <input
                      type="number"
                      defaultValue={ATTENDANCE_POLICY.standardHours}
                      min={1}
                      max={12}
                    />
                  </CompactFormInputWrap>
                </CompactFormField>
              </CompactFormGrid>
            </CompactFormSection>
            <CompactFormFooter>
              <Link className="hrms-ref-btn-secondary" to="/attendance">
                Cancel
              </Link>
              <button type="submit" className="hrms-btn-primary">
                <i className="ri-upload-2-line" aria-hidden />
                Import (mock)
              </button>
            </CompactFormFooter>
          </form>
        </CompactFormCard>
      </CompactFormPage>

      <p className="wf-note" style={{ marginTop: '1.25rem' }}>
        Expected columns: <code>EMP-####</code>, date, check-in, check-out. Rows with secondary job can set a
        flag column per admin policy.
      </p>
    </div>
  )
}
