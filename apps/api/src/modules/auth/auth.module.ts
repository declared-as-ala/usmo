import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { RequireActiveMembership } from './require-active-membership.guard';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { MembershipsModule } from '../memberships/memberships.module';

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'usmo-super-secret-key-change-in-prod',
      signOptions: { expiresIn: '7d' },
    }),
    MembershipsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, RequireActiveMembership, OptionalJwtAuthGuard],
  exports: [AuthService, UsersModule, JwtAuthGuard, RolesGuard, RequireActiveMembership, OptionalJwtAuthGuard],
})
export class AuthModule {}
