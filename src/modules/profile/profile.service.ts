import { Injectable, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/User';
import { BaseResponse } from 'src/utils/base-response';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findById(id: string) {
    const user = await this.userModel.findById(id);
    return new BaseResponse(200, 'Successful', user);
  }

  async updateProfile(
    id: string,
    userData: {
      userName: string;
    },
  ) {
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

  async changePassword(id: string, data: { currentPassword: string, newPassword: string }) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new BadRequestException('User not found!');
    }

    const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnprocessableEntityException({
        statusCode: 422,
        message: {
          currentPassword: 'Current password is incorrect!',
        },
        error: 'Unprocessable Entity Request',
      });
    }

    const hashedNewPassword = await bcrypt.hash(data.newPassword, 10);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { password: hashedNewPassword },
      { new: true }
    );

    if (!updatedUser) {
      throw new BadRequestException('User update failed!');
    }

    return new BaseResponse(200, 'Password changed successfully', {
      id: updatedUser.id as string,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  }

}
