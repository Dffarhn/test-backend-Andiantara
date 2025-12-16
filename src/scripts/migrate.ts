import dotenv from 'dotenv';
import { runMigrations } from '../config/migrate';

dotenv.config();

const executeMigrations = async (): Promise<void> => {
  try {
    await runMigrations();
    console.log('Database migrations completed. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to run migrations:', error);
    process.exit(1);
  }
};

void executeMigrations();


