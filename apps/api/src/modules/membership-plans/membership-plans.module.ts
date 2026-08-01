import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipPlan, MembershipPlanSchema } from './membership-plan.schema';
import { MembershipPlansService } from './membership-plans.service';
import { MembershipPlansController } from './membership-plans.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipPlan.name, schema: MembershipPlanSchema },
    ]),
  ],
  controllers: [MembershipPlansController],
  providers: [MembershipPlansService],
  exports: [MembershipPlansService, MongooseModule],
})
export class MembershipPlansModule {}
