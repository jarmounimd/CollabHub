import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Group, GroupDocument } from '../entities/group.entity';
import { CreateGroupDto } from '../dto/create-group.dto';
import { UpdateGroupDto } from '../dto/update-group.dto';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async create(createGroupDto: CreateGroupDto, owner: User): Promise<Group> {
    const memberIds = createGroupDto.members 
      ? createGroupDto.members.map(id => new Types.ObjectId(id))
      : [];
    
    const group = new this.groupModel({
      ...createGroupDto,
      owner: new Types.ObjectId(owner._id),
      members: [...memberIds, new Types.ObjectId(owner._id)],
    });
    return group.save();
  }

  async findAll(): Promise<Group[]> {
    return this.groupModel
      .find()
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .exec();
  }

  async findOne(id: string): Promise<Group> {
    const group = await this.groupModel
      .findById(id)
      .populate('owner', 'firstName lastName email')
      .populate('members', 'firstName lastName email')
      .exec();

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
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    if (group.members.some(memberId => memberId.equals(userObjectId))) {
      throw new BadRequestException('User is already a member of this group');
    }

    group.members.push(userObjectId);
    return group.save();
  }

  async removeMember(groupId: string, userId: string): Promise<Group> {
    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    if (group.owner.equals(userObjectId)) {
      throw new BadRequestException('Cannot remove the group owner');
    }

    group.members = group.members.filter(
      memberId => !memberId.equals(userObjectId)
    );
    return group.save();
  }
}