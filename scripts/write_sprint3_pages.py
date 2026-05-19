#!/usr/bin/env python3
"""Generate Sprint 3 HR module pages (no framer-motion)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGES = ROOT / "src" / "pages"

FILES = {
    "PerformancePage.tsx": r'''import { useAuth } from '../auth/AuthContext'
import { appraisalCycles, performanceGoals } from '../data/performanceMock'
import './pages.css'

export function PerformancePage() {
  const { can, user, actorEmployeeId } = useAuth()
  const canManage = can('page:performance:manage')
  const canAppraise = can('performance.appraise')
  const canSelf = can('performance.self_review')
  const isEmployee = user?.role === 'employee'

  const myGoals = actorEmployeeId
    ? performanceGoals.filter((g) => g.employeeId === actorEmployeeId)
    : []

  const teamGoals = canAppraise && !isEmployee ? performanceGoals : []

  return (
    <div className="wf-page wf-page--wide">
      <h1 className="wf-h1">Performance</h1>
      <p className="wf-lead">
        Appraisal cycles, goals, self-review, and manager ratings. HR opens cycles; managers appraise; staff submit
        self-ratings.
      </p>

      {canManage ? (
        <section className="wf-section">
          <h2 className="wf-h2">Appraisal cycles (HR)</h2>
          <motion.div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Cycle</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appraisalCycles.map((c) => (
                  <tr key={c.id}>
                    <td>{c.title}</td>
                    <td>{c.startDate}</td>
                    <td>{c.endDate}</td>
                    <td>
                      <span className={`wf-pill wf-pill--${c.status === 'open' ? 'active' : 'inactive'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
          <p style={{ marginTop: '0.75rem' }}>
            <button type="button" className="wf-btn wf-btn--primary" onClick={() => alert('Wireframe: open new cycle')}>
              Open cycle (mock)
            </button>
          </p>
        </section>
      ) : null}

      {canSelf && isEmployee ? (
        <section className="wf-section">
          <h2 className="wf-h2">My goals & self-review</h2>
          {myGoals.length === 0 ? (
            <p className="wf-note">No goals assigned for this demo account.</p>
          ) : (
            <motion.div className="wf-table-wrap">
              <table className="wf-table">
                <thead>
                  <tr>
                    <th>Goal</th>
                    <th>Target</th>
                    <th>Self rating</th>
                    <th>Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {myGoals.map((g) => (
                    <tr key={g.id}>
                      <td>{g.goalTitle}</td>
                      <td>{g.target}</td>
                      <td>{g.selfRating ?? '—'}</td>
                      <td>{g.managerRating ?? 'Pending'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
          <button type="button" className="wf-btn wf-btn--primary" style={{ marginTop: '0.75rem' }} onClick={() => alert('Wireframe: submit self-review')}>
            Submit self-review (mock)
          </button>
        </section>
      ) : null}

      {canAppraise && teamGoals.length > 0 ? (
        <section className="wf-section">
          <h2 className="wf-h2">Team goals (manager appraisal)</h2>
          <motion.div className="wf-table-wrap">
            <table className="wf-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Goal</th>
                  <th>Self</th>
                  <th>Manager rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {teamGoals.map((g) => (
                  <tr key={g.id}>
                    <td>{g.employeeName}</td>
                    <td>{g.goalTitle}</td>
                    <td>{g.selfRating ?? '—'}</td>
                    <td>{g.managerRating ?? '—'}</td>
                    <td>
                      <button type="button" className="wf-btn" onClick={() => alert(`Rate ${g.employeeName} (mock)`)}>
                        Rate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </section>
      ) : null}

      {!canManage && !canSelf && !canAppraise ? (
        <p className="wf-note">You do not have performance permissions for this role.</p>
      ) : null}
    </div>
  )
}
''',
}

def strip_motion(text: str) -> str:
    return text.replace("motion.div", "motion.div".replace("motion.", "")).replace("<motion.", "<").replace("</motion.", "</")

# Fix the broken replace - do it properly
def strip_motion(text: str) -> str:
    import re
    text = re.sub(r"</?motion\.(\w+)", r"<\1" if text.startswith("<") else r"</\1", text)  # wrong
    return text.replace("motion.div", "motion.div")  # placeholder

def strip_motion(text: str) -> str:
    return text.replace("motion.", "")

for name, content in FILES.items():
    content = strip_motion(content)
    (PAGES / name).write_text(content, encoding="utf-8")
    print("wrote", name)
