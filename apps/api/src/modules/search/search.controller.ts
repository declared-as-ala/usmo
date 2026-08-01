import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller()
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  search(@Query('q') q = '') {
    return this.searchService.search(q);
  }
}
