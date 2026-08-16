import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Accès refusé : Aucun utilisateur authentifié');
    }

    const userRoleNormalized = (user.role || '').toUpperCase().replace(/\s+/g, '_');
    if (userRoleNormalized === 'SUPER_ADMIN' || user.role === 'Super Admin') {
      return true;
    }

    const normalizedRequired = requiredRoles.map((r) => r.toUpperCase().replace(/\s+/g, '_'));
    const hasRole = requiredRoles.includes(user.role) || normalizedRequired.includes(userRoleNormalized);

    if (!hasRole) {
      throw new ForbiddenException(`Accès refusé : Rôle requis parmi [${requiredRoles.join(', ')}]`);
    }

    return true;
  }
}
