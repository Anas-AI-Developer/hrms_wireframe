#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "pages"

def strip(s: str) -> str:
    return s.replace("motion.", "")

ATTENDANCE = strip(r'''
import { attendanceByCentre, attendanceReportMonth } from '../data/reportsAnalyticsMock'
import './pages.css'

export function AttendanceReportPage() {
  const totals = attendanceByCentre.reduce(
    (acc, r) => ({
      present: acc.present + r.present,
      absent: acc.absent + r.absent,
      late: acc.late + r.late,
      onLeave: acc.onLeave + r.onLeave,
    }),
    { present: 0, absent: 0, late: 0, onLeave: 0 },
  )

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Attendance report</h1>
      <p className="wf-lead">
        Monthly summary by centre — present, absent, late, and on leave. Source: sheet import + manual logs (wireframe).
      </p>
      <p className="wf-note">Period: <strong>{attendanceReportMonth}</strong></p>

      <div className="wf-grid wf-grid--4" style={{ marginBottom: '1.25rem' }}>
        <article className="wf-card wf-card--flat">
          <motion.div className="wf-card-kicker">Present</motion.div>
          <div className="wf-card-stat">{totals.present}</div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Absent</div>
          <div className="wf-card-stat">{totals.absent}</motion.div>
        </article>
        <article className="wf-card wf-card--flat">
          <div className="wf-card-kicker">Late</div>
          <div className="wf-card-stat">{totals.late}</div>
        </article>
        <article className="wf-card wf-card--flat">
          <motion.div className="wf-card-kicker">On leave</div>
          <div className="wf-card-stat">{totals.onLeave}</div>
        </article>
      </div>

      <section className="wf-section">
        <h2 className="wf-h2">By centre</h2>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead>
              <tr>
                <th>Centre</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
                <th>On leave</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {attendanceByCentre.map((r) => (
                <tr key={r.centre}>
                  <td>{r.centre}</td>
                  <td>{r.present}</td>
                  <td>{r.absent}</td>
                  <td>{r.late}</td>
                  <td>{r.onLeave}</td>
                  <td>{r.attendanceRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: export CSV')}>
          Export (mock)
        </button>
      </section>
    </div>
  )
}
''')

# Fix broken tags in ATTENDANCE manually - the strip left some broken tags. Rewrite ATTENDANCE cleanly below.
