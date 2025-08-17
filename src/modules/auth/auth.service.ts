import { JwtService } from '@nestjs/jwt';
import { UserService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { BaseResponse } from 'src/utils/base-response';
import { Response } from 'express';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) { }

  async login(email: string, password: string, response: Response) {
    const user = await this.userService.findOne({ email: email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const jwt = await this.jwtService.signAsync({
        id: user._id,
        email: user.email,
        role: user.role,
      });
      response.cookie('jwt', jwt, { httpOnly: true });
      const data = {
        access_token: jwt,
        user: {
          id: user.id as string,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isAdmin: user.isAdmin,
        },
      };
      return new BaseResponse(200, 'Login successful!', data);
    }
    throw new BadRequestException('Invalid email or password!');
  }
}
