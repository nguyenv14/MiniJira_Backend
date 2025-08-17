// tasks/dto/task-save.request.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsDateString,
  IsMongoId,
  MaxLength,
  MinLength,
  // ArrayNotEmpty,
  // ArrayUnique,
  // ValidateNested
} from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

class AttachmentDto {
  @IsNotEmpty({ message: 'Attachment name is required!' })
  @IsString({ message: 'Attachment name must be a string!' })
  name: string;

  @IsNotEmpty({ message: 'Attachment URL is required!' })
  @IsString({ message: 'Attachment URL must be a string!' })
  url: string;
}

export class TaskSaveRequest {
  @IsOptional()
  // @IsMongoId({ message: 'Task ID must be a valid MongoDB ID!' })
  _id?: Types.ObjectId;

  @IsNotEmpty({ message: 'Project ID is required!' })
  @IsMongoId({ message: 'Project ID must be a valid MongoDB ID!' })
  project_id: Types.ObjectId;

  @IsNotEmpty({ message: 'Title is required!' })
  @IsString({ message: 'Title must be a string!' })
  @MinLength(3, { message: 'Title must be at least 3 characters!' })
  @MaxLength(200, { message: 'Title must be maximum 200 characters!' })
  title: string;

  @IsNotEmpty({ message: 'Description is required!' })
  @IsString({ message: 'Description must be a string!' })
  @MaxLength(2000, { message: 'Description must be maximum 2000 characters!' })
  description?: string;

  @IsOptional()
  @IsMongoId({ message: 'Assignee ID must be a valid MongoDB ID!' })
  assignee?: Types.ObjectId;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date!' })
  start_date?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date!' })
  end_date?: Date;

  @IsNotEmpty({ message: 'Priority is required!' })
  @IsNumber({}, { message: 'Priority must be a number!' })
  priority?: number;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array!' })
  @IsString({ each: true, message: 'Each tag must be a string!' })
  tags?: string[];

  @IsOptional()
  // @ArrayNotEmpty({ message: 'Attachments must not be empty!' })
  // @ArrayUnique({ message: 'Attachments must be unique!' })
  // @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsNumber({}, { message: 'Estimated hours must be a number!' })
  estimated_hours?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Actual hours must be a number!' })
  actual_hours?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Completed at must be a valid date!' })
  completed_at?: Date;

  @IsOptional()
  parent_task_id?: Types.ObjectId;

  @IsOptional()
  is_subtask?: boolean;
}
