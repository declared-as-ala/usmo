import { IsNotEmpty, IsString, IsEnum, IsOptional, IsArray, IsBoolean, IsNumber } from 'class-validator';

export class CreateMediaItemDto {
  @IsNotEmpty({ message: 'Le titre est requis' })
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  titleFr?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsNotEmpty({ message: 'La description est requise' })
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  descriptionFr?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsNotEmpty({ message: 'Le type est requis' })
  @IsEnum(['album', 'video'])
  type: 'album' | 'video';

  @IsNotEmpty({ message: 'Le niveau d\'accès est requis' })
  @IsEnum(['public', 'fan', 'premium'])
  accessLevel: 'public' | 'fan' | 'premium';

  @IsNotEmpty({ message: 'L\'image de couverture est requise' })
  @IsString()
  coverImage: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  teaserUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teaserPhotos?: string[];

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMediaItemDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  titleFr?: string;

  @IsOptional()
  @IsString()
  titleAr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionFr?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsEnum(['album', 'video'])
  type?: 'album' | 'video';

  @IsOptional()
  @IsEnum(['public', 'fan', 'premium'])
  accessLevel?: 'public' | 'fan' | 'premium';

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  teaserUrl?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  teaserPhotos?: string[];

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
