import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './register.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
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
      role: 'Fan',
      status: 'Active',
    } as any);

    const { password: _, ...result } = user.toObject();
    return result;
  }
}
