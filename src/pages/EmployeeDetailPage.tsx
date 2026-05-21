import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { BENEFIT_TYPE_LABELS } from '../data/benefitsData'
import { useWireframeData } from '../data/WireframeDataContext'
import { StatusBadge } from '../components/hrms/StatusBadge'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import { homePathForRole } from '../portals/homePath'
import { employmentTypeLabel } from '../data/employmentStats'
import { formatOrgPlacementPath } from '../data/navttcHqOrganogram'
import {
  formatOfficePlacement,
  officePlacementFromEmployee,
} from '../data/navttcOfficeMapping'
import { formatRoleLevelLabel, getRoleLevelById } from '../data/navttcRoleLevels'
import { formatEmployeeDuration } from '../utils/serviceDuration'
import {
  getDepartment,
  getDesignation,
  getDirectReports,
  getEmployee,
  getEmployeeHistory,
} from '../data/mock'

type DetailFieldProps = {
  label: string
  children: ReactNode
}

function DetailField({ label, children }: DetailFieldProps) {
  return (
    <div className="hrms-detail-field">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

export function EmployeeDetailPage() {
  const { user, can, canViewEmployee } = useAuth()
  const canWrite = can('page:employees:write')
  const { id } = useParams<{ id: string }>()
  const { benefitDefinitions, departments, employeeBenefitEnrollments } = useWireframeData()
  const e = id ? getEmployee(id) : undefined
  const officeLabel = e
    ? formatOfficePlacement(officePlacementFromEmployee(e, departments))
    : ''
  const roleLevel = e?.roleLevelId ? getRoleLevelById(e.roleLevelId) : undefined

  const enrollments = useMemo(
    () =>
      id
        ? employeeBenefitEnrollments.filter((en) => en.employeeId === id && en.status === 'active')
        : [],
    [employeeBenefitEnrollments, id],
  )

  if (!e) {
    return (
      <div className="hrms-ref-page">
        <p className="hrms-list-footnote">Employee not found in roster data.</p>
        <Link to="/employees">Back to employees</Link>
      </div>
    )
  }

  if (!canViewEmployee(e)) {
    const fallback = user && can('page:employees') ? '/employees' : user ? homePathForRole(user.role) : '/login'
    return <Navigate to={fallback} replace />
  }

  const dept = getDepartment(e.departmentId)
  const des = getDesignation(e.designationId)
  const manager = e.managerId ? getEmployee(e.managerId) : undefined
  const reports = getDirectReports(e.id)
  const history = getEmployeeHistory(e.id)
  const displayReports = reports.slice(0, 15)

  return (
    <div className="hrms-ref-page hrms-ui-ref">
      <div className="hrms-breadcrumb-row">
        <nav aria-label="Breadcrumb">
          <ol className="hrms-breadcrumb">
            <li className="hrms-breadcrumb-item">
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li className="hrms-breadcrumb-item">
              <Link to="/employees">Employees</Link>
            </li>
            <li className="hrms-breadcrumb-item active" aria-current="page">
              {e.employeeNo}
            </li>
          </ol>
        </nav>
        <div className="hrms-breadcrumb-actions">
          <Link to="/employees" className="hrms-ref-btn-secondary">
            <i className="ri-arrow-left-line" aria-hidden /> Back to list
          </Link>
          {canWrite ? (
            <Link to={`/employees/${e.id}/edit`} className="hrms-btn-primary">
              <i className="ri-edit-line" aria-hidden /> Edit employee
            </Link>
          ) : null}
        </div>
      </div>

      <header className="hrms-emp-detail-head">
        <h1 className="hrms-emp-detail-head__title">
          {e.firstName} {e.lastName}
        </h1>
        <p className="hrms-emp-detail-head__meta">
          <a href={`mailto:${e.email}`}>{e.email}</a>
          <span aria-hidden>·</span>
          <code>{e.employeeNo}</code>
          <StatusBadge status={e.status} />
        </p>
      </header>

      <section className="hrms-list-summary" aria-label="Profile highlights">
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Office</span>
          <span className="hrms-list-summary__value">{officeLabel || e.location}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Sanctioned post</span>
          <span className="hrms-list-summary__value">{e.sanctionedPost ?? des?.title ?? '—'}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Employment type</span>
          <span className="hrms-list-summary__value">{employmentTypeLabel(e.employmentType)}</span>
        </article>
        <article className="hrms-list-summary__card">
          <span className="hrms-list-summary__label">Direct reports</span>
          <span className="hrms-list-summary__value hrms-list-summary__value--stat">
            {reports.length}
          </span>
        </article>
      </section>

      <div className="hrms-emp-detail-stack">
        <div className="hrms-emp-detail-panels">
          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Personal & employment</h2>
            </header>
            <div className="hrms-ref-panel-body">
              <dl className="hrms-detail-fields">
                <DetailField label="Employee code">
                  <code>{e.employeeNo}</code>
                </DetailField>
                {e.masterSerial != null ? (
                  <DetailField label="MasterList S.#">{e.masterSerial}</DetailField>
                ) : null}
                <DetailField label="Employment type">
                  {employmentTypeLabel(e.employmentType)}
                </DetailField>
                <DetailField label="Phone">{e.phone || '—'}</DetailField>
                <DetailField label="CNIC">{e.cnic ?? '—'}</DetailField>
                <DetailField label="Date of birth">{e.dateOfBirth ?? '—'}</DetailField>
                <DetailField label="Join date">{e.joinDate}</DetailField>
                <DetailField label="Duration">{formatEmployeeDuration(e)}</DetailField>
                <DetailField label="Mode of appointment">{e.modeOfAppointment ?? '—'}</DetailField>
              </dl>
            </div>
          </article>

          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Organization & post</h2>
            </header>
            <div className="hrms-ref-panel-body">
              <dl className="hrms-detail-fields">
                <DetailField label="Office">{officeLabel || e.location || '—'}</DetailField>
                <DetailField label="Organogram placement">
                  {e.orgWingId
                    ? formatOrgPlacementPath({
                        orgHeadId: e.orgHeadId,
                        orgWingId: e.orgWingId,
                        orgSectionId: e.orgSectionId,
                        orgSubSection1Id: e.orgSubSection1Id,
                        orgSubSection2Id: e.orgSubSection2Id,
                      }) || '—'
                    : dept
                      ? `${dept.name} (${dept.code}) — legacy`
                      : '—'}
                </DetailField>
                <DetailField label="Wing">{e.parentDepartment ?? '—'}</DetailField>
                <DetailField label="Section / unit">{e.section ?? '—'}</DetailField>
                <DetailField label="Role level (1–7)">
                  {roleLevel ? formatRoleLevelLabel(roleLevel) : '—'}
                </DetailField>
                <DetailField label="Sanctioned post">{e.sanctionedPost ?? des?.title ?? '—'}</DetailField>
                <DetailField label="Working as">{e.workingAs ?? '—'}</DetailField>
                <DetailField label="Actual post">{e.actualPost ?? '—'}</DetailField>
                <DetailField label="BPS">{e.bps ?? '—'}</DetailField>
                <DetailField label="Reporting manager">
                  {manager ? (
                    <Link to={`/employees/${manager.id}`}>
                      {manager.firstName} {manager.lastName}
                    </Link>
                  ) : (
                    '—'
                  )}
                </DetailField>
                <DetailField label="Status">
                  <StatusBadge status={e.status} />
                </DetailField>
              </dl>
            </div>
          </article>

          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Qualifications & tenure</h2>
            </header>
            <div className="hrms-ref-panel-body">
              <dl className="hrms-detail-fields">
                <DetailField label="Qualification">{e.qualification ?? '—'}</DetailField>
                <DetailField label="Parent department">{e.parentDepartment ?? '—'}</DetailField>
                <DetailField label="Tenure in NAVTTC">{e.tenureInNavttc ?? '—'}</DetailField>
                <DetailField label="Domicile">{e.domicile ?? '—'}</DetailField>
              </dl>
            </div>
          </article>

          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Benefits ({enrollments.length})</h2>
              <p className="hrms-ref-panel-desc">
                Standard package by employment type plus any additional enrollments
              </p>
            </header>
            <div className="hrms-ref-panel-body">
              {enrollments.length === 0 ? (
                <p className="hrms-list-footnote">No benefits assigned yet.</p>
              ) : (
                <ul className="hrms-emp-benefits__list">
                  {enrollments.map((en) => {
                    const def = benefitDefinitions.find((d) => d.id === en.benefitId)
                    if (!def) return null
                    return (
                      <li key={en.id}>
                        <span
                          className={`hrms-benefit-chip hrms-benefit-chip--${en.source === 'default' ? 'standard' : 'extra'} is-on`}
                        >
                          <span className="hrms-benefit-chip__body">
                            <span className="hrms-benefit-chip__name">{def.name}</span>
                            <span className="hrms-benefit-chip__meta">
                              {BENEFIT_TYPE_LABELS[def.type]} · {def.employerContribution}
                              {en.source === 'additional' ? ' · Additional' : ' · Standard'}
                            </span>
                          </span>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
              {can('page:benefits') ? (
                <p className="hrms-list-footnote" style={{ marginTop: '0.75rem' }}>
                  <Link to="/benefits">Manage benefit catalog & defaults</Link>
                </p>
              ) : null}
            </div>
          </article>
        </div>

        {reports.length > 0 ? (
          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Direct reports ({reports.length})</h2>
              <p className="hrms-ref-panel-desc">Team members reporting to this employee</p>
            </header>
            <div className="hrms-ref-panel-body">
              <div className="hrms-data-table-wrap">
                <table className="hrms-data-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Code</th>
                      <th>Post</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayReports.map((r) => (
                      <tr key={r.id}>
                        <td className="font-medium">
                          <Link
                            to={`/employees/${r.id}`}
                            style={{ color: '#2f4798', textDecoration: 'none' }}
                          >
                            {r.firstName} {r.lastName}
                          </Link>
                        </td>
                        <td>
                          <code>{r.employeeNo}</code>
                        </td>
                        <td>{r.sanctionedPost ?? '—'}</td>
                        <td>
                          <StatusBadge status={r.status} />
                        </td>
                        <td>
                          <RowActionsMenu
                            id={r.id}
                            actions={[{ label: 'View profile', href: `/employees/${r.id}` }]}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reports.length > displayReports.length ? (
                <p className="hrms-emp-reports-note">
                  Showing {displayReports.length} of {reports.length}.{' '}
                  <Link to="/employees">Browse full roster</Link>
                </p>
              ) : null}
            </div>
          </article>
        ) : null}

        {history.length > 0 ? (
          <article className="hrms-ref-panel">
            <header className="hrms-ref-panel-head">
              <h2 className="hrms-ref-panel-title">Change history</h2>
              <p className="hrms-ref-panel-desc">Recent updates to post, department, or status</p>
            </header>
            <div className="hrms-ref-panel-body">
              <div className="hrms-data-table-wrap">
                <table className="hrms-data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Field</th>
                      <th>From</th>
                      <th>To</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id}>
                        <td className="text-sm" style={{ color: '#64748b' }}>
                          {h.date}
                        </td>
                        <td style={{ textTransform: 'capitalize' }}>{h.field}</td>
                        <td>{h.fromLabel}</td>
                        <td>{h.toLabel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  )
}
