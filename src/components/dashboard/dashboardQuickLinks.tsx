import type { QuickAccessItem } from './QuickAccessGrid'
import {
  IconAttendance,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconChart,
  IconCheckCircle,
  IconUsers,
} from '../hrms/icons'

const iconCls = 'side-menu__icon'

export const DASHBOARD_QUICK_HR: QuickAccessItem[] = [
  {
    label: 'Wings',
    to: '/org/wings',
    permission: 'page:departments',
    icon: <IconBuilding className={iconCls} />,
    description: 'Director Generals (P&D, A&F, A&C, S&C)',
  },
  {
    label: 'Designations',
    to: '/designations',
    permission: 'page:designations',
    icon: <IconBriefcase className={iconCls} />,
    description: 'Sanctioned posts',
  },
  {
    label: 'Employees',
    to: '/employees',
    permission: 'page:employees',
    icon: <IconUsers className={iconCls} />,
    description: 'MasterList roster',
  },
  {
    label: 'Attendance',
    to: '/attendance',
    permission: 'page:attendance',
    icon: <IconAttendance className={iconCls} />,
    description: 'Monthly sheets',
  },
  {
    label: 'Leave Management',
    to: '/leave',
    permission: 'page:leave',
    icon: <IconCalendar className={iconCls} />,
    description: 'Leave requests',
  },
  {
    label: 'Job postings',
    to: '/jobs',
    permission: 'page:recruitment',
    icon: <IconBriefcase className={iconCls} />,
    description: 'Open positions',
  },
  {
    label: 'Hiring pipeline',
    to: '/hiring-pipeline',
    permission: 'page:recruitment',
    icon: <IconChart className={iconCls} />,
    description: 'Recruitment stages',
  },
  {
    label: 'Onboarding',
    to: '/onboarding',
    permission: 'page:onboarding',
    icon: <IconCheckCircle className={iconCls} />,
    description: 'Checklist & docs',
  },
]

