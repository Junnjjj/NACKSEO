import { HttpException, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from '@liaoliaots/nestjs-redis';

@Injectable()
export class CacheService {
  private readonly redisClient: Redis;
  constructor(private readonly redisService: RedisService) {
    this.redisClient = redisService.getClient();
  }

  async get(key: string) {
    try {
      return this.redisClient.get(key);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async set(key: string, value, expire?: number) {
    try {
      return this.redisClient.set(key, value, 'EX', expire ?? 3600 * 96);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async del(key: string): Promise<number> {
    try {
      return this.redisClient.del(key);
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
