import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class memoResponseDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  lat: number;

  @IsNotEmpty()
  @IsNumber()
  lng: number;

  @IsNotEmpty()
  @IsNumber()
  divX: number;

  @IsNotEmpty()
  @IsNumber()
  divY: number;
}
