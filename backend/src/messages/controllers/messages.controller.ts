import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MessagesService } from '../services/messages.service';
import { CreateMessageDto } from '../dto/create-message.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Types } from 'mongoose';

@ApiTags('messages')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto, @Request() req) {
    const messageData = {
      ...createMessageDto,
      senderId: new Types.ObjectId(req.user.userId),
      projectId: new Types.ObjectId(createMessageDto.projectId),
    };
    return this.messagesService.create(messageData);
  }

  @Get('project/:projectId')
  findAllByProject(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.messagesService.findAllByProject(projectId);
  }

  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.messagesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseMongoIdPipe) id: string, @Request() req) {
    return this.messagesService.remove(id, req.user.userId); // Using userId like in FilesService
  }
}
