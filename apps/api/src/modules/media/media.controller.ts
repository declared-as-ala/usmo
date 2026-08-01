import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { CreateMediaItemDto, UpdateMediaItemDto } from './media.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

@Controller()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('media')
  @UseGuards(OptionalJwtAuthGuard)
  async getPublicMedia(@Req() req: any) {
    return this.mediaService.findAllPublic(req.user);
  }

  @Get('media/:id')
  @UseGuards(OptionalJwtAuthGuard)
  async getPublicMediaItem(@Param('id') id: string, @Req() req: any) {
    return this.mediaService.findOnePublic(id, req.user);
  }

  @Get('admin/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async getAllMedia() {
    return this.mediaService.findAllAdmin();
  }

  @Post('admin/media')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async createMediaItem(@Body() dto: CreateMediaItemDto) {
    return this.mediaService.create(dto);
  }

  @Patch('admin/media/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'Super Admin')
  async updateMediaItem(@Param('id') id: string, @Body() dto: UpdateMediaItemDto) {
    return this.mediaService.update(id, dto);
  }

  @Delete('admin/media/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin')
  async deleteMediaItem(@Param('id') id: string) {
    await this.mediaService.delete(id);
    return { success: true };
  }
}
