// projects/dto/project-save.request.dto.ts
import {
  IsNotEmpty, IsString, IsOptional, IsArray, IsNumber, IsDateString,
  IsMongoId, Min, MinLength, MaxLength, ArrayNotEmpty, ArrayUnique, Matches
} from 'class-validator';
import { Types } from 'mongoose';

export class ProjectSaveRequest {

  @IsOptional()
  _id?: string;

  @IsNotEmpty({ message: 'Project name is required!' })
  @IsString({ message: 'Project name must be a string!' })
  @MinLength(3, { message: 'Project name must be at least 3 characters!' })
  @MaxLength(100, { message: 'Project name must be maximum 100 characters!' })
  name: string;

  @IsNotEmpty({ message: 'Basic info is required!' })
  @IsString({ message: 'Basic info must be a string!' })
  @MinLength(10, { message: 'Basic info must be at least 10 characters!' })
  @MaxLength(500, { message: 'Basic info must be maximum 500 characters!' })
  basicInfo: string;

  @IsNotEmpty({ message: 'Project code is required!' })
  @IsString({ message: 'Project code must be a string!' })
  @Matches(/^[A-Z0-9_-]+$/, { message: 'Project code must contain only uppercase letters, numbers, underscores and hyphens!' })
  @MinLength(3, { message: 'Project code must be at least 3 characters!' })
  @MaxLength(20, { message: 'Project code must be maximum 20 characters!' })
  code: string;

  @IsNotEmpty({ message: 'Description is required!' })
  @IsString({ message: 'Description must be a string!' })
  @MinLength(10, { message: 'Description must be at least 10 characters!' })
  @MaxLength(2000, { message: 'Description must be maximum 2000 characters!' })
  description: string;

  @IsNotEmpty({ message: 'Features are required!' })
  @IsString({ message: 'Features must be a string!' })
  @MinLength(10, { message: 'Features must be at least 10 characters!' })
  @MaxLength(2000, { message: 'Features must be maximum 2000 characters!' })
  features: string;

  @IsNotEmpty({ message: 'Project type is required!' })
  @IsNumber({}, { message: 'Project type must be a number!' })
  @Min(1, { message: 'Project type must be greater than 0!' })
  project_type: number;

  @IsNotEmpty({ message: 'Categories are required!' })
  @IsArray({ message: 'Categories must be an array!' })
  @ArrayNotEmpty({ message: 'Categories array must not be empty!' })
  @ArrayUnique({ message: 'Categories must be unique!' })
  @IsNumber({}, { each: true, message: 'Each category must be a number!' })
  categories: number[];

  @IsNotEmpty({ message: 'Industry is required!' })
  @IsNumber({}, { message: 'Industry must be a number!' })
  @Min(1, { message: 'Industry must be greater than 0!' })
  industry: number;

  @IsOptional()
  @IsDateString({}, { message: 'Start date must be a valid date!' })
  start_date?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'End date must be a valid date!' })
  end_date?: Date;

  @IsOptional()
  @IsArray({ message: 'Tags must be an array!' })
  @IsString({ each: true, message: 'Each tag must be a string!' })
  tags?: string[];

  @IsOptional()
  @IsMongoId({ message: 'Manager ID must be a valid MongoDB ID!' })
  manager?: Types.ObjectId;

  @IsNotEmpty({ message: 'Color is required!' })
  color: number
}