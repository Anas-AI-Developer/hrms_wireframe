import { Link } from 'react-router-dom'
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

      <form
        className="wf-form"
        onSubmit={(e) => {
          e.preventDefault()
          alert('Wireframe: import would validate columns (employee code, date, in, out) and merge logs.')
        }}
      >
        <label className="wf-field wf-field--full">
          <span>File</span>
          <input type="file" accept=".xlsx,.xls,.csv" />
        </label>
        <label className="wf-field">
          <span>Default hours if missing</span>
          <input type="number" defaultValue={ATTENDANCE_POLICY.standardHours} min={1} max={12} />
        </label>
        <div className="wf-form-actions">
          <Link className="wf-btn wf-btn--ghost" to="/attendance">
            Cancel
          </Link>
          <button type="submit" className="wf-btn wf-btn--primary">
            Import (mock)
          </button>
        </div>
      </form>

      <p className="wf-note">
        Expected columns: <code>EMP-####</code>, date, check-in, check-out. Rows with secondary job can set a flag
        column per admin policy.
      </p>
    </div>
  )
}
