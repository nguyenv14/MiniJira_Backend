import { Body, Controller, Post, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { DashboardService } from './Dashboard.service';
import { DashboardRequest } from 'src/dto/dashboard/DashboardRequest';
import { BaseResponse } from 'src/utils/base-response';
import { Types } from 'mongoose';

@Controller('api/dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) { }

  @Post('get-task')
  @UseGuards(JwtAuthGuard)
  async getTaskByProjectId(@Body() data: DashboardRequest, @Request() req) {
    const userId = req.user?.id as string;
    return new BaseResponse(200, 'Success!', await this.dashboardService.dashboard(data, new Types.ObjectId(userId)))
  }
}
