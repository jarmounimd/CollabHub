import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateMessageDto {
  @ApiProperty({
    description: 'The content of the message',
    example: 'Hello team!',
  })
  @IsString()
  @IsNotEmpty()
  messageText: string;

  @ApiProperty({
    description: 'The ID of the project this message belongs to',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  senderId?: Types.ObjectId;
}
