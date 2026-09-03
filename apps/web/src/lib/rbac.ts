/**
 * Role-Based Access Control (RBAC) — Single source of truth for frontend.
 * Defines the 3 fixed system roles: SUPER_ADMIN, ADMIN, GESTIONNAIRE_COMMANDES.
 */

export const SYSTEM_ROLES = ['SUPER_ADMIN', 'ADMIN', 'GESTIONNAIRE_COMMANDES'] as const;
export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const ROLE_LABELS: Record<SystemRole, { fr: string; en: string; ar: string; description: string }> = {
  SUPER_ADMIN: {
    fr: 'Super Administrateur',
    en: 'Super Administrator',
    ar: 'المشرف الرئيسي',
    description: 'Accès absolu à toutes les fonctionnalités, incluant la gestion complète des administrateurs et la sécurité.',
  },
  ADMIN: {
    fr: 'Administrateur',
    en: 'Administrator',
    ar: 'مشرف',
    description: 'Accès à toutes les fonctionnalités, sauf la gestion des administrateurs.',
  },
  GESTIONNAIRE_COMMANDES: {
    fr: 'Gestionnaire des commandes',
    en: 'Order Manager',
    ar: 'مدير الطلبات',
    description: 'Accès uniquement aux commandes et à la consultation des codes promo.',
  },
};

export const ALL_APPLICATION_PERMISSIONS = [
  'users.view',
  'users.edit',
  'users.suspend',
  'users.export',
  'products.view',
  'products.create',
  'products.edit',
  'products.delete',
  'orders.view',
  'orders.edit',
  'orders.confirm',
  'orders.cancel',
  'orders.export',
  'orders.update_status',
  'discount_codes.view',
  'news.view',
  'news.create',
  'news.edit',
  'news.publish',
  'news.delete',
  'media.view',
  'media.upload',
  'media.edit',
  'media.delete',
  'media.publish',
  'analytics.view',
  'analytics.export',
  'settings.view',
  'settings.edit',
] as const;

export const RBAC_PERMISSIONS: Record<SystemRole, readonly string[]> = {
  SUPER_ADMIN: ['*'],
  ADMIN: ALL_APPLICATION_PERMISSIONS,
  GESTIONNAIRE_COMMANDES: [
    'orders.view',
    'orders.edit',
    'orders.confirm',
    'orders.cancel',
    'orders.export',
    'orders.update_status',
    'discount_codes.view',
  ],
};

export function normalizeRole(role?: string): SystemRole | 'USER' {
  if (!role) return 'USER';
  const clean = role.toUpperCase().replace(/[\s_]+/g, '_');
  if (clean === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (clean === 'GESTIONNAIRE_COMMANDES') return 'GESTIONNAIRE_COMMANDES';
  if (clean === 'ADMIN') return 'ADMIN';
  return 'USER';
}

export function roleHasPermission(role: string, permission: string): boolean {
  const norm = normalizeRole(role);
  if (norm === 'SUPER_ADMIN') return true;
  if (norm === 'USER') return false;
  const perms = RBAC_PERMISSIONS[norm];
  if (!perms) return false;
  return perms.includes('*') || perms.includes(permission);
}

export function permissionsForRole(role: string): readonly string[] {
  const norm = normalizeRole(role);
  if (norm === 'USER') return [];
  return RBAC_PERMISSIONS[norm] || [];
}

export const ROLES = SYSTEM_ROLES;
export const PERMISSIONS = ALL_APPLICATION_PERMISSIONS;
export type Role = SystemRole;
export type Permission = (typeof ALL_APPLICATION_PERMISSIONS)[number];
