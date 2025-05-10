import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { Project, ProjectSchema } from './entities/project.entity';
import { Group, GroupSchema } from '../groups/entities/group.entity';
import { Task, TaskSchema } from '../tasks/entities/task.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: Group.name, schema: GroupSchema },
      { name: Task.name, schema: TaskSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
