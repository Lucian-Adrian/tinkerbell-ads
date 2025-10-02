/**
 * Navigation Configuration
 */

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  icon?: string
  label?: string
}

export interface NavConfig {
  mainNav: NavItem[]
  sidebarNav: NavItem[]
}

export const navigationConfig: NavConfig = {
  mainNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Projects',
      href: '/projects',
    },
    {
      title: 'Documentation',
      href: '/docs',
      external: true,
    },
  ],
  sidebarNav: [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
    },
    {
      title: 'Projects',
      href: '/projects',
      icon: 'folder',
    },
    {
      title: 'New Project',
      href: '/projects/new',
      icon: 'plus',
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: 'settings',
    },
  ],
}
