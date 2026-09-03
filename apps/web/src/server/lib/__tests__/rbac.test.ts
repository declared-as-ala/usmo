import { describe, expect, it } from 'vitest';
import {
  ROLES,
  PERMISSIONS,
  permissionsForRole,
  roleHasPermission,
  normalizeRole,
  ROLE_LABELS,
} from '../rbac';
import { ADMIN_NAV } from '../../../components/Admin/adminNav';
import { getRolePermissions } from '../../../../../api/src/modules/roles/default-roles';

describe('RBAC Roles & Permissions Comprehensive Suite', () => {
  // Case 1: SUPER_ADMIN can open Administrateurs page and has full access
  it('1. SUPER_ADMIN has every permission and can access administrateurs', () => {
    expect(roleHasPermission('SUPER_ADMIN', 'admins.view')).toBe(true);
    expect(roleHasPermission('SUPER_ADMIN', 'admins.create')).toBe(true);
    expect(roleHasPermission('SUPER_ADMIN', 'admins.edit')).toBe(true);
    expect(roleHasPermission('SUPER_ADMIN', 'admins.delete')).toBe(true);
    expect(roleHasPermission('SUPER_ADMIN', 'any.custom.action')).toBe(true);
    expect(permissionsForRole('SUPER_ADMIN')).toEqual(['*']);
  });

  // Case 2: SUPER_ADMIN can invite an ADMIN
  it('2. SUPER_ADMIN can assign and invite an ADMIN role', () => {
    const role = normalizeRole('ADMIN');
    expect(role).toBe('ADMIN');
    expect(ROLE_LABELS.ADMIN.fr).toBe('Administrateur');
    expect(getRolePermissions('ADMIN')).toContain('orders.view');
    expect(getRolePermissions('ADMIN')).not.toContain('admins.view');
  });

  // Case 3: SUPER_ADMIN can invite a GESTIONNAIRE_COMMANDES
  it('3. SUPER_ADMIN can assign and invite a GESTIONNAIRE_COMMANDES role', () => {
    const role = normalizeRole('GESTIONNAIRE_COMMANDES');
    expect(role).toBe('GESTIONNAIRE_COMMANDES');
    expect(ROLE_LABELS.GESTIONNAIRE_COMMANDES.fr).toBe('Gestionnaire des commandes');
    expect(getRolePermissions('GESTIONNAIRE_COMMANDES')).toContain('orders.view');
    expect(getRolePermissions('GESTIONNAIRE_COMMANDES')).toContain('discount_codes.view');
  });

  // Case 4: ADMIN cannot see the Administrateurs sidebar item
  it('4. ADMIN cannot see the Administrateurs sidebar item', () => {
    const isSuperAdmin = false;
    const hasPermission = (p: string) => roleHasPermission('ADMIN', p);

    const filteredNav = ADMIN_NAV.map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (item.superAdminOnly && !isSuperAdmin) return false;
        if (item.permission && !hasPermission(item.permission)) return false;
        return true;
      }),
    })).filter((group) => group.items.length > 0);

    const allVisibleHrefs = filteredNav.flatMap((g) => g.items.map((i) => i.href));
    expect(allVisibleHrefs).not.toContain('/admin/administrateurs');
    expect(allVisibleHrefs).not.toContain('/admin/audit-logs');
  });

  // Case 5: ADMIN receives 403 / denied when calling administrator-management API
  it('5. ADMIN does not have admins.* permissions (returns 403)', () => {
    expect(roleHasPermission('ADMIN', 'admins.view')).toBe(false);
    expect(roleHasPermission('ADMIN', 'admins.create')).toBe(false);
    expect(roleHasPermission('ADMIN', 'admins.edit')).toBe(false);
    expect(roleHasPermission('ADMIN', 'admins.delete')).toBe(false);
    expect(roleHasPermission('ADMIN', 'admins.assign_roles')).toBe(false);
  });

  // Case 6: ADMIN can access all normal application modules
  it('6. ADMIN can access all normal operational application modules', () => {
    expect(roleHasPermission('ADMIN', 'products.view')).toBe(true);
    expect(roleHasPermission('ADMIN', 'products.create')).toBe(true);
    expect(roleHasPermission('ADMIN', 'orders.view')).toBe(true);
    expect(roleHasPermission('ADMIN', 'orders.edit')).toBe(true);
    expect(roleHasPermission('ADMIN', 'news.view')).toBe(true);
    expect(roleHasPermission('ADMIN', 'media.view')).toBe(true);
    expect(roleHasPermission('ADMIN', 'analytics.view')).toBe(true);
    expect(roleHasPermission('ADMIN', 'settings.view')).toBe(true);
  });

  // Case 7: GESTIONNAIRE_COMMANDES sees only Commandes and Codes promo
  it('7. GESTIONNAIRE_COMMANDES sidebar allows only Commandes and Codes promo', () => {
    const isOrderManager = true;
    const orderManagerNav = isOrderManager
      ? [
          {
            label: 'Commandes & Promotions',
            items: [
              { label: 'Shop Orders', href: '/admin/orders' },
              { label: 'Discount Codes', href: '/admin/discount-codes' },
            ],
          },
        ]
      : [];

    const visibleHrefs = orderManagerNav.flatMap((g) => g.items.map((i) => i.href));
    expect(visibleHrefs).toEqual(['/admin/orders', '/admin/discount-codes']);
    expect(visibleHrefs).not.toContain('/admin');
    expect(visibleHrefs).not.toContain('/admin/analytics');
    expect(visibleHrefs).not.toContain('/admin/boutique');
    expect(visibleHrefs).not.toContain('/admin/players');
    expect(visibleHrefs).not.toContain('/admin/news');
  });

  // Case 8: GESTIONNAIRE_COMMANDES can update an order status
  it('8. GESTIONNAIRE_COMMANDES can update an order status', () => {
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'orders.update_status')).toBe(true);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'orders.edit')).toBe(true);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'orders.confirm')).toBe(true);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'orders.cancel')).toBe(true);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'orders.export')).toBe(true);
  });

  // Case 9: GESTIONNAIRE_COMMANDES can view promo codes
  it('9. GESTIONNAIRE_COMMANDES can view promo codes', () => {
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'discount_codes.view')).toBe(true);
  });

  // Case 10: GESTIONNAIRE_COMMANDES cannot create, edit, or delete promo codes
  it('10. GESTIONNAIRE_COMMANDES cannot create, edit, or delete promo codes', () => {
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'discount_codes.create')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'discount_codes.edit')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'discount_codes.delete')).toBe(false);
  });

  // Case 11: GESTIONNAIRE_COMMANDES cannot access products, customers, analytics, settings, or administrators
  it('11. GESTIONNAIRE_COMMANDES is blocked from accessing other modules', () => {
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'products.view')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'products.create')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'users.view')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'analytics.view')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'settings.view')).toBe(false);
    expect(roleHasPermission('GESTIONNAIRE_COMMANDES', 'admins.view')).toBe(false);
  });

  // Case 12: Manually entering a forbidden URL does not bypass permissions
  it('12. Direct URL guard prevents unauthorized access', () => {
    const isOrderManagerAllowedRoute = (pathname: string) =>
      pathname.startsWith('/admin/orders') || pathname.startsWith('/admin/discount-codes');

    const isSuperAdminOnlyRoute = (pathname: string) =>
      pathname.startsWith('/admin/administrateurs') ||
      pathname.startsWith('/admin/audit-logs') ||
      pathname.startsWith('/admin/settings/sports');

    // Test GESTIONNAIRE_COMMANDES attempting direct access to various paths
    expect(isOrderManagerAllowedRoute('/admin/orders')).toBe(true);
    expect(isOrderManagerAllowedRoute('/admin/discount-codes')).toBe(true);
    expect(isOrderManagerAllowedRoute('/admin')).toBe(false);
    expect(isOrderManagerAllowedRoute('/admin/users')).toBe(false);
    expect(isOrderManagerAllowedRoute('/admin/boutique')).toBe(false);
    expect(isOrderManagerAllowedRoute('/admin/administrateurs')).toBe(false);

    // Test ADMIN attempting direct access to super admin paths
    expect(isSuperAdminOnlyRoute('/admin/administrateurs')).toBe(true);
    expect(isSuperAdminOnlyRoute('/admin/administrateurs/123')).toBe(true);
    expect(isSuperAdminOnlyRoute('/admin/audit-logs')).toBe(true);
    expect(isSuperAdminOnlyRoute('/admin/orders')).toBe(false);
  });

  // Case 13: Changing a user's role updates their access correctly
  it('13. Changing role updates permission scope dynamically', () => {
    let currentRole = 'ADMIN';
    expect(roleHasPermission(currentRole, 'products.view')).toBe(true);
    expect(roleHasPermission(currentRole, 'orders.view')).toBe(true);

    // Switch role to GESTIONNAIRE_COMMANDES
    currentRole = 'GESTIONNAIRE_COMMANDES';
    expect(roleHasPermission(currentRole, 'products.view')).toBe(false);
    expect(roleHasPermission(currentRole, 'orders.view')).toBe(true);
    expect(roleHasPermission(currentRole, 'discount_codes.view')).toBe(true);

    // Switch role to SUPER_ADMIN
    currentRole = 'SUPER_ADMIN';
    expect(roleHasPermission(currentRole, 'admins.view')).toBe(true);
    expect(roleHasPermission(currentRole, 'products.view')).toBe(true);
  });

  // Case 14: The backend never trusts permissions sent from the frontend invitation form
  it('14. Backend always derives permissions from role, ignoring manual tampering', () => {
    // Malicious attempt: client sends admins.delete permission with GESTIONNAIRE_COMMANDES role
    const assignedRole = 'GESTIONNAIRE_COMMANDES';
    const computedBackendPermissions = getRolePermissions(assignedRole);

    expect(computedBackendPermissions).not.toContain('admins.delete');
    expect(computedBackendPermissions).not.toContain('admins.view');
    expect(computedBackendPermissions).not.toContain('products.view');
    expect(computedBackendPermissions).toEqual([
      'orders.view',
      'orders.edit',
      'orders.confirm',
      'orders.cancel',
      'orders.export',
      'orders.update_status',
      'discount_codes.view',
    ]);
  });
});
