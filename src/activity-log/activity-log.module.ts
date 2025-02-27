import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLogService } from './services/activity-log.service';
import { Activity, ActivitySchema } from './schemas/activity.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema }
    ])
  ],
  providers: [ActivityLogService],
  exports: [ActivityLogService]
})
export class ActivityLogModule {}