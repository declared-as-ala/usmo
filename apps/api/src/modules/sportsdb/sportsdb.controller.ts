import { Controller, Get, Query } from '@nestjs/common';
import { SportsDbService } from './sportsdb.service';

@Controller('sportsdb')
export class SportsDbController {
  constructor(private readonly sportsDbService: SportsDbService) {}

  @Get('standings')
  async getStandings() {
    return this.sportsDbService.getStandings();
  }

  @Get('results')
  async getResults(@Query('limit') limit?: string) {
    return this.sportsDbService.getRecentResults(limit ? parseInt(limit, 10) : 5);
  }

  @Get('next')
  async getNext() {
    return this.sportsDbService.getNextMatch();
  }

  @Get('team')
  async getTeam() {
    return this.sportsDbService.getTeamInfo();
  }
}
