// projects/dto/project-search.request.dto.ts
import { IsOptional } from 'class-validator';

export class DashboardRequest {
  @IsOptional()
  projectId: string;

  @IsOptional()
  status: number;

  @IsOptional()
  priority: number;

  @IsOptional()
  isCurrentUser: boolean;

  @IsOptional()
  isOver: boolean;
}