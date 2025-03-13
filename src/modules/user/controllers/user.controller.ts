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

    // this.router.use(authMiddleware);

    this.router.get('/users/:id', this.fetchUser.bind(this));
  }

  private async createUser(req: Request, res: Response) {
    const body = req.body;
    console.log(body);
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

  private async fetchUser(req: Request, res: Response) {
    try {
    } catch (error) {
      throw new Error('Fetch user error: ' + error);
    }
  }
}

export default UserController;
