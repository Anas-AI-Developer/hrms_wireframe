#!/usr/bin/env python3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src" / "pages" / "ess"

def w(name: str, body: str):
    text = body.strip() + "\n"
    text = text.replace("motion.", "")
    (ROOT / name).write_text(text, encoding="utf-8")
    print("wrote", name)

w("EssOverviewPage.tsx", r'''
import { Link } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { getEmployee } from '../../data/mock'
import {
  getEssAttendance,
  getEssBenefits,
  getEssLeaveRequests,
  getEssOpenCycle,
  getEssPayslip,
  getEssTraining,
} from '../../data/essSeed'
import { LEAVE_TYPE_LABELS } from '../../data/leaveMock'
import '../pages.css'

export function EssOverviewPage() {
  const { actorEmployeeId, can } = useAuth()
  const employeeId = actorEmployeeId ?? ''
  const profile = employeeId ? getEmployee(employeeId) : undefined
  const leaves = employeeId ? getEssLeaveRequests(employeeId) : []
  const pendingLeave = leaves.filter((r) => r.status === 'pending').length
  const attendance = employeeId ? getEssAttendance(employeeId) : []
  const present = attendance.filter((a) => a.status === 'present' || a.status === 'late').length
  const slip = employeeId ? getEssPayslip(employeeId) : null
  const training = employeeId ? getEssTraining(employeeId) : []
  const benefits = employeeId ? getEssBenefits(employeeId) : []
  const cycle = getEssOpenCycle()

  if (!profile) {
    return (
      <div className="hrms-portal-panel">
        <p className="wf-note wf-note--warn">
          No employee record linked. Try <strong>emp.deo</strong> / password <strong>11223344</strong>.
        </p>
      </div>
    )
  }

  return (
    <motion.div>
      <section className="hrms-portal-panel" style={{ maxWidth: 'none', marginBottom: '1.25rem' }}>
        <header className="hrms-portal-panel__header">
          <h2 className="hrms-portal-panel__title">Welcome back</h2>
          <p className="hrms-portal-panel__subtitle">Use the tabs above for each self-service module.</p>
        </header>
        <div className="hrms-portal-panel__body">
          <div className="wf-grid wf-grid--3">
            {can('page:leave') ? (
              <article className="wf-card wf-card--flat">
                <div className="wf-card-kicker">Leave</div>
                <motion.div className="wf-card-stat">{pendingLeave}</motion.div>
                <Link className="wf-card-link" to="/ess/leave">My leave →</Link>
              </article>
            ) : null}
            {can('page:attendance') ? (
              <article className="wf-card wf-card--flat">
                <div className="wf-card-kicker">Attendance</div>
                <div className="wf-card-stat">{present}</div>
                <Link className="wf-card-link" to="/ess/attendance">My attendance →</Link>
              </article>
            ) : null}
            {can('page:payslip') && slip ? (
              <article className="wf-card wf-card--flat">
                <div className="wf-card-kicker">Payslip</div>
                <div className="wf-card-desc">{slip.periodLabel}</div>
                <Link className="wf-card-link" to="/ess/payslip">My payslip →</Link>
              </article>
            ) : null}
          </motion.div>
        </div>
      </section>
      {leaves.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Recent leave</h2>
          <div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr>
              </thead>
              <tbody>
                {leaves.slice(0, 3).map((r) => (
                  <tr key={r.id}>
                    <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                    <td>{r.fromDate} → {r.toDate}</td>
                    <td>{r.days}</td>
                    <td><span className="wf-pill">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      <p className="wf-note">Cycle: {cycle?.title} · Training {training.length} · Benefits {benefits.length}</p>
    </motion.div>
  )
}
''')

w("EssLeavePage.tsx", r'''
import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { getEssLeaveBalance, getEssLeaveRequests } from '../../data/essSeed'
import { LEAVE_TYPE_LABELS, type LeaveTypeId } from '../../data/leaveMock'
import '../pages.css'

export function EssLeavePage() {
  const { actorEmployeeId } = useAuth()
  const employeeId = actorEmployeeId ?? ''
  const balance = employeeId ? getEssLeaveBalance(employeeId) : null
  const requests = employeeId ? getEssLeaveRequests(employeeId) : []
  const [draftType, setDraftType] = useState<LeaveTypeId>('casual')

  return (
    <motion.div>
      <h2 className="wf-h2">My leave</h2>
      <p className="wf-lead">Balances, submit requests, and track approval (manager → HR).</p>
      {balance ? (
        <section className="wf-section">
          <h3 className="wf-h2" style={{ fontSize: '1rem' }}>Leave balance</h3>
          <div className="wf-grid wf-grid--4">
            <article className="wf-card wf-card--flat"><div className="wf-card-kicker">Casual</motion.div><div className="wf-card-stat">{balance.casual}</div></article>
            <article className="wf-card wf-card--flat"><motion.div className="wf-card-kicker">Sick</div><div className="wf-card-stat">{balance.sick}</div></article>
            <article className="wf-card wf-card--flat"><div className="wf-card-kicker">Annual</div><div className="wf-card-stat">{balance.annual}</div></article>
            <article className="wf-card wf-card--flat"><div className="wf-card-kicker">Emergency</div><div className="wf-card-stat">{balance.emergency}</div></article>
          </motion.div>
          <form className="wf-form" style={{ marginTop: '1rem' }} onSubmit={(e) => { e.preventDefault(); alert('Wireframe: leave submitted') }}>
            <div className="wf-form-grid">
              <label className="wf-field"><span>Type</span>
                <select value={draftType} onChange={(ev) => setDraftType(ev.target.value as LeaveTypeId)}>
                  {(Object.keys(LEAVE_TYPE_LABELS) as LeaveTypeId[]).map((t) => (
                    <option key={t} value={t}>{LEAVE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </label>
              <label className="wf-field"><span>From</span><input type="date" defaultValue="2026-05-20" /></label>
              <label className="wf-field"><span>To</span><input type="date" defaultValue="2026-05-21" /></label>
              <label className="wf-field wf-field--full"><span>Reason</span><input type="text" placeholder="Brief reason" defaultValue="Personal" /></label>
            </div>
            <button type="submit" className="wf-btn wf-btn--primary">Submit request</button>
          </form>
        </section>
      ) : null}
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>My requests</h3>
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td>{LEAVE_TYPE_LABELS[r.leaveType]}</td>
                  <td>{r.fromDate}</td>
                  <td>{r.toDate}</td>
                  <td>{r.days}</td>
                  <td>{r.reason}</td>
                  <td><span className="wf-pill">{r.status}</span></td>
                  <td>{r.approverNote ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </motion.div>
  )
}
''')

w("EssAttendancePage.tsx", r'''
import { useAuth } from '../../auth/AuthContext'
import { ATTENDANCE_POLICY, getEssAttendance } from '../../data/essSeed'
import '../pages.css'

const STATUS_LABEL: Record<string, string> = {
  present: 'Present', absent: 'Absent', late: 'Late', on_leave: 'On leave', half_day: 'Half day',
}

export function EssAttendancePage() {
  const { actorEmployeeId } = useAuth()
  const logs = actorEmployeeId ? getEssAttendance(actorEmployeeId) : []
  const present = logs.filter((l) => l.status === 'present').length
  const late = logs.filter((l) => l.status === 'late').length
  const absent = logs.filter((l) => l.status === 'absent').length

  return (
    <motion.div>
      <h2 className="wf-h2">My attendance</h2>
      <p className="wf-lead">Standard day {ATTENDANCE_POLICY.standardHours}h ({ATTENDANCE_POLICY.coreStart}–{ATTENDANCE_POLICY.coreEnd}).</p>
      <div className="wf-grid wf-grid--3" style={{ marginBottom: '1rem' }}>
        <article className="wf-card wf-card--flat"><div className="wf-card-kicker">Present</div><div className="wf-card-stat">{present}</div></article>
        <article className="wf-card wf-card--flat"><div className="wf-card-kicker">Late</div><div className="wf-card-stat">{late}</motion.div></article>
        <article className="wf-card wf-card--flat"><div className="wf-card-kicker">Absent</div><motion.div className="wf-card-stat">{absent}</div></article>
      </motion.div>
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Hours</th><th>Status</th><th>Source</th><th>Note</th></tr></thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.date}</td>
                <td>{l.checkIn}</td>
                <td>{l.checkOut}</td>
                <td>{l.hoursWorked}</td>
                <td>{STATUS_LABEL[l.status] ?? l.status}</td>
                <td>{l.source}</td>
                <td>{l.note ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      <button type="button" className="wf-btn wf-btn--ghost" onClick={() => alert('Wireframe: mark attendance')}>Mark today (mock)</button>
    </motion.div>
  )
}
''')

w("EssPayslipPage.tsx", r'''
import { useAuth } from '../../auth/AuthContext'
import { getEmployee } from '../../data/mock'
import { getEssPayslip } from '../../data/essSeed'
import { getPayrollRun } from '../../data/payrollMock'
import '../pages.css'

function formatPkr(n: number) {
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(n)
}

export function EssPayslipPage() {
  const { actorEmployeeId } = useAuth()
  const employeeId = actorEmployeeId ?? ''
  const profile = employeeId ? getEmployee(employeeId) : undefined
  const slip = employeeId ? getEssPayslip(employeeId) : null
  const run = slip ? getPayrollRun(slip.runId) : undefined

  if (!slip) return <p className="wf-note">No payslip for this account.</p>

  return (
    <motion.div>
      <h2 className="wf-h2">My payslip</h2>
      <p className="wf-lead">{slip.periodLabel} · Paid {slip.payDate}</p>
      {profile ? <p className="wf-card-desc">{profile.employeeNo} · BPS {profile.bps ?? '—'}</p> : null}
      {run ? <p className="wf-note">Payroll run status: {run.status} · Posted by {run.runBy}</p> : null}
      <article className="wf-card wf-card--flat" style={{ maxWidth: '32rem' }}>
        <div className="wf-card-kicker">Net pay</div>
        <div className="wf-card-stat">{formatPkr(slip.netPay)}</div>
        <div className="wf-card-desc">Basic {formatPkr(slip.basic)}</div>
        <table className="wf-table" style={{ marginTop: '1rem' }}>
          <thead><tr><th>Component</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
          <tbody>
            {slip.lines.map((line) => (
              <tr key={line.label}>
                <td>{line.label}</td>
                <td style={{ textAlign: 'right' }}>{formatPkr(Math.abs(line.amount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </article>
      <button type="button" className="wf-btn wf-btn--ghost" style={{ marginTop: '1rem' }} onClick={() => alert('Wireframe: download PDF')}>Download PDF (mock)</button>
    </motion.div>
  )
}
''')

w("EssPerformancePage.tsx", r'''
import { useAuth } from '../../auth/AuthContext'
import { getEssGoals, getEssOpenCycle } from '../../data/essSeed'
import '../pages.css'

export function EssPerformancePage() {
  const { actorEmployeeId } = useAuth()
  const cycle = getEssOpenCycle()
  const goals = actorEmployeeId ? getEssGoals(actorEmployeeId) : []

  return (
    <motion.div>
      <h2 className="wf-h2">My performance</h2>
      <p className="wf-lead">Goals and self-assessment for the open appraisal cycle.</p>
      <article className="wf-card wf-card--flat" style={{ marginBottom: '1rem' }}>
        <div className="wf-card-kicker">Open cycle</div>
        <div className="wf-card-desc">{cycle.title} · {cycle.startDate} to {cycle.endDate} · {cycle.status}</div>
      </article>
      {goals.length === 0 ? (
        <p className="wf-note">No goals assigned yet.</p>
      ) : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Goal</th><th>Target</th><th>Self rating</th><th>Manager</th><th /></tr></thead>
            <tbody>
              {goals.map((g) => (
                <tr key={g.id}>
                  <td>{g.goalTitle}</td>
                  <td>{g.target}</td>
                  <td>{g.selfRating ?? 'Not submitted'}</td>
                  <td>{g.managerRating ?? 'Pending'}</td>
                  <td><button type="button" className="wf-link-quiet" onClick={() => alert('Wireframe: save self rating')}>Rate</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
      <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '1rem' }} onClick={() => alert('Wireframe: submit self-assessment')}>Submit self-assessment</button>
    </motion.div>
  )
}
''')

w("EssTrainingPage.tsx", r'''
import { useAuth } from '../../auth/AuthContext'
import { getEssTraining, trainingCatalog } from '../../data/essSeed'
import '../pages.css'

export function EssTrainingPage() {
  const { actorEmployeeId } = useAuth()
  const mine = actorEmployeeId ? getEssTraining(actorEmployeeId) : []
  const open = trainingCatalog.filter((c) => c.status === 'open')

  return (
    <motion.div>
      <h2 className="wf-h2">My training</h2>
      <p className="wf-lead">Nominate for open courses; track approval and completion.</p>
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>My nominations</h3>
        {mine.length === 0 ? <p className="wf-note">No nominations yet.</p> : (
          <ul className="wf-list">
            {mine.map((e) => (
              <li key={e.id}>{e.courseTitle} — <span className="wf-pill">{e.status}</span></li>
            ))}
          </ul>
        )}
      </section>
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>Open courses</h3>
        <div className="wf-grid wf-grid--2">
          {open.map((c) => (
            <article key={c.id} className="wf-card wf-card--flat">
              <h4 className="wf-h2" style={{ fontSize: '1rem' }}>{c.title}</h4>
              <p className="wf-card-desc">{c.provider} · {c.durationDays} day(s) · {c.enrolled}/{c.capacity} seats</p>
              <button type="button" className="wf-btn wf-btn--ghost" onClick={() => alert(`Nominated: ${c.title}`)}>Nominate</button>
            </article>
          ))}
        </motion.div>
      </section>
    </motion.div>
  )
}
''')

w("EssBenefitsPage.tsx", r'''
import { useAuth } from '../../auth/AuthContext'
import { benefitPlans } from '../../data/benefitsMock'
import { getEssBenefits } from '../../data/essSeed'
import '../pages.css'

export function EssBenefitsPage() {
  const { actorEmployeeId } = useAuth()
  const mine = actorEmployeeId ? getEssBenefits(actorEmployeeId) : []

  return (
    <motion.div>
      <h2 className="wf-h2">My benefits</h2>
      <p className="wf-lead">Active enrollments and available organization plans.</p>
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>My enrollments</h3>
        {mine.length === 0 ? <p className="wf-note">No enrollments on file.</p> : (
          <motion.div className="wf-table-wrap">
            <table className="wf-table">
              <thead><tr><th>Plan</th><th>Since</th><th>Status</th></tr></thead>
              <tbody>
                {mine.map((b) => (
                  <tr key={b.id}><td>{b.planName}</td><td>{b.enrolledSince}</td><td><span className="wf-pill">{b.status}</span></td></tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </section>
      <section className="wf-section">
        <h3 className="wf-h2" style={{ fontSize: '1rem' }}>Organization plans (reference)</h3>
        <ul className="wf-list">
          {benefitPlans.filter((p) => p.status === 'active').map((p) => (
            <li key={p.id}>{p.name} ({p.type}) — {p.employerContribution}</li>
          ))}
        </ul>
      </section>
    </motion.div>
  )
}
''')
