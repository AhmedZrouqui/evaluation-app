import { Router } from 'express';
import UserService from '../services/user.service';
import { CreateUserRequest } from '../types/types';
import { Request, Response } from 'express';
import {
  validateAuthentication,
  validateCreateUser,
} from '../validations/user.validation';
import { validationResult } from 'express-validator';
import AccessTokenService from '../../accessToken/services/accessToken.service';
import rateLimit from 'express-rate-limit';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { AuthenticatedRequest } from '../../../types/custom';

class UserController {
  public router: Router;
  private readonly userService: UserService;
  private readonly accessTokenService: AccessTokenService;

  constructor() {
    this.router = Router();
    this.userService = new UserService();
    this.accessTokenService = new AccessTokenService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    const loginLimiter = rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 5,
      message: { error: 'Too many login attempts, please try again later.' },
    });

    this.router.post(
      '/users',
      validateCreateUser(),
      this.createUser.bind(this)
    );

    this.router.post(
      '/users/login',
      loginLimiter,
      validateAuthentication(),
      this.login.bind(this)
    );

    this.router.use(authMiddleware);

    this.router.get('/users/:id', (req, res) =>
      this.fetchUser(req as unknown as AuthenticatedRequest, res)
    );
    this.router.delete('/users/:id', this.deleteUser.bind(this));
    this.router.put('/users/:id', this.updateUser.bind(this));
    this.router.post('/users/logout', this.logout.bind(this));
  }

  private async createUser(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { firstname, lastname, countryCode, phone, password } = req.body;

      await this.userService.create({
        firstname,
        lastname,
        countryCode,
        phone,
        password,
      });

      res.status(200).json({ success: 'account created!' });
      return;
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Error occurred while creating user',
      });
    }
  }

  private async login(req: Request, res: Response) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { countryCode, phone, password } = req.body;

      const token = await this.userService.authenticate({
        countryCode,
        phone,
        password,
      });

      res.status(200).json({
        message: 'Auth success',
        token: token.id,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : 'Error occurred while trying to login',
      });
    }
  }

  private async fetchUser(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (userId !== Number(id)) {
        res
          .status(403)
          .json({ error: 'You can only access your own profile.' });

        return;
      }

      const user = await this.userService.getUserById(Number(id));

      if (!user) {
        res.status(404).json({ error: 'User not found' });

        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user' + error });
    }
  }

  private async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.updateUser(
        Number(id),
        req.body
      );

      if (!updatedUser) {
        res.status(404).json({ error: 'User not found' });

        return;
      }

      res.status(200).json({ success: 'User updated', user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: 'Error updating user' });
    }
  }

  private async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await this.userService.deleteUser(Number(id));

      if (!deleted) {
        res.status(404).json({ error: 'User not found' });

        return;
      }

      res.status(200).json({ success: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting user' });
    }
  }

  private async logout(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        res.status(400).json({ error: 'No token provided' });

        return;
      }

      await this.userService.revokeToken(token);
      res.status(200).json({ success: 'Logged out' });
    } catch (error) {
      res.status(500).json({ error: 'Error logging out' });
    }
  }
}

export default UserController;
