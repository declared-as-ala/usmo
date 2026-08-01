import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ProductsService } from './products.service';
import { Product } from './product.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async getActive(
    @Query('category') category?: string,
    @Query('collection') collection?: string,
    @Query('sport') sport?: string,
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('badge') badge?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.productsService.findAll({
      category,
      collection,
      sport,
      search,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      badge,
      status: 'published',
      sort,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string) {
    const product = await this.productsService.findOneBySlug(slug);
    // Increment view counter asynchronously
    this.productsService.incrementViews(product._id.toString()).catch(() => {});
    return product;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Get('all')
  async getAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    return this.productsService.findAll({
      status: status || 'all',
      search,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.productsService.findOneById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Post()
  async create(@Body() body: Partial<Product>) {
    return this.productsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<Product>) {
    return this.productsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Boutique Manager', 'Product Manager')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.productsService.delete(id);
  }

  @Post(':id/views')
  @HttpCode(204)
  async incrementViews(@Param('id') id: string) {
    return this.productsService.incrementViews(id);
  }
}
