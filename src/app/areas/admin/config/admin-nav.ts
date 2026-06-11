export interface AdminNavItemDefinition {
  label: string;
  mobilePath: string;
  desktopPath: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItemDefinition[] = [
  { label: 'NAVIGATION.CALENDAR', mobilePath: '/admin/mobile/home', desktopPath: '/admin/home' },
  { label: 'NAVIGATION.CLIENTS', mobilePath: '/admin/mobile/clients', desktopPath: '/admin/clients' },
  { label: 'NAVIGATION.EMPLOYEES', mobilePath: '/admin/mobile/employees', desktopPath: '/admin/employees' },
  { label: 'NAVIGATION.CLASSES', mobilePath: '/admin/mobile/classes', desktopPath: '/admin/classes' },
  { label: 'NAVIGATION.CHECK_INS', mobilePath: '/admin/mobile/check-ins', desktopPath: '/admin/check-ins' },
  { label: 'NAVIGATION.DISCOUNTS', mobilePath: '/admin/mobile/discounts', desktopPath: '/admin/discounts' },
  { label: 'NAVIGATION.SALARY_CONFIGURATION', mobilePath: '/admin/mobile/salary-configuration', desktopPath: '/admin/salary-configuration' }
];

export const ADMIN_NAV_LABELS = {
  calendar: 'NAVIGATION.CALENDAR',
  clients: 'NAVIGATION.CLIENTS',
  employees: 'NAVIGATION.EMPLOYEES',
  classes: 'NAVIGATION.CLASSES',
  checkIns: 'NAVIGATION.CHECK_INS',
  discounts: 'NAVIGATION.DISCOUNTS',
  salaryConfiguration: 'NAVIGATION.SALARY_CONFIGURATION',
  myAccount: 'NAVIGATION.MY_ACCOUNT'
} as const;
