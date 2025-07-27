// projects/projects.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from './project.controller';
import { ProjectsService } from './project.service';
import { Project, ProjectSchema } from '../../schemas/Project';
import { UserModule } from '../users/users.module';
import { ProjectMember, ProjectMemberSchema } from 'src/schemas/ProjectMember';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
       { name: ProjectMember.name, schema: ProjectMemberSchema } 
    ]),
    UserModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectsService],
  exports: [ProjectsService], // Export để module khác có thể sử dụng
})
export class ProjectsModule { }