import { Injectable } from '@nestjs/common';
import { encode } from 'ngeohash';
import { MemoRepository } from './memo.repository';
import { MemoEntity } from '../entity/memo.entity';
import { memoRequestDto } from './dtos/memo.request.dto';

@Injectable()
export class MapService {
  constructor(private readonly memoRepository: MemoRepository) {}

  async getGeoHash(lat: number, lng: number): Promise<MemoEntity[]> {
    const geoHash = encode(lat, lng, 7);
    return await this.memoRepository.getMemoByGeoHash(geoHash);
  }

  async writeDoddle(body: memoRequestDto) {
    const geoHash = encode(body.lat, body.lng, 8);
    return await this.memoRepository.createMemo(body, geoHash);
  }
}
