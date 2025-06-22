import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GroupsService } from '../services/groups.service';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ParseMongoIdPipe } from '../../common/pipes/parse-mongo-id.pipe';
import { AddMemberDto } from '../dto/add-member.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@Controller('groups')
@ApiTags('groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  async create(@Request() req, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto, req.user);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add member to group' })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  async addMember(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() addMemberDto: AddMemberDto,
  ) {
    return this.groupsService.addMember(id, addMemberDto.userId);
  }

  @Delete(':id/members/:userId')
  removeMember(@Param('id') id: string, @Param('userId') userId: string) {
    return this.groupsService.removeMember(id, userId);
  }

  @Get(':groupId/members')
  async getGroupMembers(@Param('groupId') groupId: string) {
    const group = await this.groupsService.getMembers(groupId);
    return group.members; // Return only the members array
  }
}
