import { Injectable } from '@nestjs/common';
import { MemoEntity } from '../../entity/memo.entity';

@Injectable()
export class MemoFactory {
  createMemoEntity(memo): MemoEntity {
    const memoEntity = new MemoEntity();

    memoEntity.content = memo.content;
    memoEntity.lat = memo.lat;
    memoEntity.lng = memo.lng;
    memoEntity.divX = memo.divX;
    memoEntity.divY = memo.divY;
    memoEntity.geoHash = memo.geoHash;
    memoEntity.create_at = memo.create_at;
    memoEntity.memoWriter = memo.memoWriter;

    return memoEntity;
  }
}
