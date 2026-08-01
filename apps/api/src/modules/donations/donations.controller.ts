import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { DonationsService } from './donations.service';
import { CreateDonationDto, ConfirmDonationDto } from './donations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post('donations')
  @UseGuards(OptionalJwtAuthGuard)
  async createDonation(@Body() dto: CreateDonationDto, @Req() req: any) {
    const userId = req.user ? req.user.sub : undefined;
    return this.donationsService.create(dto, userId);
  }

  @Post('donations/:id/confirm')
  async confirmDonation(
    @Param('id') id: string,
    @Body() dto: ConfirmDonationDto,
  ) {
    return this.donationsService.confirm(id, dto.paymentReference);
  }

  @Get('donations/public')
  async getPublicDonations() {
    return this.donationsService.findPublic();
  }

  @Get('donations/leaderboard')
  async getDonationsLeaderboard() {
    return this.donationsService.getLeaderboard();
  }

  @Get('donations/my')
  @UseGuards(JwtAuthGuard)
  async getMyDonationHistory(@Req() req: any) {
    return this.donationsService.findMyHistory(req.user.sub);
  }

  @Get('admin/donations')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getAdminDonations() {
    return this.donationsService.findAllAdmin();
  }

  @Get('admin/donations/export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async exportDonationsCsv(@Req() req: any, @Res() res: Response) {
    const adminId = req.user.sub;
    const csvContent = await this.donationsService.exportCsv(adminId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=donations_audit_export.csv',
    );
    return res.status(200).send(csvContent);
  }
}
