import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { LegalPagesService } from './legal-pages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class LegalPagesController {
  constructor(private readonly legalPagesService: LegalPagesService) {}

  @Get('legal/:key')
  getPublic(@Param('key') key: string) {
    return this.legalPagesService.getPublic(key);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/legal')
  getAllAdmin() {
    return this.legalPagesService.getAllAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/legal/:key')
  getAdmin(@Param('key') key: string) {
    return this.legalPagesService.getAdmin(key);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/legal/:key')
  update(@Param('key') key: string, @Body() body: { title?: string; content?: string }) {
    return this.legalPagesService.update(key, body);
  }
}
