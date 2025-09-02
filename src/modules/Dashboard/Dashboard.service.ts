import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from 'src/schemas/Project';
import { DashboardRequest } from 'src/dto/dashboard/DashboardRequest';
import { Task, TaskDocument } from 'src/schemas/Task';
import { ProjectMember, ProjectMemberDocument } from 'src/schemas/ProjectMember';
import { TaskStatus } from 'src/utils/enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(ProjectMember.name) private projectMemberModel: Model<ProjectMemberDocument>
  ) { }

  async dashboard(data: DashboardRequest, userId: Types.ObjectId) {
    let projectIds: Types.ObjectId[] = [];

    if (data.projectId) {
      projectIds = [new Types.ObjectId(data.projectId)];
    } else {
      const projectMembers = await this.projectMemberModel.find({ user_id: userId });
      projectIds = projectMembers.map(pm => pm.project_id);
    }

    const taskFilter: any = {
      project_id: { $in: projectIds }
    };

    if (data.status !== undefined && data.status !== null && data.status != 0) {
      taskFilter.status = data.status;
    }

    if (data.priority !== undefined && data.priority !== null && data.priority != 0) {
      taskFilter.priority = data.priority;
    }

    if (data.isCurrentUser) {
      taskFilter.assignee = userId;
    }

    if (data.isOver) {
      const now = new Date();
      taskFilter.$and = [
        { end_date: { $lt: now } }, // end_date < now
        {
          $and: [
            { status: { $ne: TaskStatus.DONE } },      // status != DONE
            { status: { $ne: TaskStatus.CANCELLED } }  // status != CANCELLED
          ]
        }
      ];
    }

    // Lấy tasks
    const tasks = await this.taskModel.find(taskFilter)
      .populate('userAssignee', 'username fullName')
      .populate('userCreated', 'username fullName')
      .populate('project')
      .sort({ created_at: -1 });

    // Thống kê cơ bản
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task =>
      Number(task.status) === TaskStatus.DONE
    ).length;

    // Thống kê task quá hạn (end_date < hiện tại và chưa hoàn thành)
    const overdueTasks = tasks.filter(task =>
      task.end_date &&
      new Date(task.end_date) < new Date() &&
      Number(task.status) !== TaskStatus.DONE
    ).length;

    const normalTasks = totalTasks - overdueTasks - completedTasks;

    // Thống kê task theo ngày end_date (7 ngày gần nhất)
    const tasksByDate = this.groupTasksByDate(tasks);

    return {
      tasks,
      statistics: {
        total: totalTasks,
        overdue: overdueTasks,
        completed: completedTasks,
        normal: normalTasks
      },
      tasksByDate: tasksByDate
    };
  }

  // Hàm nhóm task theo ngày end_date
  private groupTasksByDate(tasks: any[]) {
    const dateGroups: { [key: string]: number } = {};

    // Đếm task theo từng ngày
    tasks.forEach(task => {
      if (task.end_date) {
        const taskDate = new Date(task.end_date).toISOString().split('T')[0]; // YYYY-MM-DD
        if (!dateGroups[taskDate]) {
          dateGroups[taskDate] = 0;
        }
        dateGroups[taskDate]++;
      }
    });

    // Sắp xếp theo ngày và chuyển thành array
    return Object.entries(dateGroups)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => ({
        date,
        count
      }));
  }
}
