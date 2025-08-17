
// projects/projects.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../../schemas/Project';
import { ProjectSaveRequest } from '../../dto/projects/SaveProjectREquest';
import { UserService } from '../users/users.service';
import { ProjectMember, ProjectMemberDocument, ProjectMemberPopulated } from 'src/schemas/ProjectMember';
import { RoleInProject } from 'src/utils/enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { BaseResponse } from 'src/utils/base-response';
import { ProjectSearchRequest } from 'src/dto/projects/ProjectSearchRequest';
import { BaseSearchOptions, BaseSearchService } from '../Base/BaseSearchService';
import { User } from 'src/schemas/User';


@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectMember.name) private projectMemberModel: Model<ProjectMemberDocument>,
    private readonly userService: UserService, // Inject để kiểm tra user tồn tại
    @InjectConnection() private connection: Connection,
  ) {
  }


  // projects/projects.service.ts

  async save(request: ProjectSaveRequest, userId: Types.ObjectId) {
    try {
      // Kiểm tra nếu có _id thì là update, ngược lại là create
      console.log('Request to save project:', request);
      if (request._id) {
        // Update mode
        return await this.update(request, userId);
      } else {
        // Create mode
        return await this.create(request, userId);
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to save project: ' + error.message);
    }
  }

  // Method tạo mới project (giữ nguyên logic cũ)
  async create(request: ProjectSaveRequest, createdBy: Types.ObjectId) {
    try {
      const existingProject = await this.projectModel.findOne({ code: request.code });
      if (existingProject) {
        throw new BadRequestException('Project code already exists!');
      }

      const project = new this.projectModel({
        ...request,
        manager: createdBy,
        created_by: createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const savedProject = await project.save();

      const projectMember = new this.projectMemberModel({
        project_id: savedProject._id,
        user_id: createdBy,
        role: RoleInProject.ADMIN,
        joined_at: new Date(),
      });

      try {
        await projectMember.save();
      } catch (error) {
        if (error instanceof BadRequestException) {
          throw error;
        }
        await this.projectModel.findByIdAndDelete(savedProject._id);
        throw new BadRequestException('Failed to add creator to project members: ' + error.message);
      }

      return new BaseResponse(200, 'Project created successfully!', savedProject);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create project: ' + error.message);
    }
  }

  async update(request: ProjectSaveRequest, updatedBy: Types.ObjectId) {
    try {
      // Kiểm tra project có tồn tại không
      const existingProject = await this.projectModel.findById(request._id);
      if (!existingProject) {
        throw new BadRequestException('Project not found!');
      }
      // Kiểm tra nếu code bị thay đổi thì có trùng với project khác không
      if (request.code !== existingProject.code) {
        const duplicateProject = await this.projectModel.findOne({
          code: request.code,
          _id: { $ne: request._id }
        });
        console.log('Duplicate project:', duplicateProject);
        if (duplicateProject) {
          throw new BadRequestException('Project code already exists111!');
        }
      }
      const { _id, manager, ...updateData } = request;
      const updatedProject = await this.projectModel.findByIdAndUpdate(
        _id,
        {
          ...updateData,
          manager: new Types.ObjectId(manager),
          updated_by: updatedBy,
          updatedAt: new Date(),
        },
        { new: true }
      );

      return new BaseResponse(200, 'Project updated successfully!', updatedProject);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to update project: ' + error.message);
    }
  }

  // Tạo project mới
  // async create(request: ProjectSaveRequest, createdBy: Types.ObjectId): Promise<BaseResponse<Project>> {
  //   try {
  //     const existingProject = await this.projectModel.findOne({ code: request.code });
  //     if (existingProject) {
  //       throw new BadRequestException('Project code already exists!');
  //     }

  //     const project = new this.projectModel({
  //       ...request,
  //       manager: createdBy,
  //       created_by: createdBy,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     });

  //     const savedProject = await project.save();

  //     const projectMember = new this.projectMemberModel({
  //       project_id: savedProject._id,
  //       user_id: createdBy,
  //       role: RoleInProject.ADMIN,
  //       joined_at: new Date(),
  //     });

  //     try {
  //       await projectMember.save();
  //     } catch (error) {
  //       if (error instanceof BadRequestException) {
  //         throw error; // Re-throw lỗi validation
  //       }
  //       await this.projectModel.findByIdAndDelete(savedProject._id);
  //       throw new BadRequestException('Failed to add creator to project members: ' + error.message);
  //     }

  //     return new BaseResponse(200, 'Project create successful!', savedProject);

  //   } catch (error) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     throw new BadRequestException('Failed to create project: ' + error.message);
  //   }
  // }

  // Lấy tất cả projects
  async search(searchRequest: ProjectSearchRequest): Promise<BaseResponse<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt:desc',
        key,
        project_type,
        categories,
        industry,
        start_date_from,
        start_date_to,
        end_date_from,
        end_date_to,
        tags,
        manager,
        created_by
      } = searchRequest;

      // Chuẩn bị search options cho BaseSearchService
      const searchOptions: BaseSearchOptions = {
        page,
        limit,
        sort,
        key,
        searchFields: ['name', 'code', 'description', 'basicInfo'], // Fields cho text search
        selectFields: [] // Có thể chọn field nếu cần
      };

      // Custom query filter
      searchOptions.customQuery = (query: any) => {
        if (project_type) {
          query.project_type = project_type;
        }

        if (industry) {
          query.industry = industry;
        }

        if (categories && categories.length > 0) {
          query.categories = { $in: categories };
        }

        if (tags && tags.length > 0) {
          query.tags = { $in: tags };
        }

        if (start_date_from || start_date_to) {
          query.start_date = {};
          if (start_date_from) query.start_date.$gte = new Date(start_date_from);
          if (start_date_to) query.start_date.$lte = new Date(start_date_to);
        }

        if (end_date_from || end_date_to) {
          query.end_date = {};
          if (end_date_from) query.end_date.$gte = new Date(end_date_from);
          if (end_date_to) query.end_date.$lte = new Date(end_date_to);
        }

        if (manager) {
          query.manager = new Types.ObjectId(manager);
        }

        if (created_by) {
          query.created_by = new Types.ObjectId(created_by);
        }
      };

      const result = await BaseSearchService.search<ProjectDocument>(
        this.projectModel,
        searchOptions
      );

      // Populate references nếu cần
      const populatedData = await this.projectModel
        .find({ _id: { $in: result.data.map(item => item._id) } })
        .populate('createdByUser') // Populate virtual field
        .populate('managerUser')   // Populate virtual field
        .exec();

      return new BaseResponse(200, 'Projects retrieved successfully!', {
        data: populatedData,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });

    } catch (error) {
      throw new BadRequestException('Failed to search projects: ' + error.message);
    }
  }

  // Lấy project theo ID
  async findById(id: string): Promise<BaseResponse<ProjectDocument>> {

    const project = await this.projectModel.findById(id).populate('managerUser');
    if (!project) {
      throw new BadRequestException('Project not found!');
    }

    return new BaseResponse(200, 'Project found successfully!', project);
  }

  async findByProjectIdWithMembers(id: string, key: string) {
    const searchCondition = key
      ? {
        $or: [
          { username: { $regex: key, $options: 'i' } },
          { email: { $regex: key, $options: 'i' } }
        ]
      }
      : {};
    const projectMembersRaw = await this.projectMemberModel.find({
      project_id: new Types.ObjectId(id)
    }).populate({
      path: 'user',
      select: 'username email role isActive isAdmin',
      match: searchCondition
    }) as unknown as ProjectMemberPopulated[];

    const projectMembers = projectMembersRaw.filter(pm => pm?.user as User);
    if (!projectMembers) {
      throw new BadRequestException('No members found for this project!');
    }
    return new BaseResponse(200, 'Project members found successfully!', projectMembers);
  }

  async addMemberToProject(projectId: string, userId: string, role: number) {
    try {
      const project = await this.projectModel.findById(projectId);
      if (!project) {
        throw new BadRequestException('Project not found!');
      }

      const user = await this.userService.findOne({ _id: userId });
      if (!user) {
        throw new BadRequestException('User not found!');
      }

      const existingMember = await this.projectMemberModel.findOne({ project_id: projectId, user_id: userId });
      if (existingMember) {
        throw new BadRequestException('User is already a member of this project!');
      }

      const newMember = new this.projectMemberModel({
        project_id: new Types.ObjectId(projectId),
        user_id: new Types.ObjectId(userId),
        role,
        joined_at: new Date()
      });

      await newMember.save();
      return new BaseResponse(200, 'Member added to project successfully!', newMember);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to add member to project: ' + error.message);
    }
  }

  async removeMemberFromProject(projectId: string, userId: string) {
    try {
      const member = await this.projectMemberModel.findOne({ project_id: new Types.ObjectId(projectId), _id: new Types.ObjectId(userId) });
      if (!member) {
        throw new BadRequestException('User is not a member of this project!');
      }
      await this.projectMemberModel.deleteOne({ _id: member._id });
      return new BaseResponse(200, 'Member removed from project successfully!', null);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to remove member from project: ' + error.message);
    }
  }

  async changeRoleMemberInProject(projectId: string, userId: string, role: number) {
    try {
      const member = await this.projectMemberModel.findOne({ project_id: new Types.ObjectId(projectId), _id: new Types.ObjectId(userId) });
      if (!member) {
        throw new BadRequestException('User is not a member of this project!');
      }

      member.role = role;
      await member.save();
      return new BaseResponse(200, 'Member role updated successfully!', member);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to change member role in project: ' + error.message);
    }
  }

  // Lấy projects theo user (created by hoặc manager)
  // async findByUser(userId: string): Promise<Project[]> {
  //   if (!Types.isValidObjectId(userId)) {
  //     throw new BadRequestException('Invalid user ID!');
  //   }

  //   return await this.projectModel.find({
  //     $or: [
  //       { created_by: new Types.ObjectId(userId) },
  //       { manager: new Types.ObjectId(userId) }
  //     ]
  //   }).populate('created_by manager');
  // }

  // Cập nhật project
  // async update(id: string, request: Partial<ProjectSaveRequest>): Promise<Project> {
  //   if (!Types.isValidObjectId(id)) {
  //     throw new BadRequestException('Invalid project ID!');
  //   }

  //   // Kiểm tra manager tồn tại (nếu có cập nhật)
  //   if (request.manager) {
  //     const managerExists = await this.usersService.findById(request.manager.toString());
  //     if (!managerExists) {
  //       throw new BadRequestException('Manager does not exist!');
  //     }
  //   }

  //   // Kiểm tra code đã tồn tại chưa (ngoại trừ project hiện tại)
  //   if (request.code) {
  //     const existingProject = await this.projectModel.findOne({
  //       code: request.code,
  //       _id: { $ne: new Types.ObjectId(id) }
  //     });
  //     if (existingProject) {
  //       throw new BadRequestException('Project code already exists!');
  //     }
  //   }

  //   const updatedProject = await this.projectModel.findByIdAndUpdate(
  //     id,
  //     {
  //       ...request,
  //       updatedAt: new Date()
  //     },
  //     { new: true }
  //   ).populate('created_by manager');

  //   if (!updatedProject) {
  //     throw new NotFoundException('Project not found!');
  //   }

  //   return updatedProject;
  // }

  // Xóa project
  // async delete(id: string): Promise<boolean> {
  //   if (!Types.isValidObjectId(id)) {
  //     throw new BadRequestException('Invalid project ID!');
  //   }

  //   const result = await this.projectModel.findByIdAndDelete(id);
  //   if (!result) {
  //     throw new NotFoundException('Project not found!');
  //   }

  //   return true;
  // }

  // // Tìm project theo code
  // async findByCode(code: string): Promise<Project> {
  //   const project = await this.projectModel.findOne({ code }).populate('created_by manager');
  //   if (!project) {
  //     throw new NotFoundException('Project not found!');
  //   }
  //   return project;
  // }
}