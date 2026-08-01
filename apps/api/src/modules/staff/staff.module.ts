import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StaffMember, StaffMemberSchema } from './staff.schema';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: StaffMember.name, schema: StaffMemberSchema }]),
    AuthModule,
  ],
  controllers: [StaffController],
  providers: [StaffService],
  exports: [StaffService],
})
export class StaffModule {}
