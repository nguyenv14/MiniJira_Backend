// projects/dto/project-search.request.dto.ts
import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectSearchRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string; // e.g., "name:asc,createdAt:desc"

  @IsOptional()
  @IsString()
  key?: string; // Search trong name, code, description

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  project_type?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  categories?: number[]; // Mảng category IDs

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  industry?: number;

  @IsOptional()
  @IsDateString()
  start_date_from?: string; // ISO date string

  @IsOptional()
  @IsDateString()
  start_date_to?: string; // ISO date string

  @IsOptional()
  @IsDateString()
  end_date_from?: string; // ISO date string

  @IsOptional()
  @IsDateString()
  end_date_to?: string; // ISO date string

  @IsOptional()
  @IsString({ each: true })
  tags?: string[]; // Mảng tags

  @IsOptional()
  @Type(() => String)
  @IsString()
  manager?: string; // Manager ID (string vì DTO)

  @IsOptional()
  @Type(() => String)
  @IsString()
  created_by?: string; // Creator ID (string vì DTO)
}