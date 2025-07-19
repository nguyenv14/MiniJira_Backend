import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User';
import { BaseResponse } from 'src/utils/base-response';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    return {
      id: user?.id as string,
      username: user?.username,
      email: user?.email,
      role: user?.role,
    };
  }

  async updateProfile(
    id: string,
    userData: {
      userName: string;
    },
  ) {
    console.log(userData);
    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { username: userData.userName },
      { new: true }, // trả về bản ghi đã cập nhật
    );

    if (!updatedUser) {
      throw new BadRequestException(400, 'User not found');
    }

    const data = {
      id: updatedUser.id as string,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    };
    return new BaseResponse(200, 'Successfull', data);
  }
}
