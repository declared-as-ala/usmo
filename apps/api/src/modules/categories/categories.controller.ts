import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './category.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getActive() {
    return this.categoriesService.findAll(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Get('all')
  async getAll() {
    return this.categoriesService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Post()
  async create(@Body() body: Partial<Category>) {
    return this.categoriesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Category>) {
    return this.categoriesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.categoriesService.delete(id);
  }
}
