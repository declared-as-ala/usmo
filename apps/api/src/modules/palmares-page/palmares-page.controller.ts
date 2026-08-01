import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { PalmaresPageService } from './palmares-page.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class PalmaresPageController {
  constructor(private readonly palmaresPageService: PalmaresPageService) {}

  @Get('palmares-page')
  getPublic() {
    return this.palmaresPageService.getPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/palmares-page')
  getAdmin() {
    return this.palmaresPageService.getAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/palmares-page')
  update(@Body() body: Record<string, unknown>) {
    return this.palmaresPageService.update(body);
  }
}
