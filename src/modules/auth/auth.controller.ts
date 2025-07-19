import { Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Controller, Res } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Response } from 'express';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(
    @Body() loginData: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const { email, password } = loginData;
    console.log('Login attempt with email:', email);
    return this.authService.login(email, password, response);
  }

  // Additional endpoints can be added here
  // For example, register, logout, etc.
  // Add methods for authentication, e.g., login, register, etc.
}
