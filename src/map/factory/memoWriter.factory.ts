import { Injectable } from '@nestjs/common';
import { MemoWriterEntity } from '../../entity/memoWriter.entity';

@Injectable()
export class MemoWriterFactory {
  createMemoWriterEntity(memoWriter) {
    const memoWriterEntity = new MemoWriterEntity();

    memoWriterEntity.socket_id = memoWriter.socket_id;
    memoWriterEntity.create_user_ip = '192.168.0.1';
    memoWriterEntity.start_geoHash = memoWriter.geoHash;
    memoWriterEntity.create_at = memoWriter.create_at;

    return memoWriterEntity;
  }
}
