import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller()
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Get('history')
  getPublic() {
    return this.historyService.getPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/history')
  getAdmin() {
    return this.historyService.getAdmin();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch('admin/history')
  update(@Body() body: Record<string, unknown>) {
    return this.historyService.update(body);
  }
}
