import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { MeController } from './me.controller';
import { AdminUsersController } from './admin-users.controller';
import { StorageModule } from '../storage/storage.module';
import { MembershipsModule } from '../memberships/memberships.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    StorageModule,
    MembershipsModule,
  ],
  controllers: [MeController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
