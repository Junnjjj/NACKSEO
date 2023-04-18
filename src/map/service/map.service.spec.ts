import { Test, TestingModule } from '@nestjs/testing';
import { MapService } from './map.service';
import { MemoRepository } from '../memo.repository';
import { MemoWriterRepository } from '../memoWriter.repository';
import { encode } from 'ngeohash';
import { CacheService } from '../../cache/service/cache.service';
import { memoResponseDto } from '../dtos/memo.response.dto';

const mockCacheService = {
  get: jest.fn(),
  set: jest.fn(),
};

const mockMemoRepository = {
  getMemoByGeoHash: jest.fn(),
  createMemo: jest.fn(),
};

const mockMemoWriterRepository = {
  getWriterBySocketId: jest.fn(),
  endWriterUser: jest.fn(),
  createNewWriter: jest.fn(),
};

const now = new Date('2023-04-08T12:43:27.862Z');

describe('MapService', () => {
  let mapService: MapService;
  let memoRepository: MemoRepository;
  let memoWriterRepository: MemoWriterRepository;
  let cacheService: CacheService;

  beforeEach(async () => {
    // 특정 시간 반환
    jest.spyOn(Date, 'now').mockImplementation(() => now.getTime());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MapService,
        {
          provide: MemoRepository,
          useValue: mockMemoRepository,
        },
        {
          provide: MemoWriterRepository,
          useValue: mockMemoWriterRepository,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    mapService = module.get<MapService>(MapService);
    memoRepository = module.get(MemoRepository);
    memoWriterRepository = module.get(MemoWriterRepository);
    cacheService = module.get(CacheService);
  });

  it('should be defined', () => {
    expect(mapService).toBeDefined();
    expect(memoRepository).toBeDefined();
    expect(memoWriterRepository).toBeDefined();
    expect(cacheService).toBeDefined();
  });

  describe('getMemoListByGeoHash', () => {
    it('should return cached memo list', async () => {
      const cachedData = '[{ "id": 1, "content": "memo 1" }]';
      const geoHash = '12345';

      mockCacheService.get.mockResolvedValueOnce(cachedData);

      const result = await mapService.getMemoListByGeoHash(geoHash);

      expect(mockCacheService.get).toBeCalledWith(geoHash);
      expect(mockMemoRepository.getMemoByGeoHash).not.toBeCalled();
      expect(mockCacheService.set).not.toBeCalled();
      expect(result).toEqual(JSON.parse(cachedData));
    });

    it('should return memo list from repository and set cache', async () => {
      const geoHash = '12345';
      const memoList = [
        { id: 1, content: 'memo 1' },
        { id: 2, content: 'memo 2' },
      ];

      mockCacheService.get.mockResolvedValueOnce(undefined);
      mockMemoRepository.getMemoByGeoHash.mockResolvedValueOnce(memoList);
      mockCacheService.set.mockResolvedValueOnce('OK');

      const result = await mapService.getMemoListByGeoHash(geoHash);

      expect(mockCacheService.get).toBeCalledWith(geoHash);
      expect(mockMemoRepository.getMemoByGeoHash).toBeCalledWith(geoHash);
      expect(mockCacheService.set).toBeCalledWith(
        geoHash,
        JSON.stringify(memoList),
      );
      expect(result).toEqual(memoList);
    });
  });

  describe('get MemoList from getGeoHash', () => {
    const mockMemoRequest = {
      content: 'hello world',
      lat: 37.251361,
      lng: 127.0783539,
      sid: 'abc123',
      divX: 123,
      divY: 312,
    };
    it('should be defined', () => {
      expect(mapService.getGeoHash).toBeDefined();
    });

    it('should call cacheService.get', async () => {
      const mockMemoList: memoResponseDto[] = [];
      const mockCacheData = JSON.stringify(mockMemoList);

      // cacheService.get() 메서드 모킹
      mockCacheService.get.mockReturnValueOnce(mockCacheData);

      // cacheService.get() 메서드가 호출되었는지 확인
      expect(mockCacheService.get).toBeCalledWith(expect.any(String));
    });

    it('cacheService set 확인: 캐쉬가 있을 때', async () => {
      mockCacheService.set = jest.fn().mockImplementation((key, value) => {
        return Promise.resolve(true);
      });

      // type 1 : Cache 가 있을 경우
      const cachedData = '[{ "id": 1, "content": "memo 1" }]';

      mockCacheService.get.mockResolvedValueOnce(cachedData);
      mockMemoRepository.getMemoByGeoHash.mockResolvedValue(
        JSON.stringify(cachedData),
      );

      await mapService.writeDoddle(mockMemoRequest);

      // cacheService.set() 메서드가 호출되었는지 확인
      expect(mockCacheService.set).toBeCalledWith(
        expect.any(String),
        expect.any(String),
      );
    });

    it('cacheService set 확인: 캐쉬가 없을 때', async () => {
      // type 2 : Cache 가 없을 경우
      mockCacheService.get.mockResolvedValue(null);
      mockMemoRepository.getMemoByGeoHash.mockResolvedValue([]);
      await mapService.writeDoddle(mockMemoRequest);

      expect(mockCacheService.set).toBeCalledWith(
        expect.any(String),
        expect.any(String),
      );
    });

    describe('getGeoHash 수행', () => {
      it('getGeoHash 반환 값 타입 확인', async () => {
        const mockLat = 37.123456;
        const mockLng = 127.123456;
        mockCacheService.get.mockResolvedValue(null);
        mockMemoRepository.getMemoByGeoHash.mockResolvedValue([]);
        const result = await mapService.getGeoHash(mockLat, mockLng);

        // 반환값 확인
        expect(result).toEqual(expect.any(Array));
      });

      it('getGeoHash 를 수행 : type 1 cache 있을 때', async () => {
        const mockMemo = {
          content: 'Justin Mullins',
          divX: 12,
          divY: 24,
          lat: 37.251361,
          lng: 127.0783539,
          geoHash: 'wyd7gtr7',
        };
        const mockLat = 37.251361;
        const mockLng = 127.0783539;
        const mockMemoList: memoResponseDto[] = [mockMemo];
        const mockCacheData = JSON.stringify([mockMemoList]);

        // cacheService.get() 메서드 모킹
        mockCacheService.get.mockReturnValueOnce(mockCacheData);

        const result = await mapService.getGeoHash(mockLat, mockLng);
        expect(result).toEqual(JSON.parse(mockCacheData));
      });
    });

    it('getGeoHash 를 수행 : type 2 cache 없을 때', async () => {
      const mockMemo = {
        content: 'Justin Mullins',
        divX: 12,
        divY: 24,
        lat: 37.251361,
        lng: 127.0783539,
        geoHash: 'wyd7gtr7',
      };
      const mockLat = 37.251361;
      const mockLng = 127.0783539;
      const mockLat2 = 36.0;
      const mockLng2 = 126.0;
      const mockMemoList: memoResponseDto[] = [mockMemo];

      // cacheService.get() 메서드 모킹
      mockCacheService.get.mockReturnValueOnce(null);

      // getMemoByGeoHash 메서드 정의
      mockMemoRepository.getMemoByGeoHash.mockImplementation((geoHash) => {
        if (geoHash === encode(mockLat, mockLng, 7)) {
          return [mockMemo];
        } else {
          return [];
        }
      });

      // memo 가 있는 구역일 때
      const sameGeoHashResult = await mapService.getGeoHash(mockLat, mockLng);
      expect(mockMemoRepository.getMemoByGeoHash).toHaveBeenCalledWith(
        encode(mockLat, mockLng, 7),
      );
      expect(sameGeoHashResult).toEqual(mockMemoList);

      // memo 가 없는 구역일 때
      const otherGeoHashResult = await mapService.getGeoHash(
        mockLat2,
        mockLng2,
      );
      expect(mockMemoRepository.getMemoByGeoHash).toHaveBeenCalledWith(
        encode(mockLat2, mockLng2, 7),
      );
      expect(otherGeoHashResult).toEqual([]);
    });
  });

  describe('writeDoodle 수행', () => {
    const mockWriter = {
      id: 1,
      socket_id: 'ceXi3-rLGltY3RZ6AAAJ',
      create_user_ip: '192.168.0.1',
      start_geoHash: 'abcd',
      create_at: new Date(Date.now()),
    };

    it('should be defined', () => {
      expect(mapService.writeDoddle).toBeDefined();
    });

    it('writeDoddle 을 수행. : type 1 캐시가 있을 때', async () => {
      const mockMemoBody = {
        content: 'Hello world',
        lat: 37.251361,
        lng: 127.0783539,
        divX: 10,
        divY: 30,
        sid: 'ceXi3-rLGltY3RZ6AAAJ',
        geoHash: encode(37.251361, 127.0783539, 8),
        memoWriter: mockWriter,
        create_at: new Date(Date.now()),
      };

      const mockMemo = {
        content: 'Justin Mullins',
        divX: 12,
        divY: 24,
        lat: 34.253212,
        lng: 117.0312412,
        geoHash: 'wyd7gtr7',
      };
      const mockMemoList: memoResponseDto[] = [mockMemo];
      const mockCacheData = JSON.stringify([mockMemoList]);

      const mockResponse: memoResponseDto = {
        content: mockMemoBody.content,
        lat: mockMemoBody.lat,
        lng: mockMemoBody.lng,
        divX: mockMemoBody.divX,
        divY: mockMemoBody.divY,
      };

      // memoWriterRepository.getWriterBySocketId() 메서드 모킹
      mockMemoWriterRepository.getWriterBySocketId.mockResolvedValue(
        mockWriter,
      );

      // cacheService.get() 메서드 모킹
      mockCacheService.get.mockReturnValueOnce(mockCacheData);

      // memoRepository.createMemo 메서드 모킹
      mockMemoRepository.createMemo.mockResolvedValue(mockResponse);

      const result = await mapService.writeDoddle(mockMemoBody);
      expect(mockMemoWriterRepository.getWriterBySocketId).toHaveBeenCalledWith(
        mockMemoBody.sid,
      );
      expect(mockMemoRepository.createMemo).toHaveBeenCalledWith(mockMemoBody);
      expect(result).toEqual(mockResponse);
    });

    it('writeDoddle 을 수행. : type 2 캐시가 없을 때', async () => {
      const mockMemoBody = {
        content: 'Hello world',
        lat: 37.251361,
        lng: 127.0783539,
        divX: 10,
        divY: 30,
        sid: 'ceXi3-rLGltY3RZ6AAAJ',
        geoHash: encode(37.251361, 127.0783539, 8),
        memoWriter: mockWriter,
        create_at: new Date(Date.now()),
      };

      // DB 에 저장된 메모 값
      const mockMemo = {
        content: 'Justin Mullins',
        divX: 12,
        divY: 24,
        lat: 34.253212,
        lng: 117.0312412,
        geoHash: 'wyd7gtr7',
      };

      const mockResponse: memoResponseDto = {
        content: mockMemoBody.content,
        lat: mockMemoBody.lat,
        lng: mockMemoBody.lng,
        divX: mockMemoBody.divX,
        divY: mockMemoBody.divY,
      };

      // memoWriterRepository.getWriterBySocketId() 메서드 모킹
      mockMemoWriterRepository.getWriterBySocketId.mockResolvedValue(
        mockWriter,
      );

      // memoRepository.createMemo 메서드 모킹
      mockMemoRepository.createMemo.mockResolvedValue(mockResponse);

      // cacheService.get() 메서드 모킹
      mockCacheService.get.mockReturnValueOnce(null);

      // getMemoByGeoHash 메서드 정의
      mockMemoRepository.getMemoByGeoHash.mockImplementation((geoHash) => {
        if (geoHash === encode(mockMemoBody.lat, mockMemoBody.lng, 7)) {
          return [mockMemo];
        } else {
          return [];
        }
      });

      const result = await mapService.writeDoddle(mockMemoBody);
      expect(mockMemoWriterRepository.getWriterBySocketId).toHaveBeenCalledWith(
        mockMemoBody.sid,
      );
      expect(mockMemoRepository.createMemo).toHaveBeenCalledWith(mockMemoBody);
      expect(result).toEqual(mockResponse);

      // CacheService.set 에 제대로 된 인수 호출하는지
      const roomGeoHash = encode(mockMemoBody.lat, mockMemoBody.lng, 7);
      const memoList = await mapService.getMemoListByGeoHash(roomGeoHash);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        encode(mockMemoBody.lat, mockMemoBody.lng, 7),
        JSON.stringify([...memoList, mockResponse]),
      );
    });
  });

  afterAll(() => {
    jest.spyOn(Date, 'now').mockRestore();
  });
});
