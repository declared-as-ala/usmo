import { IsNumber, IsString, IsEmail, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateDonationDto {
  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  donorName: string;

  @IsEmail()
  donorEmail: string;

  @IsEnum(['public', 'anonymous'])
  visibility: 'public' | 'anonymous';

  @IsString()
  @IsOptional()
  message?: string;
}

export class ConfirmDonationDto {
  @IsString()
  paymentReference: string;
}
