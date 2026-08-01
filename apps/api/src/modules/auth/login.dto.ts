import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Veuillez saisir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit comporter au moins 6 caractères' })
  password: string;
}
