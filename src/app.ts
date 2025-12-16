import express, { Application } from 'express';
import dotenv from 'dotenv';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

dotenv.config();

const app: Application = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'OK',
    data: null,
  });
});

app.use('/api', routes);

app.use(errorMiddleware);

export default app;


