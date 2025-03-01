import { IsNotEmpty, IsString, IsOptional, IsArray, MinLength, MaxLength, Matches, ArrayMaxSize, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({ 
    example: 'Development Team',
    description: 'Group name (3-50 characters, alphanumeric and spaces)',
    minLength: 3,
    maxLength: 50
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9\s-_]+$/, {
    message: 'Group name can only contain letters, numbers, spaces, hyphens and underscores'
  })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ 
    example: 'Main development team workspace',
    description: 'Group description (max 500 characters)',
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @ApiProperty({ 
    example: ['userId1', 'userId2'],
    description: 'Array of member IDs (max 50 members)',
    required: false
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @Transform(({ value }) => Array.isArray(value) ? [...new Set(value)] : [])
  members?: string[];
}