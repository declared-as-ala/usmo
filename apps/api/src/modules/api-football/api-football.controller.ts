import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiFootballService } from './api-football.service';

@Controller('sports/football')
export class ApiFootballController {
  constructor(private readonly apiFootballService: ApiFootballService) {}

  @Get('standings')
  async getStandings() {
    return this.apiFootballService.getStandings();
  }

  @Get('squad')
  async getSquad() {
    return this.apiFootballService.getSquad();
  }

  @Get('players/:id')
  async getPlayerProfile(@Param('id', ParseIntPipe) id: number) {
    return this.apiFootballService.getPlayerProfile(id);
  }

  @Get('fixtures')
  async getFixtures() {
    return this.apiFootballService.getFixtures();
  }

  @Get('team')
  async getTeamInfo() {
    return this.apiFootballService.getTeamInfo();
  }
}
