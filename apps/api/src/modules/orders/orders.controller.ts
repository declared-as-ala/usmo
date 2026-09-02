import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public: Create a new order (from checkout). Linked to the logged-in fan if a session is present.
  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async create(@Body() dto: any, @Req() req: any) {
    return this.ordersService.create({ ...dto, userId: req.user?.sub });
  }

  // Public: Track an order by its order number
  @Get('track/:orderNumber')
  async track(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOneByOrderNumber(orderNumber);
  }

  // Fan: List my own orders
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMine(@Req() req: any) {
    return this.ordersService.findMine(req.user.sub);
  }

  // Admin only: List all orders with optional filters
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Get()
  async findAll(@Query() query: any) {
    return this.ordersService.findAll(query);
  }

  // Admin only: Update order status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; notes?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, body.notes);
  }

  // Admin only: Update order details (drawer edit)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.ordersService.update(id, body);
  }

  // Admin only: Delete an order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.ordersService.delete(id);
  }
}
