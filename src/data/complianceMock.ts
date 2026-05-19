export type ComplianceRegister = {
  id: string
  name: string
  authority: string
  dueDate: string
  lastFiled: string
  status: 'compliant' | 'due_soon' | 'overdue'
}

export const complianceRegisters: ComplianceRegister[] = [
  {
    id: 'cr-1',
    name: 'EOBI monthly contribution',
    authority: 'EOBI',
    dueDate: '2026-05-15',
    lastFiled: '2026-04-10',
    status: 'compliant',
  },
  {
    id: 'cr-2',
    name: 'Social security returns',
    authority: 'SESSI',
    dueDate: '2026-05-20',
    lastFiled: '2026-04-12',
    status: 'due_soon',
  },
  {
    id: 'cr-3',
    name: 'Annual tax certificate (employer)',
    authority: 'FBR',
    dueDate: '2026-07-31',
    lastFiled: '2025-07-28',
    status: 'compliant',
  },
]
