
import { Body, Controller, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ProjectsService } from './project.service';
import { ProjectSaveRequest } from 'src/dto/projects/SaveProjectREquest';
import { Types } from 'mongoose';
import { ProjectSearchRequest } from 'src/dto/projects/ProjectSearchRequest';

@Controller('api/projects')
export class ProjectController {
  constructor(private projectService: ProjectsService) { }

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  async saveProject(@Body() requestData: ProjectSaveRequest, @Request() req) {
    const userId = req.user?.userId as string; // Giả sử bạn có auth guard
    return await this.projectService.create(requestData, new Types.ObjectId(userId));
    // const data = await this.profileService.findById(id);
    // console.log(data);
    // return new BaseResponse(200, 'Successful', data);
  }

  @Post('')
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))
  @UseGuards(JwtAuthGuard)
  async search(@Body() searchRequest: ProjectSearchRequest) {
    return await this.projectService.search(searchRequest);
  }

  // @Post(':id')
  // @UseGuards(JwtAuthGuard)
  // async updateUserById(
  //   @Param('id') id: string,
  //   @Body() userData: { userName: string },
  // ) {
  //   return await this.profileService.updateProfile(id, userData);
  // }

  // @Post(':id/change-password')
  // @UseGuards(JwtAuthGuard)
  // async changePassword(
  //   @Param('id') id: string,
  //   @Body() changePasswordRequest: ChangePasswordRequest,
  // ) {
  //   return await this.profileService.changePassword(id, changePasswordRequest);
  // }
}
