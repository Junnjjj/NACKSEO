import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { MemoWriterEntity } from './memoWriter.entity';
import { JoinColumn } from 'typeorm/browser';

@Index('geoHash')
@Entity({
  name: 'memo_type3',
})
export class MemoEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsString()
  @IsNotEmpty()
  @Column({ length: 255 })
  content: string;

  @IsDate()
  @IsNotEmpty()
  @CreateDateColumn()
  create_at: Date;

  @IsNotEmpty()
  @Column({ type: 'double precision' })
  lat: number;

  @IsNotEmpty()
  @Column({ type: 'double precision' })
  lng: number;

  @IsNotEmpty()
  @Column()
  divX: number;

  @IsNotEmpty()
  @Column()
  divY: number;

  @IsNotEmpty()
  @IsString()
  @Column({ length: 12 })
  geoHash: string;

  @ManyToOne(() => MemoWriterEntity, (memo_writer) => memo_writer.memoEntities)
  memoWriter: MemoWriterEntity;
}
