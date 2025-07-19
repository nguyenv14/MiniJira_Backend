import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/User';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [ProfileService],
  exports: [MongooseModule, ProfileService], // Quan trọng: export MongooseModule
  controllers: [ProfileController], // Có thể thêm controllers nếu cần
})
export class ProfileModule {}
