
import { Body, Controller, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { ProjectsService } from './project.service';
import { ProjectSaveRequest } from 'src/dto/projects/SaveProjectREquest';
import { Types } from 'mongoose';
import { ProjectSearchRequest } from 'src/dto/projects/ProjectSearchRequest';
import { addMemberToProjectRequest } from 'src/dto/projects/AddMemberToProjectRequest';

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
    const userId = req.user?.id as string;
    return await this.projectService.create(requestData, new Types.ObjectId(userId));
  }

  @Post('')
  // @UsePipes(new ValidationPipe({
  //   whitelist: true,
  //   forbidNonWhitelisted: true,
  //   transform: true
  // }))
  @UseGuards(JwtAuthGuard)
  async search(@Body() searchRequest: ProjectSearchRequest) {
    return await this.projectService.search(searchRequest);
  }

  @Post('detail')
  @UseGuards(JwtAuthGuard)
  async detail(@Body() data: { id: string }) {
    return await this.projectService.findById(data.id);
  }

  @Post('get-members-by-project-id')
  @UseGuards(JwtAuthGuard)
  async getMemberProject(@Body() data: { project_id: string, key: string }) {
    return await this.projectService.findByProjectIdWithMembers(data.project_id, data.key);
  }

  @Post('add-member')
  @UseGuards(JwtAuthGuard)
  async addMemberToProject(@Body() data: addMemberToProjectRequest) {
    return await this.projectService.addMemberToProject(data.projectId, data.userId, data.role);
  }

  @Post('remove-member')
  @UseGuards(JwtAuthGuard)
  async removeMemberFromProject(@Body() data: { projectId: string, userId: string }) {
    return await this.projectService.removeMemberFromProject(data.projectId, data.userId);
  }

  @Post('change-role-member')
  @UseGuards(JwtAuthGuard)
  async changeRoleMember(@Body() data: { projectId: string, userId: string, role: number }) {
    return await this.projectService.changeRoleMemberInProject(data.projectId, data.userId, data.role);
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
