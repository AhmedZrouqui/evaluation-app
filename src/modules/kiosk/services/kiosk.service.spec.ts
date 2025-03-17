import '@jest/globals';
import KioskService from './kiosk.service';
import KioskRepository from '../repositories/kiosk.repository';
import Kiosk from '../models/kiosk.model';

jest.mock('../repositories/kiosk.repository');

describe('KioskService', () => {
  let kioskService: KioskService;
  let mockKioskRepository: jest.Mocked<KioskRepository>;

  const createMockKiosk = (data: any): Kiosk => {
    const kiosk = new Kiosk();
    Object.assign(kiosk, data);
    return kiosk;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockKioskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<KioskRepository>;

    (KioskRepository as jest.Mock).mockImplementation(
      () => mockKioskRepository
    );

    kioskService = new KioskService();
  });

  describe('create', () => {
    const createKioskData = {
      title: 'Test Kiosk',
      description: 'Test Description',
      geolocation: { lat: 48.8566, lng: 2.3522 },
      userId: 1,
    };

    it('should successfully create a kiosk', async () => {
      const mockKiosk = createMockKiosk({ id: 1, ...createKioskData });
      mockKioskRepository.create.mockResolvedValue(mockKiosk);

      const result = await kioskService.create(createKioskData);

      expect(result).toEqual(mockKiosk);
      expect(mockKioskRepository.create).toHaveBeenCalledWith(
        createKioskData.title,
        createKioskData.description,
        createKioskData.geolocation,
        createKioskData.userId
      );
    });

    it('should throw an error if repository create fails', async () => {
      const error = new Error('Database error');
      mockKioskRepository.create.mockRejectedValue(error);

      await expect(kioskService.create(createKioskData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getById', () => {
    const kioskId = 1;

    it('should successfully retrieve a kiosk by id', async () => {
      const mockKiosk = createMockKiosk({
        id: kioskId,
        title: 'Test Kiosk',
        description: 'Test Description',
        geolocation: { type: 'Point', coordinates: [2.3522, 48.8566] },
        userId: 1,
      });
      mockKioskRepository.findById.mockResolvedValue(mockKiosk);

      const result = await kioskService.getById(kioskId);

      expect(result).toEqual(mockKiosk);
      expect(mockKioskRepository.findById).toHaveBeenCalledWith(kioskId);
    });

    it('should return null if kiosk not found', async () => {
      mockKioskRepository.findById.mockResolvedValue(null);

      const result = await kioskService.getById(kioskId);

      expect(result).toBeNull();
      expect(mockKioskRepository.findById).toHaveBeenCalledWith(kioskId);
    });

    it('should throw an error if repository findById fails', async () => {
      const error = new Error('Database error');
      mockKioskRepository.findById.mockRejectedValue(error);

      await expect(kioskService.getById(kioskId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('update', () => {
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };
    const kioskId = 1;
    const userId = 1;

    it('should successfully update a kiosk', async () => {
      const mockKiosk = createMockKiosk({
        id: kioskId,
        ...updateData,
        userId,
        geolocation: { type: 'Point', coordinates: [2.3522, 48.8566] },
      });
      mockKioskRepository.update.mockResolvedValue(mockKiosk);

      const result = await kioskService.update(kioskId, userId, updateData);

      expect(result).toEqual(mockKiosk);
      expect(mockKioskRepository.update).toHaveBeenCalledWith(
        kioskId,
        userId,
        updateData
      );
    });

    it('should return null if kiosk not found', async () => {
      mockKioskRepository.update.mockResolvedValue(null);

      const result = await kioskService.update(kioskId, userId, updateData);

      expect(result).toBeNull();
      expect(mockKioskRepository.update).toHaveBeenCalledWith(
        kioskId,
        userId,
        updateData
      );
    });

    it('should throw an error if repository update fails', async () => {
      const error = new Error('Database error');
      mockKioskRepository.update.mockRejectedValue(error);

      await expect(
        kioskService.update(kioskId, userId, updateData)
      ).rejects.toThrow('Database error');
    });
  });

  describe('delete', () => {
    const kioskId = 1;
    const userId = 1;

    it('should successfully delete a kiosk', async () => {
      mockKioskRepository.delete.mockResolvedValue(true);

      const result = await kioskService.delete(kioskId, userId);

      expect(result).toBe(true);
      expect(mockKioskRepository.delete).toHaveBeenCalledWith(kioskId, userId);
    });

    it('should return false if kiosk not found', async () => {
      mockKioskRepository.delete.mockResolvedValue(false);

      const result = await kioskService.delete(kioskId, userId);

      expect(result).toBe(false);
      expect(mockKioskRepository.delete).toHaveBeenCalledWith(kioskId, userId);
    });

    it('should throw an error if repository delete fails', async () => {
      const error = new Error('Database error');
      mockKioskRepository.delete.mockRejectedValue(error);

      await expect(kioskService.delete(kioskId, userId)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('search', () => {
    const searchParams = {
      geolocation: { lat: 48.8566, lng: 2.3522 },
      maxDistance: 5,
      page: 1,
      offset: 0,
    };

    it('should successfully search for kiosks', async () => {
      const mockKiosks = [
        createMockKiosk({
          id: 1,
          title: 'Nearby Kiosk 1',
          description: 'Description 1',
          geolocation: { type: 'Point', coordinates: [2.3522, 48.8566] },
          userId: 1,
          distance_km: 1.5,
          user: { firstname: 'John', lastname: 'Doe' },
        }),
        createMockKiosk({
          id: 2,
          title: 'Nearby Kiosk 2',
          description: 'Description 2',
          geolocation: { type: 'Point', coordinates: [2.3522, 48.8566] },
          userId: 2,
          distance_km: 3.2,
          user: { firstname: 'Jane', lastname: 'Doe' },
        }),
      ];
      mockKioskRepository.search.mockResolvedValue(mockKiosks);

      const result = await kioskService.search(
        searchParams.geolocation,
        searchParams.maxDistance,
        searchParams.page,
        searchParams.offset
      );

      expect(result).toEqual(mockKiosks);
      expect(mockKioskRepository.search).toHaveBeenCalledWith(
        searchParams.geolocation,
        searchParams.maxDistance,
        searchParams.page,
        searchParams.offset
      );
    });

    it('should return empty array if no kiosks found', async () => {
      mockKioskRepository.search.mockResolvedValue([]);

      const result = await kioskService.search(
        searchParams.geolocation,
        searchParams.maxDistance,
        searchParams.page,
        searchParams.offset
      );

      expect(result).toEqual([]);
      expect(mockKioskRepository.search).toHaveBeenCalledWith(
        searchParams.geolocation,
        searchParams.maxDistance,
        searchParams.page,
        searchParams.offset
      );
    });

    it('should throw an error if repository search fails', async () => {
      const error = new Error('Database error');
      mockKioskRepository.search.mockRejectedValue(error);

      await expect(
        kioskService.search(
          searchParams.geolocation,
          searchParams.maxDistance,
          searchParams.page,
          searchParams.offset
        )
      ).rejects.toThrow('Database error');
    });

    it('should handle invalid coordinates', async () => {
      const invalidSearchParams = {
        ...searchParams,
        geolocation: { lat: 91, lng: 181 },
      };

      mockKioskRepository.search.mockRejectedValue(
        new Error('Invalid coordinates')
      );

      await expect(
        kioskService.search(
          invalidSearchParams.geolocation,
          invalidSearchParams.maxDistance,
          invalidSearchParams.page,
          invalidSearchParams.offset
        )
      ).rejects.toThrow('Invalid coordinates');
    });
  });
});
