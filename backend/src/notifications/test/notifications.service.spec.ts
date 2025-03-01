import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../services/notifications.service';
import { getModelToken } from '@nestjs/mongoose';
import { Notification } from '../schemas/notification.schema';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockNotificationModel: any;

  beforeEach(async () => {
    mockNotificationModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});