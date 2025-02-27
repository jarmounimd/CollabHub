import { IsNotEmpty, IsString, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'E-commerce Platform' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'A full-stack e-commerce solution' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsMongoId()
  groupId: string;
}