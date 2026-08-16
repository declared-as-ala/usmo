import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Non autorisé : Aucun jeton fourni');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'usmo-super-secret-key-change-in-prod',
      });

      const userId = payload.sub || payload.id;
      const dbUser = await this.usersService.findOneById(userId);

      if (!dbUser) {
        throw new UnauthorizedException('Non autorisé : Compte utilisateur introuvable');
      }

      if (dbUser.isSuspended || dbUser.status === 'Inactive') {
        throw new UnauthorizedException('Votre compte a été suspendu ou désactivé.');
      }

      request['user'] = {
        _id: dbUser._id,
        id: dbUser._id.toString(),
        sub: dbUser._id.toString(),
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        customPermissions: dbUser.customPermissions || [],
        isSuspended: dbUser.isSuspended || false,
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Non autorisé : Jeton expiré ou invalide');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    if (request.cookies && request.cookies.jwt) {
      return request.cookies.jwt;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}

