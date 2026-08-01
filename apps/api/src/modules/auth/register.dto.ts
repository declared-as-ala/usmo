import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsBoolean, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty({ message: 'Le prénom est requis' })
  @IsString()
  firstName: string;

  @IsNotEmpty({ message: 'Le nom est requis' })
  @IsString()
  lastName: string;

  @IsEmail({}, { message: 'Veuillez saisir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit comporter au moins 6 caractères' })
  password: string;

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

  @IsNotEmpty({ message: 'Vous devez accepter les conditions d\'utilisation' })
  @IsBoolean()
  acceptTerms: boolean;

  @IsOptional()
  @IsBoolean()
  newsletterOptIn?: boolean;
}
