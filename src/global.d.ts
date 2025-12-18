import { JwtPayload } from './config/jwt';

declare global {
  namespace Express {
    interface UserPayload extends JwtPayload {}

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};


