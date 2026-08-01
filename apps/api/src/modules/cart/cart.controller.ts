import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // Public endpoints
  @Get('delivery-zones')
  async getDeliveryZones() {
    return this.cartService.getDeliveryZones();
  }

  @Get('pickup-points')
  async getPickupPoints() {
    return this.cartService.getPickupPoints();
  }

  @Post('calculate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OptionalJwtAuthGuard)
  async calculateCart(@Body() dto: any, @Req() req: any) {
    return this.cartService.calculateCart(dto, req.user?.sub);
  }

  // Admin: Manage Delivery Zones
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Post('delivery-zones')
  async createDeliveryZone(@Body() dto: any) {
    return this.cartService.createDeliveryZone(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Patch('delivery-zones/:id')
  async updateDeliveryZone(@Param('id') id: string, @Body() dto: any) {
    return this.cartService.updateDeliveryZone(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Delete('delivery-zones/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDeliveryZone(@Param('id') id: string) {
    return this.cartService.deleteDeliveryZone(id);
  }

  // Admin: Manage Pickup Points
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Post('pickup-points')
  async createPickupPoint(@Body() dto: any) {
    return this.cartService.createPickupPoint(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Patch('pickup-points/:id')
  async updatePickupPoint(@Param('id') id: string, @Body() dto: any) {
    return this.cartService.updatePickupPoint(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  @Delete('pickup-points/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePickupPoint(@Param('id') id: string) {
    return this.cartService.deletePickupPoint(id);
  }
}
