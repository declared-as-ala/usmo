/**
 * Role-based access control — single source of truth.
 * The admin "Users & Roles" permission matrix page renders FROM this file;
 * never duplicate the matrix elsewhere. See docs/security.md §2.
 */

export const ROLES = [
  'SUPER_ADMIN',
  'BOUTIQUE_MANAGER',
  'ORDER_MANAGER',
  'PRODUCT_MANAGER',
  'CONTENT_EDITOR',
  'ANALYST',
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  'products.view',
  'products.edit',
  'products.publish',
  'products.delete',
  'inventory.view',
  'inventory.adjust',
  'orders.view',
  'orders.edit',
  'orders.confirm',
  'orders.export',
  'customers.view',
  'customers.edit',
  'customers.export',
  'logistics.manage',
  'coupons.manage',
  'media.manage',
  'content.edit',
  'seo.edit',
  'analytics.view',
  'users.manage',
  'settings.manage',
  'audit.view',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL: readonly Permission[] = PERMISSIONS;

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  SUPER_ADMIN: ALL,
  BOUTIQUE_MANAGER: ALL.filter((p) => p !== 'users.manage'),
  ORDER_MANAGER: [
    'orders.view',
    'orders.edit',
    'orders.confirm',
    'orders.export',
    'customers.view',
    'customers.edit',
    'inventory.view',
    'analytics.view',
  ],
  PRODUCT_MANAGER: [
    'products.view',
    'products.edit',
    'products.publish',
    'products.delete',
    'inventory.view',
    'inventory.adjust',
    'media.manage',
    'seo.edit',
    'analytics.view',
  ],
  CONTENT_EDITOR: ['content.edit', 'media.manage', 'seo.edit', 'products.view'],
  ANALYST: [
    'products.view',
    'inventory.view',
    'orders.view',
    'orders.export',
    'customers.view',
    'customers.export',
    'analytics.view',
    'audit.view',
  ],
};

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
