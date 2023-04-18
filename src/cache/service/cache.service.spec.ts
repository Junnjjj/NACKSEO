import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// describe('CacheService', () => {
//   let cacheService: CacheService;
//   beforeEach(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [
//         ConfigModule.forRoot(),
//         RedisModule.forRootAsync({
//           imports: [ConfigModule],
//           useClass: RedisConfigService,
//           inject: [ConfigService],
//         }),
//       ],
//       providers: [CacheService],
//     }).compile();
//     cacheService = moduleRef.get<CacheService>(CacheService);
//   });
//   describe('set', () => {
//     it('should be defined', () => {
//       expect(cacheService.set).toBeDefined();
//     });
//     it('should return Ok', async () => {
//       const result = await cacheService.set('test', 'test', 100);
//       expect(result).toBe('OK');
//     });
//   });
//   describe('get', () => {
//     it('should be defined', () => {
//       expect(cacheService.get).toBeDefined();
//     });
//     it('should return test', async () => {
//       await cacheService.set('test', 'test', 100);
//       const result = await cacheService.get('test');
//       expect(result).toBe('test');
//     });
//   });
// });
