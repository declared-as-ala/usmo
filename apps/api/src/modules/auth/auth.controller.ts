import { Controller, Post, Body, Res, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './login.dto';
import { RegisterDto } from './register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    if (user.isSuspended || user.status === 'Inactive') {
      throw new UnauthorizedException('Votre compte a été suspendu ou désactivé.');
    }

    const { access_token, user: userData } = await this.authService.login(user);

    // Record login activity
    await this.usersService.recordLogin(user._id.toString(), req.ip, req.headers['user-agent']);

    // Set secure HttpOnly cookie
    response.cookie('jwt', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      access_token,
      user: userData,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');
    return { success: true, message: 'Déconnecté avec succès' };
  }

  @Post('invitations/accept')
  async acceptInvitation(@Body() body: { token: string; password: string }) {
    return this.usersService.acceptInvitation(body.token, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    return req.user;
  }
}
