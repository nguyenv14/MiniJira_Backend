// projects/projects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../users/users.module';
import { ProjectMember, ProjectMemberSchema } from 'src/schemas/ProjectMember';
import { TaskController } from './task.controller';
import { TasksService } from './task.service';
import { Task, TaskSchema } from 'src/schemas/Task';
import { TaskHistory, TaskHistorySchema } from 'src/schemas/TaskHistory';
import { TaskChecklist, TaskChecklistSchema } from 'src/schemas/TaskChecklist';
import { TaskComment, TaskCommentSchema } from 'src/schemas/TaskComment';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema },
      { name: TaskHistory.name, schema: TaskHistorySchema },
      { name: TaskChecklist.name, schema: TaskChecklistSchema },
      { name: TaskComment.name, schema: TaskCommentSchema }
    ]),
    UserModule,
  ],
  controllers: [TaskController],
  providers: [TasksService],
  exports: [TasksService], // Export để module khác có thể sử dụng
})
export class TaskModule { }