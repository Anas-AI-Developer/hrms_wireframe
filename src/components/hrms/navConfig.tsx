import type { ReactNode } from 'react'
import type { Permission, RoleId } from '../../auth/types'
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
    label: 'NAVTTC HQ Organogram',
    accent: 'administration',
    items: [
      {
        to: '/org/head',
        label: 'Head',
        permission: 'page:departments',
        icon: <IconUsers />,
        end: true,
      },
      {
        to: '/org/wings',
        label: 'Wings',
        permission: 'page:departments',
        icon: <IconBuilding />,
      },
      {
        to: '/org/sections',
        label: 'Sections',
        permission: 'page:departments',
        icon: <IconBuilding />,
      },
      {
        to: '/org/section-1',
        label: 'Section 1 (DD)',
        permission: 'page:departments',
        icon: <IconBriefcase />,
      },
      {
        to: '/org/section-2',
        label: 'Section 2 (AD)',
        permission: 'page:departments',
        icon: <IconBriefcase />,
      },
    ],
  },
  {
    label: 'Human Resources',
    accent: 'administration',
    items: [
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
        label: 'Leave management',
        permission: 'page:leave',
        icon: <IconCalendar />,
      },
      {
        to: '/performance',
        label: 'Performance management',
        permission: 'page:performance:manage',
        icon: <IconChart />,
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
    {
      to: '/organogram',
      label: 'Organogram (PDF)',
      permission: 'page:organogram',
      icon: <IconChart />,
    },
    {
      to: '/organogram/mapping',
      label: 'Organogram mapping',
      permission: 'page:organogram',
      icon: <IconChart />,
    },
  ],
}

/** Personal ESS links — sidebar for employees; account menu for HR / leadership. */
export const SELF_SERVICE_NAV: NavItemDef[] = [
  {
    to: '/ess/leave',
    label: 'Leave',
    permission: 'page:leave',
    icon: <IconCalendar />,
  },
  {
    to: '/ess/attendance',
    label: 'Attendance',
    permission: 'page:attendance',
    icon: <IconAttendance />,
  },
  {
    to: '/ess/performance',
    label: 'Performance',
    permission: 'page:performance',
    icon: <IconChart />,
  },
  {
    to: '/ess/training',
    label: 'Training',
    permission: 'page:training',
    icon: <IconCheckCircle />,
  },
]

export function selfServiceNavForRole(
  _role: RoleId,
  can: (permission: Permission) => boolean,
): NavItemDef[] {
  return SELF_SERVICE_NAV.filter((item) => can(item.permission))
}

export const ESS_NAV: NavItemDef[] = [
  {
    to: '/ess',
    label: 'Dashboard',
    permission: 'page:dashboard',
    icon: <IconDashboard />,
    end: true,
  },
  ...SELF_SERVICE_NAV,
]
