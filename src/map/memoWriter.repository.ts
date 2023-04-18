import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpException, Injectable } from '@nestjs/common';
import { MemoWriterEntity } from '../entity/memoWriter.entity';
import { MemoWriterFactory } from './factory/memoWriter.factory';

@Injectable()
export class MemoWriterRepository {
  constructor(
    @InjectRepository(MemoWriterEntity)
    private repository: Repository<MemoWriterEntity>,
    private memoWriterFactory: MemoWriterFactory,
  ) {}

  async getWriterBySocketId(id): Promise<MemoWriterEntity> {
    try {
      const result = await this.repository.findOne({
        where: { socket_id: id },
      });

      return result;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async endWriterUser(writer, geoHash) {
    try {
      await this.repository
        .createQueryBuilder('writer')
        .update()
        .set({
          end_geoHash: geoHash,
        })
        .where({ id: writer.id })
        .execute();
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }

  async createNewWriter(writer) {
    const memoWriterEntity =
      this.memoWriterFactory.createMemoWriterEntity(writer);

    try {
      const writer = await this.repository.save(memoWriterEntity);

      return writer;
    } catch (error) {
      throw new HttpException(error, 400);
    }
  }
}
