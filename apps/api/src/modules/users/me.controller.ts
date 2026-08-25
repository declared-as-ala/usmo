import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { StorageService } from '../storage/storage.service';
import { MembershipsService } from '../memberships/memberships.service';
import { UpdateProfileDto } from './update-profile.dto';
import { UpdatePrivacyDto } from './update-privacy.dto';
import { ChangePasswordDto } from './change-password.dto';
import { UpdateEmailDto } from './update-email.dto';
import { MAX_IMAGE_SIZE } from '../storage/constants/upload.constants';

const multerOptions = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE },
};

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private readonly membershipsService: MembershipsService,
  ) {}

  @Get()
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.sub);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const membershipSummary = await this.membershipsService.getMembershipSummary(req.user.sub);

    const { password, ...userData } = user.toObject();

    return {
      ...userData,
      membershipSummary,
    };
  }

  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const firstName = updateProfileDto.firstName !== undefined ? updateProfileDto.firstName : user.firstName;
    const lastName = updateProfileDto.lastName !== undefined ? updateProfileDto.lastName : user.lastName;

    const updates: any = { ...updateProfileDto };
    if (updateProfileDto.firstName !== undefined || updateProfileDto.lastName !== undefined) {
      updates.name = `${firstName || ''} ${lastName || ''}`.trim() || user.name;
    }

    const updatedUser = await this.usersService.update(userId, updates);
    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé lors de la mise à jour');
    }

    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  @Patch('email')
  async updateEmail(@Req() req: any, @Body() updateEmailDto: UpdateEmailDto) {
    const updatedUser = await this.usersService.updateEmail(
      req.user.sub,
      updateEmailDto.email,
      updateEmailDto.currentPassword,
    );
    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  @Patch('privacy')
  async updatePrivacy(@Req() req: any, @Body() updatePrivacyDto: UpdatePrivacyDto) {
    const userId = req.user.sub;

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const currentPrivacy = user.privacySettings || {};
    const privacySettings = {
      showProfilePublicly: false,
      showCity: false,
      showRanking: false,
      showDonationBadge: false,
      showDonationAmount: false,
      useNickname: false,
      ...currentPrivacy,
      ...updatePrivacyDto,
    };

    const updatedUser = await this.usersService.update(userId, { privacySettings });
    if (!updatedUser) {
      throw new NotFoundException('Utilisateur non trouvé lors de la mise à jour');
    }

    const { password, ...result } = updatedUser.toObject();
    return result;
  }

  @Patch('password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(req.user.sub, dto.currentPassword, dto.newPassword);
    return { success: true };
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // MinIO upload to users/avatars folder
    const uploadedMedia = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      'users/avatars',
      req.user.sub,
    );

    // Save avatar URL to user profile
    await this.usersService.update(req.user.sub, { avatar: uploadedMedia.url });

    return { avatar: uploadedMedia.url };
  }
}
