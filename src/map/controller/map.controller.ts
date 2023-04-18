import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MapService } from '../service/map.service';
import { memoRequestDto } from '../dtos/memo.request.dto';
import { memoResponseDto } from '../dtos/memo.response.dto';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  async getGeoHash(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
  ): Promise<memoResponseDto[]> {
    return await this.mapService.getGeoHash(lat, lng);
  }

  @Post()
  async writeDoddle(@Body() body: memoRequestDto): Promise<memoResponseDto> {
    return await this.mapService.writeDoddle(body);
  }
}
