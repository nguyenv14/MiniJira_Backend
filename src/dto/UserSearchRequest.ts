import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class UserSearchRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  sort?: string; // e.g., "id:desc,username:asc"

  @IsOptional()
  @IsString()
  key?: string;

  @IsOptional()
  @IsNumber()
  role?: number;

  @IsOptional()
  @IsNumber()
  position?: string;

  @IsOptional()
  @IsNumber()
  department?: number;

  @IsOptional()
  @Type(() => Boolean)
  active?: number;
}
