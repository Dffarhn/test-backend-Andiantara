import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DB_HOST: string = process.env.DB_HOST ?? 'localhost';
const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
const DB_USER: string = process.env.DB_USER ?? 'postgres';
const DB_PASSWORD: string = process.env.DB_PASSWORD ?? '';
const DB_NAME: string = process.env.DB_NAME ?? 'inventory_db';

export const dbPool: Pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});


