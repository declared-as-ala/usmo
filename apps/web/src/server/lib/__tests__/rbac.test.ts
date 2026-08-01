import { describe, expect, it } from 'vitest';
import { PERMISSIONS, ROLES, permissionsForRole, roleHasPermission } from '../rbac';

describe('rbac matrix', () => {
  it('SUPER_ADMIN has every permission', () => {
    expect(permissionsForRole('SUPER_ADMIN')).toEqual(PERMISSIONS);
  });

  it('BOUTIQUE_MANAGER has everything except users.manage', () => {
    expect(roleHasPermission('BOUTIQUE_MANAGER', 'users.manage')).toBe(false);
    expect(roleHasPermission('BOUTIQUE_MANAGER', 'settings.manage')).toBe(true);
    expect(roleHasPermission('BOUTIQUE_MANAGER', 'orders.confirm')).toBe(true);
  });

  it('ANALYST can never mutate', () => {
    const mutating = PERMISSIONS.filter(
      (p) =>
        p.endsWith('.edit') ||
        p.endsWith('.adjust') ||
        p.endsWith('.delete') ||
        p.endsWith('.publish') ||
        p.endsWith('.manage') ||
        p === 'orders.confirm'
    );
    for (const p of mutating) {
      expect(roleHasPermission('ANALYST', p), `ANALYST should not have ${p}`).toBe(false);
    }
  });

  it('only ORDER_MANAGER, BOUTIQUE_MANAGER and SUPER_ADMIN can confirm orders', () => {
    const confirmers = ROLES.filter((r) => roleHasPermission(r, 'orders.confirm'));
    expect(confirmers.sort()).toEqual(['BOUTIQUE_MANAGER', 'ORDER_MANAGER', 'SUPER_ADMIN']);
  });

  it('snapshot of the full matrix (fails CI on accidental grants)', () => {
    const matrix = Object.fromEntries(ROLES.map((r) => [r, [...permissionsForRole(r)]]));
    expect(matrix).toMatchSnapshot();
  });
});
