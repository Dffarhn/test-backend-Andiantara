import fs from 'fs';
import path from 'path';
import { dbPool } from './database';

const MIGRATIONS_DIR: string = path.resolve(__dirname, '..', '..', 'migrations');

const getMigrationFiles = (): string[] => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    return [];
  }

  const files: string[] = fs.readdirSync(MIGRATIONS_DIR);
  const sqlFiles: string[] = files
    .filter((file: string) => file.endsWith('.sql'))
    .sort();

  return sqlFiles;
};

export const runMigrations = async (): Promise<void> => {
  const migrationFiles: string[] = getMigrationFiles();

  if (migrationFiles.length === 0) {
    console.log('No migration files found. Skipping migrations.');
    return;
  }

  console.log('Running database migrations...');

  for (const fileName of migrationFiles) {
    const filePath: string = path.join(MIGRATIONS_DIR, fileName);
    const sql: string = fs.readFileSync(filePath, { encoding: 'utf-8' });

    console.log(`Applying migration: ${fileName}`);
    await dbPool.query(sql);
  }

  console.log('All migrations applied successfully.');
};


