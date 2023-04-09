import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

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
  @Column({ type: 'timestamp' })
  create_at: Date;

  @IsString()
  @Column({ length: 16 })
  create_user_ip: string;

  @IsNotEmpty()
  @Column()
  lat: number;

  @IsNotEmpty()
  @Column()
  lng: number;

  @IsNotEmpty()
  @IsString()
  @Column({ length: 12 })
  geohash: string;
}
