import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from './map.service';
// import { MemoEntity } from '../entity/memo.entity';
import { MemoRepository } from './memo.repository';
import { MemoEntity } from '../entity/memo.entity';

const mockLat = 35.668024;
const mockLng = 127.389192;

const mockMemo = {
  id: 2,
  content: 'Justin Mullins',
  create_at: '2022-08-17T15:00:00.000Z',
  create_user_ip: '172.28.203.148',
  lat: '35.66802400',
  lng: '127.38919200',
  geohash: 'wy6dfv1vr3d4',
};

jest.mock('./memo.repository');

class MockMemoRepository {
  // save = jest.fn().mockResolvedValue(mockMemo);
  async getMemoByGeoHash(geoHash: string) {
    return [mockMemo];
  }
}

describe('MapService', () => {
  let mapService: MapService;
  let memoRepository: MockMemoRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: MemoRepository,
          useClass: MockMemoRepository,
        },
      ],
    }).compile();

    mapService = module.get<MapService>(MapService);
    memoRepository = module.get(MemoRepository);
  });

  it('should be defined', () => {
    expect(mapService).toBeDefined();
  });

  it('should be defined', () => {
    expect(memoRepository).toBeDefined();
  });

  describe('get GeoHash by lat,lng', () => {
    it('should be defined', () => {
      expect(mapService.getGeoHash).toBeDefined();
    });

    it('lat, lng 를 이용해 주변 memo list를 찾는다.', async () => {
      await expect(
        mapService.getGeoHash(mockLat, mockLng, 12),
      ).resolves.toEqual([mockMemo]);
    });
  });
});
