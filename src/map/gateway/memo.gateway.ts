import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { encode } from 'ngeohash';
import { Socket } from 'socket.io';
import { HttpException, Logger } from '@nestjs/common';
import { MemoWriterRepository } from '../memoWriter.repository';
import { CacheService } from '../../cache/service/cache.service';

interface IMemoInput {
  content: string;
  divX: string;
  divY: string;
  roomId: string;
}

@WebSocketGateway({
  cors: {
    origin: [process.env.CORS_ORIGIN],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: 'memo',
})
export class MemoGateway {
  private logger = new Logger('memo');

  constructor(
    private readonly memoWriterRepository: MemoWriterRepository,
    private readonly cacheService: CacheService,
  ) {
    this.logger.log('constructor');
  }

  afterInit() {
    this.logger.log('init');
  }

  async handleConnection(@ConnectedSocket() socket: Socket) {
    try {
      const cacheDate = await this.cacheService.get('user_count');
      if (cacheDate) {
        await this.cacheService.set('user_count', Number(cacheDate) + 1);
      } else {
        await this.cacheService.set('user_count', 1);
      }
      const userCount = await this.cacheService.get('user_count');

      socket.broadcast.emit('user_count', userCount);
    } catch (error) {
      new HttpException(error, 400);
    }
    this.logger.log(`connected : ${socket.id} ${socket.nsp.name}`);
  }

  async handleDisconnect(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data,
  ) {
    const cacheDate = await this.cacheService.get('user_count');
    if (cacheDate) {
      await this.cacheService.set('user_count', Number(cacheDate) - 1);
    } else {
      await this.cacheService.set('user_count', 0);
    }
    const userCount = await this.cacheService.get('user_count');
    socket.broadcast.emit('user_count', userCount);
    this.logger.log(`disconnected : ${socket.id} ${socket.nsp.name}`);
  }

  @SubscribeMessage('disconnect_point')
  async setPoint(@ConnectedSocket() socket: Socket, @MessageBody() data) {
    const writer = await this.memoWriterRepository.getWriterBySocketId(
      socket.id,
    );

    if (writer) {
      const geoHash = encode(data[0], data[1], 8);
      await this.memoWriterRepository.endWriterUser(writer, geoHash);
    }
  }

  @SubscribeMessage('new_user')
  async handleNewUser(
    @MessageBody() data: [number, number],
    @ConnectedSocket() socket: Socket,
  ): Promise<{ success: boolean }> {
    try {
      const lat = data[0];
      const lng = data[1];

      const exist = await this.memoWriterRepository.getWriterBySocketId(
        socket.id,
      );
      const roomGeoHash = encode(lat, lng, 7);

      if (!exist) {
        const writer = {
          socket_id: socket.id,
          geoHash: encode(lat, lng, 8),
          create_user_ip: '192.168.0.1',
          create_at: new Date(Date.now()),
        };
        await this.memoWriterRepository.createNewWriter(writer);
      }

      await this.joinRoom(socket, roomGeoHash);
      this.logger.log(`new User at : ${socket.id} ${roomGeoHash}`);
      socket.emit('user_socket_id', [socket.id, roomGeoHash]);

      return { success: true };
    } catch (error) {
      // 에러 처리
      this.logger.log(
        `error occur at create new_user : ${socket.id}, ${error}`,
      );
      new HttpException(error, 400);
    }
  }

  @SubscribeMessage('user_count')
  async handleResponseUserCount() {
    try {
      const userCount = await this.cacheService.get('user_count');
      return userCount;
    } catch (error) {
      new HttpException(error, 400);
    }
  }

  @SubscribeMessage('memo_input')
  async handleNewMemoInput(
    @MessageBody() data: IMemoInput,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      const roomGeoHash = data.roomId;
      const message = { ...data, sid: socket.id };

      socket.broadcast.to(roomGeoHash).emit('memo_output', message);

      return { success: true };
    } catch (error) {
      this.logger.log(`error occur at memo_input : ${socket.id}, ${error}`);
      new HttpException(error, 400);
    }
  }

  private async joinRoom(socket: Socket, roomGeoHash: string) {
    await socket.join(roomGeoHash);
  }
}
