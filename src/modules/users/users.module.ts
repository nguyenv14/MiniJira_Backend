import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/User';
import { UserController } from './users.controller';
import { UserService } from './users.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UserService],
  exports: [MongooseModule, UserService], // Quan trọng: export MongooseModule
  controllers: [UserController], // Có thể thêm controllers nếu cần
})
export class UserModule {}
