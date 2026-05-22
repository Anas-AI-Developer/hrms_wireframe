import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { DataListPanel } from '../components/hrms/DataListPanel'
import { HrmsListShell } from '../components/hrms/HrmsListShell'
import { RowActionsMenu } from '../components/hrms/RowActionsMenu'
import {
  canCreateAtLevel,
  canDeleteNode,
  deleteOrgNode,
} from '../data/organogramStore'
import { useWireframeData } from '../data/WireframeDataContext'
import { useListControls } from '../hooks/useListControls'
import { useOrganogramNodes } from '../hooks/useOrganogramNodes'
import {
  ORG_LEVEL_LABELS,
  ORG_STRUCTURE_ROUTES,
  ORG_TABLE_MAPPING_COLUMNS,
  getOrgAncestorAtLevel,
  orgMappingSearchText,
  orgNodesAtLevel,
  type OrgStructureRouteKey,
} from '../data/navttcHqOrganogram'
import type { NavttcOrgNode, OrgLevel } from '../data/navttcOrgTypes'
import type { Employee } from '../types/hrms'
import './pages.css'

function isOrgStructureRouteKey(key: string | undefined): key is OrgStructureRouteKey {
  return key != null && key in ORG_STRUCTURE_ROUTES
}

function employeeMatchesOrgNode(emp: Employee, node: NavttcOrgNode): boolean {
  switch (node.level) {
    case 'head':
      return emp.orgHeadId === node.id
    case 'wing':
      return emp.orgWingId === node.id
    case 'section':
      return emp.orgSectionId === node.id
    case 'sub_section_1':
      return emp.orgSubSection1Id === node.id
    case 'sub_section_2':
      return emp.orgSubSection2Id === node.id
    default:
      return false
  }
}

function countStaff(employees: Employee[], node: NavttcOrgNode): number {
  return employees.filter((e) => employeeMatchesOrgNode(e, node)).length
}

export function OrgStructurePage() {
  const { levelKey } = useParams<{ levelKey: string }>()
  const { employees } = useWireframeData()
  const { can } = useAuth()
  const canWrite = can('page:departments:write')
  const nodes = useOrganogramNodes()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const validKey = isOrgStructureRouteKey(levelKey)
  const config = validKey ? ORG_STRUCTURE_ROUTES[levelKey] : null
  const mappingColumns = validKey ? ORG_TABLE_MAPPING_COLUMNS[levelKey] : []
  const allNodes = useMemo(
    () => (config ? orgNodesAtLevel(config.level) : []),
    [config, nodes],
  )
  const allowCreate = Boolean(config && canWrite && canCreateAtLevel(config.level))

  const list = useListControls(allNodes, {
    searchFn: (n, q) => orgMappingSearchText(n, mappingColumns).includes(q.toLowerCase()),
    sortFns: {
      name: (a, b) => a.name.localeCompare(b.name),
      code: (a, b) => (a.code ?? '').localeCompare(b.code ?? ''),
    },
    defaultSortColumn: 'name',
  })

  const colSpan = 3 + mappingColumns.length + 1 + (canWrite ? 1 : 0)

  if (!validKey || !config) {
    return <Navigate to="/org/wings" replace />
  }

  function handleDelete(node: NavttcOrgNode) {
    const msg = `Delete "${node.name}" (${node.code ?? node.id})? This cannot be undone.`
    if (!window.confirm(msg)) return
    const result = deleteOrgNode(node.id)
    if ('error' in result) {
      setDeleteError(result.error)
      return
    }
    setDeleteError(null)
  }

  return (
    <HrmsListShell
      current={config.title}
      actions={
        allowCreate ? (
          <Link to={`/org/${levelKey}/new`} className="hrms-btn-primary">
            <i className="ri-add-line" aria-hidden /> Add {ORG_LEVEL_LABELS[config.level]}
          </Link>
        ) : undefined
      }
    >
      <header className="wf-page-head" style={{ marginBottom: '1rem' }}>
        <div>
          <h1 className="wf-h1">{config.title}</h1>
          <p className="wf-lead">{config.description}</p>
        </div>
      </header>

      {deleteError ? (
        <p className="hrms-form-alert" role="alert" style={{ marginBottom: '1rem' }}>
          {deleteError}
        </p>
      ) : null}

      <DataListPanel
        title={`${config.title} — ${allNodes.length} unit${allNodes.length === 1 ? '' : 's'}`}
        search={list.search}
        onSearchChange={list.setSearch}
        searchPlaceholder="Search name, code, or mapping…"
        showStatusFilter={false}
        hasActiveFilters={list.hasActiveFilters}
        onResetFilters={list.resetFilters}
        firstItem={list.firstItem}
        lastItem={list.lastItem}
        total={list.total}
        page={list.page}
        totalPages={list.totalPages}
        pageSize={list.pageSize}
        onPageSizeChange={list.setPageSize}
        onPageChange={list.setPage}
      >
        <div className="hrms-data-table-wrap">
          <table className="hrms-data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                {mappingColumns.map((col) => (
                  <th key={col.level}>{col.label}</th>
                ))}
                <th>Level</th>
                <th>Staff</th>
                {canWrite ? <th>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {list.pageRows.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="hrms-empty">
                    No {ORG_LEVEL_LABELS[config.level as OrgLevel].toLowerCase()} nodes match your search.
                  </td>
                </tr>
              ) : (
                list.pageRows.map((node) => {
                  const staff = countStaff(employees, node)
                  const showDelete = canWrite && canDeleteNode(node.id)
                  return (
                    <tr key={node.id}>
                      <td className="font-medium">{node.name}</td>
                      <td className="text-sm" style={{ color: '#64748b' }}>
                        {node.code ?? '—'}
                      </td>
                      {mappingColumns.map((col) => {
                        const ancestor = getOrgAncestorAtLevel(node, col.level)
                        return (
                          <td key={col.level} className="text-sm" style={{ color: '#64748b' }}>
                            {ancestor?.name ?? '—'}
                          </td>
                        )
                      })}
                      <td>
                        <span className="wf-pill">{ORG_LEVEL_LABELS[node.level]}</span>
                      </td>
                      <td>{staff}</td>
                      {canWrite ? (
                        <td>
                          <RowActionsMenu
                            id={node.id}
                            actions={[
                              { label: 'Edit', href: `/org/${levelKey}/${node.id}/edit` },
                              ...(showDelete
                                ? [
                                    {
                                      label: 'Delete',
                                      danger: true,
                                      onClick: () => handleDelete(node),
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </td>
                      ) : null}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {mappingColumns.length > 0 ? (
          <p className="hrms-list-footnote">
            Mapping: {mappingColumns.map((c) => c.label).join(' → ')} → {config.title}
          </p>
        ) : null}
      </DataListPanel>
    </HrmsListShell>
  )
}
