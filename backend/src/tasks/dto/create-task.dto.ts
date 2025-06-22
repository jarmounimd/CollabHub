import {
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement user authentication' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Add JWT-based authentication with refresh tokens' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus = TaskStatus.TODO;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  projectId: string; 

  @ApiProperty({ example: '2025-12-31T23:59:59.999Z' })
  @IsOptional()
  @IsISO8601()
  dueDate?: string;
}
