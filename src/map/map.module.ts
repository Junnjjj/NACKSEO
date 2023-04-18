import { Module } from '@nestjs/common';
import { MapController } from './controller/map.controller';
import { MapService } from './service/map.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoEntity } from '../entity/memo.entity';
import { MemoRepository } from './memo.repository';
import { MemoGateway } from './gateway/memo.gateway';
import { MemoWriterRepository } from './memoWriter.repository';
import { MemoWriterEntity } from '../entity/memoWriter.entity';
import { MemoFactory } from './factory/memo.factory';
import { MemoWriterFactory } from './factory/memoWriter.factory';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    CacheModule,
    TypeOrmModule.forFeature([MemoEntity, MemoWriterEntity]),
  ],
  controllers: [MapController],
  providers: [
    MapService,
    MemoRepository,
    MemoGateway,
    MemoWriterRepository,
    MemoFactory,
    MemoWriterFactory,
  ],
})
export class MapModule {}
