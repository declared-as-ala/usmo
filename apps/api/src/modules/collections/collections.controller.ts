import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { Collection } from './collection.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  async getActive() {
    return this.collectionsService.findAll(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Get('all')
  async getAll() {
    return this.collectionsService.findAll(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Post()
  async create(@Body() body: Partial<Collection>) {
    return this.collectionsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Collection>) {
    return this.collectionsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }
}
