import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  // Public: Get published news list
  @Get()
  async getPublishedNews(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    return this.newsService.findAll({
      category,
      search,
      featured: isFeatured,
      published: true, // Only show published articles to the public
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  // Admin/Public: Get single news article
  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.newsService.findBySlug(slug);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.newsService.findOne(id);
  }

  // Admin only: Get all news (published + drafts)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Get('admin/all')
  async getAdminNews(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('featured') featured?: string,
    @Query('published') published?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const isPublished = published === 'true' ? true : published === 'false' ? false : undefined;
    return this.newsService.findAll({
      category,
      search,
      featured: isFeatured,
      published: isPublished,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
  }

  // Admin only: Create a news article
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Post()
  async create(@Body() body: any) {
    return this.newsService.create(body);
  }

  // Admin only: Update a news article
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.newsService.update(id, body);
  }

  // Admin only: Delete a news article
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Admin')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsService.delete(id);
  }
}
