
import { Body, Controller, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { TasksService } from './task.service';
import { TaskSaveRequest } from 'src/dto/tasks/SaveTaskRequest';

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
    return await this.taskService.updateStatusTask(changeStatusRequest.taskId, changeStatusRequest.status);
  }
}
