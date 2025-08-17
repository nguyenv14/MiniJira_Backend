
// projects/projects.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectMember, ProjectMemberDocument } from 'src/schemas/ProjectMember';
import { getTaskStatusLabel, HistoryAction, TaskStatus } from 'src/utils/enum';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Task, TaskDocument } from 'src/schemas/Task';
import { TaskSaveRequest } from 'src/dto/tasks/SaveTaskRequest';
import { BaseResponse } from 'src/utils/base-response';
import { TaskHistory, TaskHistoryDocument } from 'src/schemas/TaskHistory';


@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(ProjectMember.name) private projectMemberModel: Model<ProjectMemberDocument>,
    @InjectModel(TaskHistory.name) private historyModel: Model<TaskHistoryDocument>,
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

  async updateStatusTask(taskId: string, status: number) {
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      throw new BadRequestException('Task not found');
    }

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

    if (!allowedTransitions[task.status].includes(status)) {
      throw new BadRequestException(`Can't not change from status ${getTaskStatusLabel(task.status)} to status ${getTaskStatusLabel(status)}`);
    }

    task.status = status;
    await task.save();
    return new BaseResponse(200, 'Cập nhật trạng thái thành công', task);
  }
}