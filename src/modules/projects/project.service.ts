
// projects/projects.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../../schemas/Project';
import { ProjectSaveRequest } from '../../dto/projects/SaveProjectREquest';
import { UserService } from '../users/users.service';
import { ProjectMember, ProjectMemberDocument } from 'src/schemas/ProjectMember';
import { RoleInProject } from 'src/utils/enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { BaseResponse } from 'src/utils/base-response';
import { ProjectSearchRequest } from 'src/dto/projects/ProjectSearchRequest';
import { BaseSearchOptions, BaseSearchService } from '../Base/BaseSearchService';
// import { User, UserDocument } from 'src/schemas/User';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectMember.name) private projectMemberModel: Model<ProjectMemberDocument>,
    private readonly userService: UserService, // Inject để kiểm tra user tồn tại
    @InjectConnection() private connection: Connection,
  ) {
  }

  // Tạo project mới
  async create(request: ProjectSaveRequest, createdBy: Types.ObjectId): Promise<BaseResponse<Project>> {
    try {
      const existingProject = await this.projectModel.findOne({ code: request.code });
      if (existingProject) {
        throw new BadRequestException('Project code already exists!');
      }

      const project = new this.projectModel({
        ...request,
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
          throw error; // Re-throw lỗi validation
        }
        await this.projectModel.findByIdAndDelete(savedProject._id);
        throw new BadRequestException('Failed to add creator to project members: ' + error.message);
      }

      return new BaseResponse(200, 'Project create successful!', savedProject);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create project: ' + error.message);
    }
  }

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
        .populate('created_by manager')
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
  async findById(id: string): Promise<Project> {
    // if (!Types.isValidObjectId(id)) {
    //   throw new BadRequestException('Invalid project ID!');
    // }

    const project = await this.projectModel.findById(id).populate('created_by manager');
    if (!project) {
      throw new BadRequestException('Project not found!');
    }

    return project;
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