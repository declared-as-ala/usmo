import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MembershipPlansService } from './membership-plans.service';
import { CreateMembershipPlanDto, UpdateMembershipPlanDto } from './membership-plan.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class MembershipPlansController {
  constructor(private readonly plansService: MembershipPlansService) {}

  @Get('membership/plans')
  async getActivePlans() {
    return this.plansService.findAllActive();
  }

  @Get('admin/membership-plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getAllPlans() {
    return this.plansService.findAllAdmin();
  }

  @Post('admin/membership-plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async createPlan(@Body() dto: CreateMembershipPlanDto) {
    return this.plansService.create(dto);
  }

  @Patch('admin/membership-plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateMembershipPlanDto,
  ) {
    return this.plansService.update(id, dto);
  }

  @Delete('admin/membership-plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  async deletePlan(@Param('id') id: string) {
    await this.plansService.delete(id);
    return { success: true };
  }
}
