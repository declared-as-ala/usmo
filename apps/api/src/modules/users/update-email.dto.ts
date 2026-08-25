import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateEmailDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse e-mail valide' })
  @IsNotEmpty({ message: 'L’adresse e-mail est requise' })
  email: string;

  @IsOptional()
  @IsString()
  currentPassword?: string;
}
