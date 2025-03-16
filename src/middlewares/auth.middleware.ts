import { Request, Response, NextFunction } from 'express';
import AccessTokenService from '../modules/accessToken/services/accessToken.service';
import UserService from '../modules/user/services/user.service';

const accessTokenService = new AccessTokenService();
const userService = new UserService();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    firstname: string;
    lastname: string;
    phone: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: No token provided' });

      return;
    }

    const token = authHeader.split(' ')[1];
    const validToken = await accessTokenService.validateToken(token);

    if (!validToken) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });

      return;
    }

    const user = await userService.getUserByToken(token);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User not found' });

      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error ' + error });
  }
};
