import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './register.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password) {
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user.toObject();
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role, name: user.name };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    };
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const existing = await this.usersService.findOneByEmail(registerDto.email);
    if (existing) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      city,
      country,
      favoriteSport,
      favoritePlayer,
      newsletterOptIn,
    } = registerDto;

    const fullName = `${firstName} ${lastName}`;
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.usersService.create({
      name: fullName,
      firstName,
      lastName,
      email,
      phone,
      password,
      city,
      country,
      favoriteSport,
      favoritePlayer,
      newsletterOptIn: !!newsletterOptIn,
      role: 'USER',
      status: 'Active',
      emailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
    } as any);

    const appUrl = process.env.APP_URL || 'http://54.37.226.228';
    const verificationUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    // Send verification email asynchronously via OVH SMTP
    this.mailService.sendEmailVerificationEmail(email, fullName, verificationUrl).catch((err) => {
      console.error('[SMTP VERIFICATION ERROR]', err);
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Lien de vérification invalide ou expiré');
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { success: true, message: 'Adresse email vérifiée avec succès !' };
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      // Do not reveal email existence to prevent user enumeration attacks
      return { success: true, message: 'Si l’adresse email existe, un lien de réinitialisation a été envoyé.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
    await user.save();

    const appUrl = process.env.APP_URL || 'http://54.37.226.228';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    // Send reset password email via OVH SMTP
    this.mailService.sendPasswordResetEmail(user.email, user.name || 'Utilisateur', resetUrl).catch((err) => {
      console.error('[SMTP RESET ERROR]', err);
    });

    return { success: true, message: 'Si l’adresse email existe, un lien de réinitialisation a été envoyé.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Lien de réinitialisation invalide ou expiré');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true, message: 'Votre mot de passe a été réinitialisé avec succès !' };
  }
}
