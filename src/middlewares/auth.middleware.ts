import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../config/jwt';
import { errorResponse } from '../utils/response';

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    errorResponse(res, 'Unauthorized', 401);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
    };
    next();
  } catch {
    errorResponse(res, 'Invalid or expired token', 401);
  }
}


