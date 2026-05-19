import type { ReactNode } from 'react'
import type { Permission } from '../../auth/types'
import {
  IconAttendance,
  IconBriefcase,
  IconBuilding,
  IconCalendar,
  IconChart,
  IconCheckCircle,
  IconDashboard,
  IconSettings,
  IconUsers,
} from './icons'

export type NavItemDef = {
  to: string
  label: string
  permission: Permission
  icon: ReactNode
  end?: boolean
}

export type NavGroupDef = {
  label: string
  accent?: 'overview' | 'administration'
  items: NavItemDef[]
}

export const HR_NAV_GROUPS: NavGroupDef[] = [
  {
    label: 'Overview',
    accent: 'overview',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        permission: 'page:dashboard',
        icon: <IconDashboard />,
        end: true,
      },
    ],
  },
  {
    label: 'Human Resources',
    accent: 'administration',
    items: [
      {
        to: '/departments',
        label: 'Departments',
        permission: 'page:departments',
        icon: <IconBuilding />,
      },
      {
        to: '/designations',
        label: 'Designations',
        permission: 'page:designations',
        icon: <IconBriefcase />,
      },
      {
        to: '/employees',
        label: 'Employees',
        permission: 'page:employees',
        icon: <IconUsers />,
      },
      {
        to: '/attendance',
        label: 'Attendance',
        permission: 'page:attendance',
        icon: <IconAttendance />,
      },
      {
        to: '/leave',
        label: 'Leave Management',
        permission: 'page:leave',
        icon: <IconCalendar />,
      },
      {
        to: '/jobs',
        label: 'Job postings',
        permission: 'page:recruitment',
        icon: <IconBriefcase />,
      },
      {
        to: '/hiring-pipeline',
        label: 'Hiring pipeline',
        permission: 'page:recruitment',
        icon: <IconChart />,
      },
      {
        to: '/schedule-interview',
        label: 'Schedule interview',
        permission: 'page:recruitment',
        icon: <IconCalendar />,
      },
      {
        to: '/onboarding',
        label: 'Onboarding',
        permission: 'page:onboarding',
        icon: <IconCheckCircle />,
      },
    ],
  },
]

export const PLANNING_NAV_GROUP: NavGroupDef = {
  label: 'Planning & reference',
  items: [
    { to: '/roadmap', label: 'Delivery phases', permission: 'page:roadmap', icon: <IconChart /> },
    { to: '/modules', label: 'Sprint modules', permission: 'page:modules', icon: <IconChart /> },
    { to: '/organogram', label: 'HQ organogram', permission: 'page:organogram', icon: <IconBuilding /> },
    { to: '/master-data', label: 'Client workbook', permission: 'page:master_data', icon: <IconBuilding /> },
  ],
}

export const CONFIG_NAV_GROUP: NavGroupDef = {
  label: 'Configuration',
  accent: 'administration',
  items: [
    {
      to: '/admin/settings',
      label: 'Admin settings',
      permission: 'page:admin_settings',
      icon: <IconSettings />,
    },
    {
      to: '/admin/rbac',
      label: 'Roles & permissions',
      permission: 'page:rbac',
      icon: <IconUsers />,
    },
  ],
}

export const ESS_NAV: NavItemDef[] = [
  {
    to: '/ess',
    label: 'My dashboard',
    permission: 'page:dashboard',
    icon: <IconDashboard />,
    end: true,
  },
  {
    to: '/ess/leave',
    label: 'My leave',
    permission: 'page:dashboard',
    icon: <IconCalendar />,
  },
]
