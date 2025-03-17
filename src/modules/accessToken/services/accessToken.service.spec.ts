import '@jest/globals';
import AccessTokenService from './accessToken.service';
import AccessTokenRepository from '../repositories/accessToken.repository';
import AccessToken from '../models/accessToken.model';

jest.mock('../repositories/accessToken.repository');

const createMockAccessToken = (data: Partial<AccessToken>): AccessToken => {
  return {
    id: 'token123',
    ttl: 3600,
    userId: 1,
    createdAt: new Date(),
    expired: jest.fn(),
    ...data,
  } as AccessToken;
};

describe('AccessTokenService', () => {
  let accessTokenService: AccessTokenService;
  let mockAccessTokenRepository: jest.Mocked<AccessTokenRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAccessTokenRepository = {
      findToken: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenRepository>;

    (AccessTokenRepository as jest.Mock).mockImplementation(
      () => mockAccessTokenRepository
    );

    accessTokenService = new AccessTokenService();
  });

  describe('isExpired', () => {
    it('should return not valid and notFound true when token does not exist', async () => {
      mockAccessTokenRepository.findToken.mockResolvedValue(null);

      const result = await accessTokenService.isExpired('nonexistent-token');

      expect(mockAccessTokenRepository.findToken).toHaveBeenCalledWith(
        'nonexistent-token'
      );
      expect(result).toEqual({
        valid: false,
        notFound: true,
      });
    });

    it('should return not valid and delete token when token is expired', async () => {
      const mockToken = createMockAccessToken({});
      (mockToken.expired as jest.Mock).mockReturnValue(true);
      mockAccessTokenRepository.findToken.mockResolvedValue(mockToken);
      mockAccessTokenRepository.delete.mockResolvedValue(1);

      const result = await accessTokenService.isExpired('expired-token');

      expect(mockAccessTokenRepository.findToken).toHaveBeenCalledWith(
        'expired-token'
      );
      expect(mockToken.expired).toHaveBeenCalled();
      expect(mockAccessTokenRepository.delete).toHaveBeenCalledWith(
        'expired-token'
      );
      expect(result).toEqual({
        valid: false,
        notFound: false,
      });
    });

    it('should return valid when token exists and is not expired', async () => {
      const mockToken = createMockAccessToken({});
      (mockToken.expired as jest.Mock).mockReturnValue(false);
      mockAccessTokenRepository.findToken.mockResolvedValue(mockToken);

      const result = await accessTokenService.isExpired('valid-token');

      expect(mockAccessTokenRepository.findToken).toHaveBeenCalledWith(
        'valid-token'
      );
      expect(mockToken.expired).toHaveBeenCalled();
      expect(mockAccessTokenRepository.delete).not.toHaveBeenCalled();
      expect(result).toEqual({
        valid: true,
        notFound: false,
      });
    });
  });

  describe('validateToken', () => {
    it('should return false when token does not exist', async () => {
      mockAccessTokenRepository.findToken.mockResolvedValue(null);

      const result =
        await accessTokenService.validateToken('nonexistent-token');

      expect(mockAccessTokenRepository.findToken).toHaveBeenCalledWith(
        'nonexistent-token'
      );
      expect(result).toBe(false);
    });

    it('should return false and delete token when token is expired', async () => {
      const mockToken = createMockAccessToken({});
      (mockToken.expired as jest.Mock).mockReturnValue(true);
      mockAccessTokenRepository.findToken.mockResolvedValue(mockToken);
      mockAccessTokenRepository.delete.mockResolvedValue(1);

      const result = await accessTokenService.validateToken('expired-token');

      expect(mockAccessTokenRepository.findToken).toHaveBeenCalledWith(
        'expired-token'
      );
      expect(mockToken.expired).toHaveBeenCalled();
      expect(mockAccessTokenRepository.delete).toHaveBeenCalledWith(
        'expired-token'
      );
      expect(result).toBe(false);
    });

    it('should return true when token exists and is not expired', async () => {
      const mockToken = createMockAccessToken({});
      (mockToken.expired as jest.Mock).mockReturnValue(false);
      mockAccessTokenRepository.findToken.mockResolvedValue(mockToken);

      const result = await accessTokenService.validateToken('valid-token');

      expect(mockAccessTokenRepository.findToken).toHaveBeenCalledWith(
        'valid-token'
      );
      expect(mockToken.expired).toHaveBeenCalled();
      expect(mockAccessTokenRepository.delete).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
