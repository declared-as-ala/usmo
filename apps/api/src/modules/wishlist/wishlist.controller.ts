import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('me/wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  findMine(@Req() req: any) {
    return this.wishlistService.findMine(req.user.sub);
  }

  @Post()
  add(@Req() req: any, @Body('productId') productId: string) {
    return this.wishlistService.add(req.user.sub, productId);
  }

  @Delete(':productId')
  remove(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.remove(req.user.sub, productId);
  }
}
