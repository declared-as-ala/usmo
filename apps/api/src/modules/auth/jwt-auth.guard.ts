import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

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
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Non autorisé : Jeton expiré ou invalide');
    }

    return true;
  }

  private extractToken(request: Request): string | null {
    // 1. Check cookies
    if (request.cookies && request.cookies.jwt) {
      return request.cookies.jwt;
    }
    // 2. Check authorization header
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
