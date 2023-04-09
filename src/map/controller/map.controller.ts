import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MapService } from './map.service';
import { memoRequestDto } from './dtos/memo.request.dto';

@Controller('map')
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get()
  async getGeoHash(@Query('lat') lat: number, @Query('lng') lng: number) {
    return await this.mapService.getGeoHash(lat, lng);
  }

  @Post()
  async writeDoddle(@Body() body: memoRequestDto) {
    return await this.mapService.writeDoddle(body);
  }
}
