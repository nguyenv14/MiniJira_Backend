// projects/dto/project-search.request.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class addMemberToProjectRequest {

  @IsNotEmpty({ message: 'Project id is required!' })
  @IsString({ message: 'Project id must be a string!' })
  projectId: string;

  @IsNotEmpty({ message: 'Project id is required!' })
  @IsString({ message: 'Project id must be a string!' })
  userId: string;

  @IsNotEmpty({ message: 'Role is required!' })
  @IsNumber()
  role: number;
}