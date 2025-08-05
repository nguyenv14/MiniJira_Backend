import { Body, Controller, Get, Post, Param, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ChangePasswordRequest } from 'src/dto/ChangePasswordRequest';

@Controller('api/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  getUserById(@Request() req) {
    const userId = req.user?.id as string;
    console.log(userId);
    return this.profileService.findById(userId);
  }

  @Post(':id')
  @UseGuards(JwtAuthGuard)
  async updateUserById(
    @Param('id') id: string,
    @Body() userData: { userName: string },
  ) {
    return await this.profileService.updateProfile(id, userData);
  }

  @Post(':id/change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Param('id') id: string,
    @Body() changePasswordRequest: ChangePasswordRequest,
  ) {
    return await this.profileService.changePassword(id, changePasswordRequest);
  }
}
