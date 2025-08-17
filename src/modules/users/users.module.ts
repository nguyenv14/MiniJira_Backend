import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/User';
import { UserController } from './users.controller';
import { UserService } from './users.service';
import { ProjectMember, ProjectMemberSchema } from 'src/schemas/ProjectMember';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: ProjectMember.name, schema: ProjectMemberSchema }
    ]),
  ],
  providers: [UserService],
  exports: [MongooseModule, UserService], // Quan trọng: export MongooseModule
  controllers: [UserController], // Có thể thêm controllers nếu cần
})
export class UserModule { }
