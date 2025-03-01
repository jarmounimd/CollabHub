import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateGroupDto } from './create-group.dto';
import { IsMongoId, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGroupDto extends PartialType(
  OmitType(CreateGroupDto, ['members'] as const)
) {}

export class AddMemberDto {
  @ApiProperty({
    example: '507f1f77bcf86cd799439011',
    description: 'MongoDB ID of the user to add'
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;
}