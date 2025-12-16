import { NextFunction, Request, Response } from 'express';
import { AppError } from './app-error';
import { errorResponse } from '../utils/response';

export const errorMiddleware = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    errorResponse(res, err.message, err.statusCode);
    return;
  }

  console.error('Unexpected error:', err);
  errorResponse(res, 'Internal server error', 500);
};


