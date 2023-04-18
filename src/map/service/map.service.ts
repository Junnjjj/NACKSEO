import { Injectable } from '@nestjs/common';
import { encode } from 'ngeohash';
import { MemoRepository } from '../memo.repository';
import { memoRequestDto } from '../dtos/memo.request.dto';
import { MemoWriterRepository } from '../memoWriter.repository';
import { CacheService } from '../../cache/service/cache.service';
import { memoResponseDto } from '../dtos/memo.response.dto';

@Injectable()
export class MapService {
  constructor(
    private readonly memoRepository: MemoRepository,
    private readonly memoWriterRepository: MemoWriterRepository,
    private readonly cacheService: CacheService,
  ) {}

  async getMemoListByGeoHash(geoHash: string): Promise<memoResponseDto[]> {
    const cachedDate = await this.cacheService.get(geoHash);
    if (cachedDate) {
      return JSON.parse(cachedDate);
    }
    const memoList = await this.memoRepository.getMemoByGeoHash(geoHash);
    await this.cacheService.set(geoHash, JSON.stringify(memoList));
    return memoList;
  }

  async getGeoHash(lat: number, lng: number): Promise<memoResponseDto[]> {
    const geoHash = encode(lat, lng, 7);

    return this.getMemoListByGeoHash(geoHash);
  }

  async writeDoddle(body: memoRequestDto) {
    const roomGeoHash = encode(body.lat, body.lng, 7);
    const writer = await this.memoWriterRepository.getWriterBySocketId(
      body.sid,
    );
    const memo = {
      ...body,
      geoHash: encode(body.lat, body.lng, 8),
      memoWriter: writer,
      create_at: new Date(Date.now()),
    };

    const createdMemo = await this.memoRepository.createMemo(memo);
    const memoList = (await this.getMemoListByGeoHash(roomGeoHash)) || [];
    memoList.push(createdMemo);
    await this.cacheService.set(roomGeoHash, JSON.stringify(memoList));

    return createdMemo;
  }
}
