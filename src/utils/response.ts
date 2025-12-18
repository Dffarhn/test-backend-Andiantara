import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export const successResponse = <T>(
  res: Response,
  message: string,
  data: T | null,
  statusCode: number = 200,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  message: string,
  statusCode: number,
): Response<ApiResponse<null>> => {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
};


