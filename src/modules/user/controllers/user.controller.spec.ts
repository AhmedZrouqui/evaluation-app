import '@jest/globals';
import { Request, Response } from 'express';
import UserController from './user.controller';
import UserService from '../services/user.service';
import { AuthenticatedRequest } from '../../../types/custom';
import { ValidationError, validationResult } from 'express-validator';
import User from '../models/user.model';
import AccessToken from '../../accessToken/models/accessToken.model';

jest.mock('express-validator', () => ({
  body: jest.fn().mockImplementation(() => ({
    trim: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    isString: jest.fn().mockReturnThis(),
    isLength: jest.fn().mockReturnThis(),
    isNumeric: jest.fn().mockReturnThis(),
  })),
  validationResult: jest.fn(),
}));

jest.mock('../services/user.service');
jest.mock('../validations/user.validation', () => ({
  validateCreateUser: jest.fn().mockReturnValue([]),
  validateAuthentication: jest.fn().mockReturnValue([]),
}));

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

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserService = {
      create: jest.fn(),
      authenticate: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      revokeToken: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    (UserService as jest.Mock).mockImplementation(() => mockUserService);

    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnThis();
    mockResponse = {
      json: mockJson,
      status: mockStatus,
    };

    controller = new UserController();

    (validationResult as unknown as jest.Mock).mockImplementation(() => ({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    }));
  });

  describe('createUser', () => {
    const createUserData = {
      firstname: 'John',
      lastname: 'Doe',
      countryCode: '+1',
      phone: '1234567890',
      password: 'password123',
    };

    beforeEach(() => {
      mockRequest = {
        body: createUserData,
      };
    });

    it('should successfully create a user', async () => {
      const mockUser = createMockUser(createUserData);
      mockUserService.create.mockResolvedValue(mockUser);

      await (controller as any).createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.create).toHaveBeenCalledWith(createUserData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: 'account created!' });
    });

    it('should handle validation errors', async () => {
      const mockErrors = {
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid input' }] as ValidationError[],
      };
      (validationResult as unknown as jest.Mock).mockReturnValue(mockErrors);

      await (controller as any).createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ errors: mockErrors.array() });
    });

    it('should handle service errors', async () => {
      const error = new Error('Database error');
      mockUserService.create.mockRejectedValue(error);

      await (controller as any).createUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Database error',
      });
    });
  });

  describe('login', () => {
    const loginData = {
      countryCode: '+1',
      phone: '1234567890',
      password: 'password123',
    };

    beforeEach(() => {
      mockRequest = {
        body: loginData,
      };
    });

    it('should successfully authenticate user', async () => {
      const mockToken = createMockAccessToken({});
      const mockAuthResponse = {
        token: mockToken,
        userId: 1,
      };
      mockUserService.authenticate.mockResolvedValue(mockAuthResponse);

      await (controller as any).login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.authenticate).toHaveBeenCalledWith(loginData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: 'Auth success',
        token: mockToken.id,
        userId: 1,
      });
    });

    it('should handle validation errors', async () => {
      const mockErrors = {
        isEmpty: () => false,
        array: () => [{ msg: 'Invalid credentials' }] as ValidationError[],
      };
      (validationResult as unknown as jest.Mock).mockReturnValue(mockErrors);

      await (controller as any).login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ errors: mockErrors.array() });
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Invalid credentials');
      mockUserService.authenticate.mockRejectedValue(error);

      await (controller as any).login(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Invalid credentials',
      });
    });
  });

  describe('fetchUser', () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: '1' },
        user: { id: 1 },
      } as unknown as AuthenticatedRequest;
    });

    it('should successfully fetch user', async () => {
      const mockUser = createMockUser({});
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await (controller as any).fetchUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockUserService.getUserById).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(mockUser);
    });

    it('should handle unauthorized access', async () => {
      mockRequest = {
        params: { id: '2' },
        user: { id: 1 },
      } as unknown as AuthenticatedRequest;

      await (controller as any).fetchUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'You can only access your own profile.',
      });
    });

    it('should handle user not found', async () => {
      mockUserService.getUserById.mockResolvedValue(null);

      await (controller as any).fetchUser(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('updateUser', () => {
    const updateData = {
      firstname: 'John Updated',
      lastname: 'Doe Updated',
    };

    beforeEach(() => {
      mockRequest = {
        params: { id: '1' },
        body: updateData,
      };
    });

    it('should successfully update user', async () => {
      const mockUpdatedUser = createMockUser(updateData);
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      await (controller as any).updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: 'User updated',
        user: mockUpdatedUser,
      });
    });

    it('should handle user not found', async () => {
      mockUserService.updateUser.mockResolvedValue(null);

      await (controller as any).updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockUserService.updateUser.mockRejectedValue(error);

      await (controller as any).updateUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error updating user' });
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      mockRequest = {
        params: { id: '1' },
      };
    });

    it('should successfully delete user', async () => {
      mockUserService.deleteUser.mockResolvedValue(true);

      await (controller as any).deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: 'User deleted' });
    });

    it('should handle user not found', async () => {
      mockUserService.deleteUser.mockResolvedValue(false);

      await (controller as any).deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: 'User not found' });
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockUserService.deleteUser.mockRejectedValue(error);

      await (controller as any).deleteUser(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error deleting user' });
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      mockRequest = {
        headers: {
          authorization: 'Bearer token123',
        },
      };
    });

    it('should successfully logout user', async () => {
      mockUserService.revokeToken.mockResolvedValue(1);

      await (controller as any).logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockUserService.revokeToken).toHaveBeenCalledWith('token123');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({ success: 'Logged out' });
    });

    it('should handle missing token', async () => {
      mockRequest = {
        headers: {},
      };

      await (controller as any).logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should handle logout errors', async () => {
      const error = new Error('Logout failed');
      mockUserService.revokeToken.mockRejectedValue(error);

      await (controller as any).logout(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Error logging out' });
    });
  });
});
