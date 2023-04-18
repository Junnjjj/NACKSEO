import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { MemoEntity } from './memo.entity';

@Entity({ name: 'memo_writer' })
export class MemoWriterEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsString()
  @Column({ length: 64 })
  socket_id: string;

  @IsNotEmpty()
  @IsString()
  @Column({ length: 12 })
  start_geoHash: string;

  @IsString()
  @Column({ length: 12 })
  end_geoHash: string;

  @IsString()
  @Column({ length: 16 })
  create_user_ip: string;

  @IsDate()
  @IsNotEmpty()
  @CreateDateColumn()
  create_at: Date;

  @OneToMany(() => MemoEntity, (memoEntity) => memoEntity.memoWriter)
  memoEntities: MemoEntity[];
}
