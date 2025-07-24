import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/User';
import { UserSearchRequest } from 'src/dto/UserSearchRequest';
import { BaseSearchService } from '../Base/BaseSearchService';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) { }

  async findOne(data: any) {
    return this.userModel.findOne(data);
  }

  async findAll(filter: UserSearchRequest) {
    return BaseSearchService.search(this.userModel, {
      page: filter.page,
      limit: filter.limit,
      sort: filter.sort,
      key: filter.key,
      searchFields: ['username', 'email'],
      customQuery: (query) => {
        if (filter.role) {
          query.role = filter.role;
        }
        if (filter.position) {
          query.position = filter.position;
        }
        if (filter.department) {
          query.position = filter.department;
        }
        if (filter.active != null) {
          query.isActive = filter.active;
        }
      },
      selectFields: ['username', 'email', 'role', 'isActive', 'position', 'department']
    });
  }

  async deleteUser(id: string) {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new BadRequestException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
