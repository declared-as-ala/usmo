import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { AdminInvitation, AdminInvitationSchema } from '../auth/admin-invitation.schema';
import { AdminSession, AdminSessionSchema } from '../auth/admin-session.schema';
import { UsersService } from './users.service';
import { MeController } from './me.controller';
import { AdminUsersController } from './admin-users.controller';
import { StorageModule } from '../storage/storage.module';
import { MembershipsModule } from '../memberships/memberships.module';
import { AuditLogsModule } from '../auditlogs/auditlogs.module';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AdminInvitation.name, schema: AdminInvitationSchema },
      { name: AdminSession.name, schema: AdminSessionSchema },
    ]),
    StorageModule,
    MembershipsModule,
    AuditLogsModule,
  ],
  controllers: [MeController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
