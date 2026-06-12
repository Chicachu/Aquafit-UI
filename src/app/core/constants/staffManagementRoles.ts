import { Role } from '@core/types/enums/role';

export const STAFF_MANAGEMENT_ROLES: Role[] = [
  Role.INSTRUCTOR,
  Role.MANAGER,
  Role.RECEPTIONIST
];

export const STAFF_MANAGEMENT_ROLE_OPTIONS = STAFF_MANAGEMENT_ROLES.map(role => ({
  value: role,
  viewValue: role.toUpperCase()
}));
