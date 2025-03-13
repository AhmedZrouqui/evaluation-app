import { Request, Response, NextFunction } from 'express';
import AccessTokenService from '../modules/accessToken/services/accessToken.service';

const accessTokenService = new AccessTokenService();

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
    const isValid = await accessTokenService.validateToken(token);

    if (!isValid) {
      return res
        .status(401)
        .json({ error: 'Unauthorized: Invalid or expired token' });
    }

    next(); // Token is valid, continue
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
