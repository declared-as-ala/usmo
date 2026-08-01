import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync(token, {
          secret: process.env.JWT_SECRET || 'usmo-super-secret-key-change-in-prod',
        });
        request['user'] = payload;
      } catch (err) {
        // Suppress verification errors so the request is treated as unauthenticated
      }
    }

    return true;
  }

  private extractToken(request: any): string | null {
    if (request.cookies && request.cookies.jwt) {
      return request.cookies.jwt;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : null;
  }
}
