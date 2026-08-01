import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { SponsorsService } from './sponsors.service';
import { PartnerLeadsService } from './partner-leads.service';
import { Sponsor } from './sponsor.schema';
import { PartnerLead } from './partner-lead.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('sponsors')
export class SponsorsController {
  constructor(
    private readonly sponsorsService: SponsorsService,
    private readonly partnerLeadsService: PartnerLeadsService,
  ) {}

  @Get()
  async getActive() {
    return this.sponsorsService.findAll();
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.sponsorsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Content Editor')
  @Post()
  async create(@Body() body: Partial<Sponsor>) {
    return this.sponsorsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Content Editor')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Sponsor>) {
    return this.sponsorsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.sponsorsService.delete(id);
  }

  @Post('leads')
  async createLead(@Body() body: Partial<PartnerLead>) {
    return this.partnerLeadsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Content Editor')
  @Get('admin/leads')
  async getLeads() {
    return this.partnerLeadsService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Content Editor')
  @Patch('admin/leads/:id')
  async updateLeadStatus(@Param('id') id: string, @Body('status') status: PartnerLead['status']) {
    return this.partnerLeadsService.updateStatus(id, status);
  }
}
