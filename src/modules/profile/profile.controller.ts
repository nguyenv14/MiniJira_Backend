import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { BaseResponse } from 'src/utils/base-response';
import { ChangePasswordRequest } from 'src/dto/ChangePasswordRequest';

@Controller('api/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) { }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id') id: string) {
    const data = await this.profileService.findById(id);
    console.log(data);
    return new BaseResponse(200, 'Successful', data);
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
