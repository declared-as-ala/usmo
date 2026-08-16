import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { DEFAULT_ROLE_PERMISSIONS } from '../roles/default-roles';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Accès refusé : Aucun utilisateur authentifié');
    }

    // Super Admin has absolute permission override
    const normalizedRole = (user.role || '').toUpperCase().replace(/\s+/g, '_');
    if (normalizedRole === 'SUPER_ADMIN' || user.role === 'Super Admin') {
      return true;
    }

    // Gather effective permissions for this user
    const rolePermissions = DEFAULT_ROLE_PERMISSIONS[user.role] || DEFAULT_ROLE_PERMISSIONS[normalizedRole] || [];
    const userCustomPermissions: string[] = Array.isArray(user.customPermissions) ? user.customPermissions : [];
    const effectivePermissions = new Set([...rolePermissions, ...userCustomPermissions]);

    if (effectivePermissions.has('*')) {
      return true;
    }

    const hasAllRequired = requiredPermissions.every((perm) => effectivePermissions.has(perm));
    if (!hasAllRequired) {
      throw new ForbiddenException(
        `Accès refusé : Permissions insuffisantes. Requis : [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
