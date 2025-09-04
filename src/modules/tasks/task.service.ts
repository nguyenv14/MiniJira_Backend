
// projects/projects.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectMember, ProjectMemberDocument } from 'src/schemas/ProjectMember';
import { getTaskStatusLabel, HistoryAction, RoleInProject, TaskStatus } from 'src/utils/enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Task, TaskDocument } from 'src/schemas/Task';
import { TaskSaveRequest } from 'src/dto/tasks/SaveTaskRequest';
import { BaseResponse } from 'src/utils/base-response';
import { TaskHistory, TaskHistoryDocument } from 'src/schemas/TaskHistory';
import { TaskChecklist, TaskChecklistDocument } from 'src/schemas/TaskChecklist';
import { TaskComment, TaskCommentDocument } from 'src/schemas/TaskComment';


@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(ProjectMember.name) private projectMemberModel: Model<ProjectMemberDocument>,
    @InjectModel(TaskHistory.name) private historyModel: Model<TaskHistoryDocument>,
    @InjectModel(TaskChecklist.name) private checklistModel: Model<TaskChecklistDocument>,
    @InjectModel(TaskComment.name) private taskCommentModel: Model<TaskCommentDocument>,
    @InjectConnection() private connection: Connection,
  ) {
  }

  async create(requestData: TaskSaveRequest, userId: Types.ObjectId) {
    try {
      if (requestData._id) {
        // update
        const { _id, project_id, ...updateData } = requestData;

        // Lấy task hiện tại để so sánh
        const currentTask = await this.taskModel.findById(_id);
        if (!currentTask) {
          throw new BadRequestException('Task not found');
        }

        // Chuẩn bị dữ liệu cập nhật
        const updatedTaskData = {
          ...updateData,
          project_id: new Types.ObjectId(project_id),
          updated_by: userId,
        };

        const updatedTask = await this.taskModel.findByIdAndUpdate(
          _id,
          updatedTaskData,
          { new: true }
        );

        if (!updatedTask) {
          throw new BadRequestException('Task not found');
        }

        // Kiểm tra và ghi lịch sử các trường hợp cần thiết
        await this.createTaskHistory(
          currentTask,
          updatedTask,
          userId,
          HistoryAction.UPDATE
        );

        return new BaseResponse(200, 'Task updated successfully', updatedTask);
      } else {
        // create
        const { _id, project_id, ...data } = requestData;
        const task = new this.taskModel({
          ...data,
          project_id: new Types.ObjectId(project_id),
          created_by: userId,
          updated_by: userId,
          status: TaskStatus.TODO,
        });

        const savedTask = await task.save();

        // Ghi lịch sử tạo task lần đầu tiên
        await this.createTaskHistory(
          null,
          savedTask,
          userId,
          HistoryAction.CREATE
        );

        return new BaseResponse(200, 'Task created successfully', { id: savedTask._id });
      }
    } catch (error) {
      console.error('Error creating/updating task:', error);
      throw new BadRequestException('Failed to create/update task');
    }
  }

  private async createTaskHistory(
    oldTask: TaskDocument | null,
    newTask: TaskDocument,
    userId: Types.ObjectId,
    action: HistoryAction
  ) {
    if (action === HistoryAction.CREATE) {
      // Tạo task lần đầu tiên
      const historyRecord = {
        task_id: newTask._id,
        notes: 'Task created',
        changed_by: userId,
        created_at: new Date()
      };
      await this.historyModel.create(historyRecord);
    } else if (action === HistoryAction.UPDATE && oldTask) {
      // Kiểm tra các trường hợp cần ghi lịch sử và gom lại thành 1 bản ghi
      const changes: string[] = [];

      // Update status task
      if (oldTask.status !== newTask.status) {
        changes.push(`Status: ${getTaskStatusLabel(oldTask.status)} → ${getTaskStatusLabel(newTask.status)}`);
      }

      // Update estimate hours
      if (oldTask.estimated_hours !== newTask.estimated_hours) {
        changes.push(`Estimate hours: ${oldTask.estimated_hours || 0} → ${newTask.estimated_hours || 0}`);
      }

      // Update actual hours
      if (oldTask.actual_hours !== newTask.actual_hours) {
        changes.push(`Actual hours: ${oldTask.actual_hours || 0} → ${newTask.actual_hours || 0}`);
      }

      // Chuyển đổi người assignee
      const oldAssignee = oldTask.assignee ? oldTask.assignee.toString() : null;
      const newAssignee = newTask.assignee ? newTask.assignee.toString() : null;

      if (oldAssignee !== newAssignee) {
        changes.push(`Assignee changed`);
      }

      // Nếu có thay đổi thì ghi lịch sử
      if (changes.length > 0) {
        const historyRecord = {
          task_id: newTask._id,
          notes: changes.join("; \n"),
          changed_by: userId,
          created_by: userId,
          created_at: new Date()
        };
        await this.historyModel.create(historyRecord);
      }
    }
  }

  async searchTasks(searchRequest: {
    projectId: string;
    key?: string;
    page?: number;
    limit?: number;
  }) {
    const { projectId } = searchRequest;

    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const project = await this.projectMemberModel.findOne({
      project_id: new Types.ObjectId(projectId),
    });

    if (!project) {
      throw new BadRequestException('Project not found or you do not have permission to access it');
    }

    const tasks = await this.taskModel.find({
      project_id: new Types.ObjectId(projectId),
    }).populate('userAssignee', '_id username email role').populate('userCreated', '_id username email role');

    return new BaseResponse(200, 'Tasks retrieved successfully', tasks);
  }

  async updateStatusTask(taskId: string, status: number, userId?: string) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new BadRequestException('Task not found');
    }

    const user = await this.projectMemberModel.findOne({ user_id: new Types.ObjectId(userId), project_id: task.project_id });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const role = user.role;

    const allowedTransitions = {
      [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
      [TaskStatus.IN_PROGRESS]: [
        TaskStatus.TODO,
        TaskStatus.REVIEW,
        TaskStatus.DONE,
        TaskStatus.CANCELLED
      ],
      [TaskStatus.REVIEW]: [TaskStatus.IN_PROGRESS, TaskStatus.DONE],
      [TaskStatus.DONE]: [],
      [TaskStatus.CANCELLED]: []
    };

    if (role == RoleInProject.ADMIN) {
      task.status = status;
    } else if (role == RoleInProject.LEADER) {
      if (!allowedTransitions[task.status].includes(status)) {
        throw new BadRequestException(
          `Can't not change from status ${getTaskStatusLabel(task.status)} to status ${getTaskStatusLabel(status)}`
        );
      }
      task.status = status;
    } else if (role == RoleInProject.MEMBER) {
      if (status === TaskStatus.DONE || status === TaskStatus.CANCELLED) {
        throw new BadRequestException(
          `Chỉ admin hoặc leader mới được phép chuyển sang trạng thái ${getTaskStatusLabel(status)}`
        );
      }
      if (!allowedTransitions[task.status].includes(status)) {
        throw new BadRequestException(
          `Can't not change from status ${getTaskStatusLabel(task.status)} to status ${getTaskStatusLabel(status)}`
        );
      }
      task.status = status;
    }
    await task.save();
    return new BaseResponse(200, 'Cập nhật trạng thái thành công', task);
  }


  async fetchTaskDetail(taskId: string) {
    const task = await this.taskModel.findById(new Types.ObjectId(taskId))
      .populate('userAssignee', '_id username email role')
      .populate('userCreated', '_id username email role');

    const result = task?.toObject();
    const checklists = await this.checklistModel.find({
      task_id: new Types.ObjectId(taskId),
    });

    const comments = await this.taskCommentModel.find({
      task_id: new Types.ObjectId(taskId),
    }).populate('user', '_id username email role');

    if (!result) {
      throw new BadRequestException('Task not found');
    }
    return {
      ...result,
      checklists,
      comments
    };
  }

  async addChecklist(taskId: string, checklistId: string | null, title: string) {
    try {
      if (checklistId) {
        // Update existing checklist
        const updatedChecklist = await this.checklistModel.findByIdAndUpdate(
          new Types.ObjectId(checklistId),
          { title },
          { new: true }
        );
        if (!updatedChecklist) {
          throw new Error('Checklist not found');
        }
        return updatedChecklist;
      } else {
        // Create new checklist
        const newChecklist = new this.checklistModel({
          task_id: new Types.ObjectId(taskId),
          title: title,
        });
        const savedChecklist = await newChecklist.save();
        return savedChecklist;
      }
    } catch (error) {
      throw new Error(`Failed to save checklist: ${error.message}`);
    }
  }

  async changeChecklist(checklistId: string) {
    try {
      const checklist = await this.checklistModel.findById(new Types.ObjectId(checklistId));
      if (!checklist) {
        throw new Error('Checklist not found');
      }
      checklist.completed = !checklist.completed;
      const updatedChecklist = await checklist.save();
      return updatedChecklist;
    } catch (error) {
      throw new Error(`Failed to update checklist: ${error.message}`);
    }
  }

  async addOrUpdateComment(
    taskId: string,
    comment: string,
    userId: Types.ObjectId,
    commentId?: Types.ObjectId | null, // nếu có thì update
  ) {
    const task = await this.taskModel.findById(new Types.ObjectId(taskId));
    if (!task) {
      throw new Error('Task not found');
    }

    if (commentId) {
      // Update existing comment
      const updatedComment = await this.taskCommentModel.findOneAndUpdate(
        { _id: commentId, task_id: task._id, user_id: userId },
        { content: comment },
        { new: true },
      );

      if (!updatedComment) {
        throw new Error('Comment not found or unauthorized');
      }

      return updatedComment;
    }
    try {
      const newComment = new this.taskCommentModel({
        task_id: task._id,
        user_id: userId,
        content: comment,
      });

      const savedComment = await newComment.save();
      return savedComment;
    } catch (error) {
      console.error('Failed to save comment:', error);
      throw new Error('Failed to save comment');
    }
  }
}