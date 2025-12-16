import { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import { successResponse } from '../utils/response';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    const user = await registerUser({
      name: name ?? '',
      email: email ?? '',
      password: password ?? '',
    });

    successResponse(res, 'User registered successfully', user, 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    const result = await loginUser({
      email: email ?? '',
      password: password ?? '',
    });

    successResponse(res, 'Login successful', result, 200);
  } catch (error) {
    next(error);
  }
};


