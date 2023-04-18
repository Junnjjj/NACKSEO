import { Test, TestingModule } from '@nestjs/testing';
import { MemoGateway } from './memo.gateway';
import { MemoWriterRepository } from '../memoWriter.repository';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io';
import { encode } from 'ngeohash';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { INestApplication } from '@nestjs/common';

const mockMemoWriterRepository = {
  getWriterBySocketId: jest.fn(),
  createNewWriter: jest.fn(),
};

const now = new Date('2023-04-08T12:43:27.862Z');

describe('memoGateway', () => {
  //e2e test
  let app: INestApplication;
  let gateway: MemoGateway;
  let memoWriterRepository: MemoWriterRepository;

  beforeEach(async () => {
    app = await NestFactory.create(AppModule);
    await app.listen(3020);

    jest.spyOn(Date, 'now').mockImplementation(() => now.getTime());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoGateway,
        {
          provide: MemoWriterRepository,
          useValue: mockMemoWriterRepository,
        },
      ],
    }).compile();

    gateway = module.get<MemoGateway>(MemoGateway);
    memoWriterRepository = module.get(MemoWriterRepository);
  });

  describe('handleNewUser', () => {
    let ws;

    it(`새로운 app 생성 후, gateway 확인`, async () => {
      expect(gateway).toBeDefined();
      expect(app).toBeDefined();
    });

    it('test new_user', async () => {
      const mockData = [37.123456, 126.654321];
      const mockResult = [
        'ceXi3-rLGltY3RZ6AAAJ',
        encode(37.123456, 126.654321, 7),
      ];

      ws = io('http://localhost:8080/memo');

      // 이전에 등록한 이벤트 리스너 삭제
      ws.off('user_socket_id');

      ws.emit('new_user', mockData);

      let socketId: string;
      await new Promise<void>((resolve) =>
        ws.on('user_socket_id', (data) => {
          [socketId] = data;
          expect(data[1]).toEqual(mockResult[1]);
          resolve();
        }),
      );

      // socketId가 정의되어 있는지 검증
      expect(socketId).toBeDefined();
    });
  });

  describe('socket gateway test', () => {
    it('should be defined', () => {
      expect(gateway).toBeDefined();
    });

    it('socket event 등록 확인', async () => {
      const mockSocket: any = {
        id: 'ceXi3-rLGltY3RZ6AAAJ',
        emit: jest.fn(),
        on: jest.fn(),
        join: jest.fn(),
      };

      const mockMemo = {
        content: 'test',
        divX: '12',
        divY: '24',
        roomId: 'ceXi3-rLGltY3RZ6AAAJ',
      };

      // mock socket 함수 정의
      mockSocket.emit.mockImplementation(({ event, data }) => {
        if (event == 'new_user' || event == 'memo_input') {
          return { success: true };
        } else {
          return { success: false };
        }
      });

      const eventNewUser = await gateway.handleNewUser(
        [12, 126],
        mockSocket as Socket,
      );
      const eventInputMemo = await gateway.handleNewMemoInput(
        mockMemo,
        mockSocket as Socket,
      );

      expect(eventNewUser).toEqual({ success: true });
      expect(eventInputMemo).toEqual({ success: true });
    });
  });

  afterEach(() => app.close());
});
