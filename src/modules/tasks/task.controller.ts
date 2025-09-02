
import { Body, Controller, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { TasksService } from './task.service';
import { TaskSaveRequest } from 'src/dto/tasks/SaveTaskRequest';
import { BaseResponse } from 'src/utils/base-response';

@Controller('api/tasks')
export class TaskController {
  constructor(private taskService: TasksService) { }

  @Post('save')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }))
  async saveTask(@Body() requestData: TaskSaveRequest, @Request() req) {
    const userId = req.user?.id as string;
    return await this.taskService.create(requestData, new Types.ObjectId(userId));
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  async search(@Body() searchRequest: { projectId: string, key: string }) {
    return await this.taskService.searchTasks(searchRequest);
  }

  @Post('change-status')
  @UseGuards(JwtAuthGuard)
  async updateStatusTask(@Body() changeStatusRequest: { taskId: string, status: number }, @Request() req) {
    const userId = req.user?.id as string;
    return await this.taskService.updateStatusTask(changeStatusRequest.taskId, changeStatusRequest.status, userId);
  }

  @Post('detail')
  async detail(@Body() data: { taskId: string }) {
    return new BaseResponse(200, 'success!', await this.taskService.fetchTaskDetail(data.taskId))
  }

  @Post('save-checklist')
  async saveChecklist(@Body() data: { taskId: string, title: string, checklistId: string | null }) {
    return new BaseResponse(200, 'success!', await this.taskService.addChecklist(data.taskId, data.checklistId, data.title));
  }

  @Post('change-status-checklist')
  async changeStatus(@Body() data: { checklistId: string }) {
    return new BaseResponse(200, 'success!', await this.taskService.changeChecklist(data.checklistId));
  }

  @Post('add-comment')
  @UseGuards(JwtAuthGuard)
  async addComment(@Body() data: { taskId: string, content: string, commentId?: string | null }, @Request() req) {
    const userId = req.user?.id as string;
    console.log('Received addComment request:', data, 'from user:', userId);
    return new BaseResponse(200, 'success!', await this.taskService.addOrUpdateComment(data.taskId, data.content, new Types.ObjectId(userId), data.commentId == null ? null : new Types.ObjectId(data.commentId)));
  }
}
