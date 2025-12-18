import { AppError } from '../middlewares/app-error';
import {
  createUser,
  CreateUserInput,
  findUserByEmail,
  User,
} from '../models/user.model';
import { comparePassword, hashPassword } from '../utils/hash';
import { signToken } from '../config/jwt';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

const validateEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

export const registerUser = async (
  input: RegisterInput,
): Promise<AuthUser> => {
  const { name, email, password } = input;

  if (!name || !email || !password) {
    throw new AppError('Name, email, and password are required', 400);
  }

  if (!validateEmail(email)) {
    throw new AppError('Invalid email format', 400);
  }

  const existingUser: User | null = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  const hashedPassword = await hashPassword(password);

  const toCreate: CreateUserInput = {
    name,
    email,
    password: hashedPassword,
  };

  const createdUser = await createUser(toCreate);

  const safeUser: AuthUser = {
    id: createdUser.id,
    name: createdUser.name,
    email: createdUser.email,
  };

  return safeUser;
};

export const loginUser = async (input: LoginInput): Promise<LoginResult> => {
  const { email, password } = input;

  if (!email || !password) {
    throw new AppError('Email and password are required', 400);
  }

  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = signToken({ id: user.id, email: user.email });

  const authUser: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  return {
    token,
    user: authUser,
  };
};


