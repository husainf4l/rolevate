import { Test, TestingModule } from '@nestjs/testing';
import { LivekitService } from './livekit.service';
import { ConfigService } from '@nestjs/config';
import { RoomServiceClient } from 'livekit-server-sdk';

jest.mock('livekit-server-sdk', () => {
  return {
    RoomServiceClient: jest.fn().mockImplementation(() => ({
      createRoom: jest.fn().mockResolvedValue({
        name: 'test-room',
        sid: 'test-sid',
        emptyTimeout: 300,
        maxParticipants: 50,
        creationTime: 123456789,
        turnPassword: 'test-password',
        enabledCodecs: [],
        metadata: '',
        numParticipants: 0,
        activeRecording: false,
      }),
      deleteRoom: jest.fn().mockResolvedValue(undefined),
      listRooms: jest.fn().mockResolvedValue([
        {
          name: 'test-room',
          sid: 'test-sid',
          emptyTimeout: 300,
          maxParticipants: 50,
          creationTime: 123456789,
          turnPassword: 'test-password',
          enabledCodecs: [],
          metadata: '',
          numParticipants: 0,
          activeRecording: false,
        },
      ]),
    })),
    AccessToken: jest.fn().mockImplementation(() => ({
      addGrant: jest.fn(),
      toJwt: jest.fn().mockReturnValue('test-token'),
    })),
  };
});

describe('LivekitService', () => {
  let service: LivekitService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LivekitService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'LIVEKIT_API_KEY': 'test-api-key',
                'LIVEKIT_API_SECRET': 'test-api-secret',
                'LIVEKIT_URL': 'wss://test-livekit-url',
              };
              return config[key] || null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LivekitService>(LivekitService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateToken', () => {
    it('should generate a token with the provided options', async () => {
      const options = {
        identity: 'test-user',
        name: 'Test User',
        roomJoin: true,
      };

      const token = await service.generateToken(options);
      expect(token).toEqual('test-token');
    });
  });

  describe('createRoom', () => {
    it('should create a room with the provided options', async () => {
      const options = {
        name: 'test-room',
        emptyTimeout: 300,
        maxParticipants: 50,
      };

      const room = await service.createRoom(options);
      expect(room.name).toEqual('test-room');
    });
  });

  describe('listRooms', () => {
    it('should return a list of rooms', async () => {
      const rooms = await service.listRooms();
      expect(rooms).toHaveLength(1);
      expect(rooms[0].name).toEqual('test-room');
    });
  });
});
