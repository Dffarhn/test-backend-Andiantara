import dotenv from 'dotenv';
import app from './app';

dotenv.config();

const PORT: number = Number(process.env.PORT) || 3000;
const NODE_ENV: string = process.env.NODE_ENV ?? 'development';

app.listen(PORT, () => {
  const baseUrl = `http://localhost:${PORT}`;
  console.log('==============================');
  console.log(' Inventory Management API');
  console.log('==============================');
  console.log(`Environment : ${NODE_ENV}`);
  console.log(`Listening   : ${baseUrl}`);
  console.log('Healthcheck : GET /health');
  console.log('API Base    : GET /api');
  console.log('==============================');
});
