// src/constants/roles.ts
export const USER_ROLES = {
    ADMIN: 'admin',
    HR: 'hr',
    EMPLOYEE: 'employee',
  } as const;
  
  export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: [
      'manage_users',
      'view_all_attendance',
      'manage_leaves',
      'view_payroll',
      'system_settings',
    ],
    [USER_ROLES.HR]: [
      'view_users',
      'view_attendance',
      'manage_leaves',
      'view_payroll',
    ],
    [USER_ROLES.EMPLOYEE]: [
      'view_own_attendance',
      'apply_leave',
      'view_own_payroll',
    ],
  };
  
  export type UserRole = keyof typeof ROLE_PERMISSIONS;