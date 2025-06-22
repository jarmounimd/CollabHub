import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroupsService } from './services/groups.service';
import { GroupsController } from './controllers/groups.controller';
import { Group, GroupSchema } from './entities/group.entity';
import { User, UserSchema } from '../users/entities/user.entity'; // <-- Add this
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Group.name, schema: GroupSchema },
      { name: User.name, schema: UserSchema }, // <-- Add this line
    ]),
    NotificationsModule,
    UsersModule,
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
