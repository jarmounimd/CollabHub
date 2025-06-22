import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from '../entities/group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { User } from '../../users/entities/user.entity';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { NotificationType } from '../../notifications/schemas/notification.schema';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(createGroupDto: CreateGroupDto, owner: User): Promise<Group> {
    const memberIds = createGroupDto.members
      ? createGroupDto.members.map((id) => new Types.ObjectId(id))
      : [];

    const group = new this.groupModel({
      ...createGroupDto,
      owner: new Types.ObjectId(owner._id),
      members: [...memberIds, new Types.ObjectId(owner._id)],
    });
    return group.save();
  }

  async findAll(): Promise<Group[]> {
    const groups = await this.groupModel
      .find()
      .populate('owner', 'firstName lastName email')
      .populate({
        path: 'members',
        model: 'User',
        select: 'firstName lastName email',
      })
      .exec();

    this.logger.log(`[findAll] groups: ${JSON.stringify(groups, null, 2)}`);
    if (groups.length > 0) {
      this.logger.log(
        `[findAll] first group members: ${JSON.stringify(
          groups[0].members,
          null,
          2,
        )}`,
      );
      if (groups[0].members && groups[0].members.length > 0) {
        this.logger.log(
          `[findAll] first member keys: ${Object.keys(groups[0].members[0])}`,
        );
        this.logger.log(
          `[findAll] first member value: ${JSON.stringify(
            groups[0].members[0],
            null,
            2,
          )}`,
        );
      }
    }
    return groups;
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel
      .findById(id)
      .populate('owner', 'firstName lastName email')
      .populate({
        path: 'members',
        model: 'User',
        select: 'firstName lastName email',
      })
      .exec();

    this.logger.log(`[findOne] group: ${JSON.stringify(group, null, 2)}`);
    if (group && group.members && group.members.length > 0) {
      this.logger.log(
        `[findOne] first member keys: ${Object.keys(group.members[0])}`,
      );
      this.logger.log(
        `[findOne] first member value: ${JSON.stringify(
          group.members[0],
          null,
          2,
        )}`,
      );
    }

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.groupModel
      .findByIdAndUpdate(id, updateGroupDto, { new: true })
      .exec();

    if (!group) {
      throw new NotFoundException('Group not found');
    }
    return group;
  }

  async remove(id: string): Promise<void> {
    const result = await this.groupModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Group not found');
    }
  }

  async addMember(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const userObjectId = new Types.ObjectId(userId);
    if (
      group.members.some((memberId: any) =>
        memberId instanceof Types.ObjectId
          ? memberId.equals(userObjectId)
          : memberId._id.toString() === userObjectId.toString(),
      )
    ) {
      throw new BadRequestException('User is already a member of this group');
    }

    group.members.push(new Types.ObjectId(userId));
    const savedGroup = await group.save();

    // Add notification
    await this.notificationsService.create({
      type: NotificationType.GROUP_INVITATION,
      message: `You have been added to group: ${group.name}`,
      userId: userId,
      entityId: (group as any)._id?.toString() || group.id?.toString(),
      entityType: 'Group',
    });

    return savedGroup;
  }

  async removeMember(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    if (!group) throw new NotFoundException('Group not found');

    const userObjectId = new Types.ObjectId(userId);
    if (
      (group.owner instanceof Types.ObjectId &&
        group.owner.equals(userObjectId)) ||
      (typeof group.owner === 'object' &&
        group.owner &&
        'id' in group.owner &&
        group.owner.id.toString() === userObjectId.toString()) ||
      (typeof group.owner === 'object' &&
        group.owner &&
        '_id' in group.owner &&
        group.owner._id.toString() === userObjectId.toString())
    ) {
      throw new BadRequestException('Cannot remove the group owner');
    }

    group.members = group.members.filter((memberId: any) => {
      if (memberId instanceof Types.ObjectId) {
        return !memberId.equals(userObjectId);
      }
      return memberId._id.toString() !== userObjectId.toString();
    }) as any;

    return group.save();
  }

  async getMembers(groupId: string) {
    const group = await this.groupModel
      .findById(groupId)
      .populate('owner', 'firstName lastName email')
      .populate({
        path: 'members',
        model: 'User',
        select: 'firstName lastName email',
      })
      .exec();

    this.logger.log(`[getMembers] group: ${JSON.stringify(group, null, 2)}`);
    if (group && group.members && group.members.length > 0) {
      this.logger.log(
        `[getMembers] first member keys: ${Object.keys(group.members[0])}`,
      );
      this.logger.log(
        `[getMembers] first member value: ${JSON.stringify(
          group.members[0],
          null,
          2,
        )}`,
      );
    }

    if (!group) throw new NotFoundException('Group not found');

    return group; // Return the whole group, not just members
  }
}
