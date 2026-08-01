import { IsNotEmpty, IsString, IsNumber, IsArray, IsOptional, IsBoolean, Min } from 'class-validator';

export class CreateMembershipPlanDto {
  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Le slug est requis' })
  @IsString()
  slug: string;

  @IsNotEmpty({ message: 'La description est requise' })
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number; // in millimes

  @IsNotEmpty({ message: 'La durée en jours est requise' })
  @IsNumber()
  @Min(1)
  durationDays: number;

  @IsNotEmpty({ message: 'Les avantages sont requis' })
  @IsArray()
  @IsString({ each: true })
  benefits: string[];

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateMembershipPlanDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  benefits?: string[];

  @IsOptional()
  @IsString()
  badge?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}
