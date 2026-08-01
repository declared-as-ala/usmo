import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { RequestMembershipDto, ApproveMembershipDto, StatusNoteDto } from './memberships.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller()
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  @Get('me/membership')
  @UseGuards(JwtAuthGuard)
  async getMyMembership(@Req() req: any) {
    return this.membershipsService.getMembershipSummary(req.user.sub);
  }

  @Post('me/membership/request')
  @UseGuards(JwtAuthGuard, ThrottlerGuard)
  async requestMembership(@Req() req: any, @Body() dto: RequestMembershipDto) {
    return this.membershipsService.requestMembership(
      req.user.sub,
      dto.planId,
      dto.proofFile,
    );
  }

  @Get('admin/memberships')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getAllMemberships(
    @Query('status') status?: string,
    @Query('planId') planId?: string,
    @Query('search') search?: string,
  ) {
    return this.membershipsService.findAllAdmin({ status, planId, search });
  }

  @Patch('admin/memberships/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async approveMembership(
    @Param('id') id: string,
    @Body() dto: ApproveMembershipDto,
    @Req() req: any,
  ) {
    const options = {
      note: dto.note,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    };
    return this.membershipsService.updateStatus(id, 'active', req.user.sub, options);
  }

  @Patch('admin/memberships/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async rejectMembership(
    @Param('id') id: string,
    @Body() dto: StatusNoteDto,
    @Req() req: any,
  ) {
    return this.membershipsService.updateStatus(id, 'rejected', req.user.sub, {
      note: dto.note,
    });
  }

  @Patch('admin/memberships/:id/renew')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async renewMembership(
    @Param('id') id: string,
    @Body() dto: StatusNoteDto,
    @Req() req: any,
  ) {
    return this.membershipsService.renewMembership(id, req.user.sub, {
      note: dto.note,
    });
  }

  @Patch('admin/memberships/:id/suspend')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async suspendMembership(
    @Param('id') id: string,
    @Body() dto: StatusNoteDto,
    @Req() req: any,
  ) {
    return this.membershipsService.updateStatus(id, 'suspended', req.user.sub, {
      note: dto.note,
    });
  }

  @Patch('admin/memberships/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async cancelMembership(
    @Param('id') id: string,
    @Body() dto: StatusNoteDto,
    @Req() req: any,
  ) {
    return this.membershipsService.updateStatus(id, 'cancelled', req.user.sub, {
      note: dto.note,
    });
  }
}
