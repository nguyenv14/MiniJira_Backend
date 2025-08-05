import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from '../../schemas/User';
import { UserSearchRequest } from 'src/dto/UserSearchRequest';
import { BaseSearchService } from '../Base/BaseSearchService';
import { BaseResponse } from 'src/utils/base-response';
import { ProjectMember, ProjectMemberDocument } from 'src/schemas/ProjectMember';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ProjectMember.name) private projectMemberModel: Model<ProjectMemberDocument>,
  ) { }

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

  async getAllUserByAddProject(projectId: string) {
    const members = await this.projectMemberModel.find({ project_id: new Types.ObjectId(projectId) });
    console.log('Project Members:', projectId, members);
    const memberUserIds = members.map((m) => m.user_id.toString());
    console.log('Member User IDs:', memberUserIds);
    const users = await this.userModel.find(
      { _id: { $nin: memberUserIds } }
    );
    return new BaseResponse(200, 'Users retrieved successfully', users);
  }
}
