import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePrivacyDto {
  @IsOptional()
  @IsBoolean()
  showProfilePublicly?: boolean;

  @IsOptional()
  @IsBoolean()
  showCity?: boolean;

  @IsOptional()
  @IsBoolean()
  showRanking?: boolean;

  @IsOptional()
  @IsBoolean()
  showDonationBadge?: boolean;

  @IsOptional()
  @IsBoolean()
  showDonationAmount?: boolean;

  @IsOptional()
  @IsBoolean()
  useNickname?: boolean;
}
