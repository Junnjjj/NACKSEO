import { InjectRepository } from '@nestjs/typeorm';
import { MemoEntity } from '../entity/memo.entity';
import { Repository } from 'typeorm';
import { HttpException, Injectable } from '@nestjs/common';
import { MemoFactory } from './factory/memo.factory';
import { memoResponseDto } from './dtos/memo.response.dto';

@Injectable()
export class MemoRepository {
  constructor(
    @InjectRepository(MemoEntity)
    private memoRepository: Repository<MemoEntity>,
    private readonly memoFactory: MemoFactory,
  ) {}

  async getMemoByGeoHash(geoHash: string): Promise<memoResponseDto[]> {
    try {
      const memos = await this.memoRepository
        .createQueryBuilder('memo')
        .select(['lat, lng, geoHash, content, divX, divY'])
        .where('memo.geoHash like :geoHash', { geoHash: `${geoHash}%` })
        .getRawMany();

      return memos;
    } catch (error) {
      throw new HttpException('db error', 400);
    }
  }

  async createMemo(memo): Promise<memoResponseDto> {
    // MemoFactory 사용해 엔티티 생성
    const memoEntity = this.memoFactory.createMemoEntity(memo);

    try {
      const result = await this.memoRepository.save(memoEntity);

      const { content, lat, lng, divX, divY } = result;

      return { content, lat, lng, divX, divY };
    } catch (error) {
      throw new HttpException('db error', 400);
    }
  }
}
