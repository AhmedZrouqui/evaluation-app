import '@jest/globals';
import { Request, Response } from 'express';
import KioskController from './kiosk.controller';
import KioskService from '../services/kiosk.service';
import { AuthenticatedRequest } from '../../../types/custom';
import Kiosk from '../models/kiosk.model';

jest.mock('../services/kiosk.service');

describe('KioskController', () => {
  let controller: KioskController;
  let mockKioskService: jest.Mocked<KioskService>;
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  const createMockKiosk = (data: any): Kiosk => {
    const kiosk = new Kiosk();
    Object.assign(kiosk, data);
    return kiosk;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockKioskService = {
      create: jest.fn(),
      getById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      search: jest.fn(),
    } as unknown as jest.Mocked<KioskService>;

    (KioskService as jest.Mock).mockImplementation(() => mockKioskService);

    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    controller = new KioskController();
  });

  describe('createKiosk', () => {
    const createKioskData = {
      title: 'Test Kiosk',
      description: 'Test Description',
      geolocation: { lat: 48.8566, lng: 2.3522 },
    };

    beforeEach(() => {
      mockRequest = {
        body: createKioskData,
        user: {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          phone: '1234567890',
        },
      };
    });

    it('should successfully create a kiosk', async () => {
      const mockKiosk = createMockKiosk({
        id: 1,
        ...createKioskData,
        userId: 1,
      });

      mockKioskService.create.mockResolvedValue(mockKiosk);

      await (controller as any).createKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockKioskService.create).toHaveBeenCalledWith({
        ...createKioskData,
        userId: 1,
      });
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockKiosk);
    });

    it('should handle validation errors', async () => {
      mockRequest.body = {};

      await (controller as any).createKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockKioskService.create.mockRejectedValue(error);

      await (controller as any).createKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: expect.stringContaining('Error creating kiosk'),
      });
    });
  });

  describe('getKiosk', () => {
    const kioskId = '1';

    beforeEach(() => {
      mockRequest = {
        params: { id: kioskId },
      };
    });

    it('should successfully get a kiosk', async () => {
      const mockKiosk = createMockKiosk({
        id: 1,
        title: 'Test Kiosk',
        description: 'Test Description',
        geolocation: { type: 'Point', coordinates: [2.3522, 48.8566] },
        userId: 1,
      });

      mockKioskService.getById.mockResolvedValue(mockKiosk);

      await (controller as any).getKiosk(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockKioskService.getById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockKiosk);
    });

    it('should handle non-existent kiosk', async () => {
      mockKioskService.getById.mockResolvedValue(null);

      await (controller as any).getKiosk(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Kiosk not found' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockKioskService.getById.mockRejectedValue(error);

      await (controller as any).getKiosk(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error fetching kiosk' });
    });
  });

  describe('updateKiosk', () => {
    const kioskId = '1';
    const updateData = {
      title: 'Updated Title',
      description: 'Updated Description',
    };

    beforeEach(() => {
      mockRequest = {
        params: { id: kioskId },
        body: updateData,
        user: {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          phone: '1234567890',
        },
      };
    });

    it('should successfully update a kiosk', async () => {
      const mockKiosk = createMockKiosk({
        id: 1,
        ...updateData,
        userId: 1,
        geolocation: { type: 'Point', coordinates: [2.3522, 48.8566] },
      });

      mockKioskService.update.mockResolvedValue(mockKiosk);

      await (controller as any).updateKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockKioskService.update).toHaveBeenCalledWith(1, 1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: 'Kiosk updated',
        kiosk: mockKiosk,
      });
    });

    it('should handle non-existent kiosk', async () => {
      mockKioskService.update.mockResolvedValue(null);

      await (controller as any).updateKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Kiosk not found' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockKioskService.update.mockRejectedValue(error);

      await (controller as any).updateKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error updating kiosk' });
    });
  });

  describe('deleteKiosk', () => {
    const kioskId = '1';

    beforeEach(() => {
      mockRequest = {
        params: { id: kioskId },
        user: {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          phone: '1234567890',
        },
      };
    });

    it('should successfully delete a kiosk', async () => {
      mockKioskService.delete.mockResolvedValue(true);

      await (controller as any).deleteKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockKioskService.delete).toHaveBeenCalledWith(1, 1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: 'Kiosk deleted' });
    });

    it('should handle non-existent kiosk', async () => {
      mockKioskService.delete.mockResolvedValue(false);

      await (controller as any).deleteKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Kiosk not found' });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockKioskService.delete.mockRejectedValue(error);

      await (controller as any).deleteKiosk(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error deleting kiosk' });
    });
  });

  describe('searchKiosks', () => {
    const searchParams = {
      geolocation: { lat: 48.8566, lng: 2.3522 },
      maxDistance: 5000,
      page: 1,
      offset: 0,
    };

    beforeEach(() => {
      mockRequest = {
        body: searchParams,
      };
    });

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

      mockKioskService.search.mockResolvedValue(mockKiosks);

      await (controller as any).searchKiosks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockKioskService.search).toHaveBeenCalledWith(
        searchParams.geolocation,
        searchParams.maxDistance,
        searchParams.page,
        searchParams.offset
      );
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockKiosks);
    });

    it('should handle empty search results', async () => {
      mockKioskService.search.mockResolvedValue([]);

      await (controller as any).searchKiosks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockKioskService.search.mockRejectedValue(error);

      await (controller as any).searchKiosks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Error searching kiosks',
      });
    });

    it('should handle invalid search parameters', async () => {
      mockRequest.body = {
        geolocation: { lat: 91, lng: 181 },
        maxDistance: -1,
      };

      await (controller as any).searchKiosks(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });
  });
});
