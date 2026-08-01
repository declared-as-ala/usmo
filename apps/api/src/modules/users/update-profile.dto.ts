import { IsOptional, IsString, IsBoolean, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(['football', 'basketball', 'both'], { message: 'Sport favori invalide' })
  favoriteSport?: 'football' | 'basketball' | 'both';

  @IsOptional()
  @IsString()
  favoritePlayer?: string;

  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean;
}
