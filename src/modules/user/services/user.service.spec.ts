import '@jest/globals';
import UserService from './user.service';
import UserRepository from '../repositories/user.repository';
import AccessTokenRepository from '../../accessToken/repositories/accessToken.repository';
import bcrypt from 'bcrypt';
import User from '../models/user.model';
import AccessToken from '../../accessToken/models/accessToken.model';

jest.mock('../repositories/user.repository');
jest.mock('../../accessToken/repositories/accessToken.repository');
jest.mock('bcrypt');

const createMockUser = (data: Partial<User>): User => {
  return {
    id: 1,
    firstname: 'John',
    lastname: 'Doe',
    countryCode: '+1',
    phone: '1234567890',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...data,
  } as User;
};

const createMockAccessToken = (data: Partial<AccessToken>): AccessToken => {
  return {
    id: 'token123',
    ttl: 3600,
    userId: 1,
    createdAt: new Date(),
    expired: false,
    ...data,
  } as AccessToken;
};

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockAccessTokenRepository: jest.Mocked<AccessTokenRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      createUser: jest.fn(),
      findUserById: jest.fn(),
      findUserByCountryCodeAndPhone: jest.fn(),
      findUserByJWT: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    mockAccessTokenRepository = {
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<AccessTokenRepository>;

    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    (AccessTokenRepository as jest.Mock).mockImplementation(
      () => mockAccessTokenRepository
    );

    userService = new UserService();
  });

  describe('create', () => {
    const createUserData = {
      firstname: 'John',
      lastname: 'Doe',
      password: 'password123',
      countryCode: '+1',
      phone: '1234567890',
    };

    it('should successfully create a user', async () => {
      const mockUser = createMockUser({ ...createUserData });
      mockUserRepository.createUser.mockResolvedValue(mockUser);

      const result = await userService.create(createUserData);

      expect(mockUserRepository.createUser).toHaveBeenCalledWith(
        createUserData.firstname,
        createUserData.lastname,
        createUserData.countryCode,
        createUserData.phone,
        createUserData.password
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error when creation fails', async () => {
      const error = new Error('Database error');
      mockUserRepository.createUser.mockRejectedValue(error);

      await expect(userService.create(createUserData)).rejects.toThrow(
        'Error creating user'
      );
    });
  });

  describe('authenticate', () => {
    const authData = {
      countryCode: '+1',
      phone: '1234567890',
      password: 'password123',
    };

    it('should successfully authenticate user', async () => {
      const mockUser = createMockUser({});
      const mockToken = createMockAccessToken({});

      mockUserRepository.findUserByCountryCodeAndPhone.mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockAccessTokenRepository.create.mockResolvedValue(mockToken);

      const result = await userService.authenticate(authData);

      expect(
        mockUserRepository.findUserByCountryCodeAndPhone
      ).toHaveBeenCalledWith(authData.countryCode, authData.phone);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        authData.password,
        mockUser.password
      );
      expect(mockAccessTokenRepository.create).toHaveBeenCalledWith(
        3600,
        mockUser.id
      );
      expect(result).toEqual(mockToken);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findUserByCountryCodeAndPhone.mockResolvedValue(null);

      await expect(userService.authenticate(authData)).rejects.toThrow(
        'Auth error'
      );
    });

    it('should throw error when password does not match', async () => {
      const mockUser = createMockUser({});

      mockUserRepository.findUserByCountryCodeAndPhone.mockResolvedValue(
        mockUser
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.authenticate(authData)).rejects.toThrow(
        'Auth error'
      );
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = createMockUser({});
      mockUserRepository.findUserById.mockResolvedValue(mockUser);

      const result = await userService.getUserById(1);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findUserById.mockResolvedValue(null);

      const result = await userService.getUserById(999);

      expect(mockUserRepository.findUserById).toHaveBeenCalledWith(999);
      expect(result).toBeNull();
    });
  });

  describe('updateUser', () => {
    const updateData = {
      firstname: 'John Updated',
      lastname: 'Doe Updated',
    };

    it('should successfully update user', async () => {
      const mockUpdatedUser = createMockUser(updateData);
      mockUserRepository.updateUser.mockResolvedValue(mockUpdatedUser);

      const result = await userService.updateUser(1, updateData);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should return null when user not found', async () => {
      mockUserRepository.updateUser.mockResolvedValue(null);

      const result = await userService.updateUser(999, updateData);

      expect(mockUserRepository.updateUser).toHaveBeenCalledWith(
        999,
        updateData
      );
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete user', async () => {
      mockUserRepository.deleteUser.mockResolvedValue(true);

      const result = await userService.deleteUser(1);

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should return false when user not found', async () => {
      mockUserRepository.deleteUser.mockResolvedValue(false);

      const result = await userService.deleteUser(999);

      expect(mockUserRepository.deleteUser).toHaveBeenCalledWith(999);
      expect(result).toBe(false);
    });
  });

  describe('revokeToken', () => {
    it('should successfully revoke token', async () => {
      mockAccessTokenRepository.delete.mockResolvedValue(1);

      const result = await userService.revokeToken('token123');

      expect(mockAccessTokenRepository.delete).toHaveBeenCalledWith('token123');
      expect(result).toBe(1);
    });
  });

  describe('getUserByToken', () => {
    it('should return user when token is valid', async () => {
      const mockUser = createMockUser({});
      mockUserRepository.findUserByJWT.mockResolvedValue(mockUser);

      const result = await userService.getUserByToken('token123');

      expect(mockUserRepository.findUserByJWT).toHaveBeenCalledWith('token123');
      expect(result).toEqual(mockUser);
    });

    it('should throw error when token lookup fails', async () => {
      const error = new Error('Invalid token');
      mockUserRepository.findUserByJWT.mockRejectedValue(error);

      await expect(userService.getUserByToken('invalid-token')).rejects.toThrow(
        'Get user by Token error'
      );
    });
  });
});
