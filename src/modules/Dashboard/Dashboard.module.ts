import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './Dashboard.service';
import { DashboardController } from './Dashboard.controller';
import { Project, ProjectSchema } from 'src/schemas/Project';
import { Task, TaskSchema } from 'src/schemas/Task';
import { ProjectMember, ProjectMemberSchema } from 'src/schemas/ProjectMember';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    MongooseModule.forFeature([{ name: ProjectMember.name, schema: ProjectMemberSchema }]),
  ],
  providers: [DashboardService],
  exports: [MongooseModule, DashboardService], // Quan trọng: export MongooseModule
  controllers: [DashboardController], // Có thể thêm controllers nếu cần
})
export class DashboardModule { }
