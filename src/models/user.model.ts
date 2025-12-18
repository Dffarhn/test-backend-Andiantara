import { dbPool } from '../config/database';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export const createUser = async (input: CreateUserInput): Promise<User> => {
  const { name, email, password } = input;

  const query = `
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, password, created_at
  `;

  const result = await dbPool.query(query, [name, email, password]);

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
  };
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = `
    SELECT id, name, email, password, created_at
    FROM users
    WHERE email = $1
  `;

  const result = await dbPool.query(query, [email]);

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
  };
};

export const findUserById = async (id: string): Promise<User | null> => {
  const query = `
    SELECT id, name, email, password, created_at
    FROM users
    WHERE id = $1
  `;

  const result = await dbPool.query(query, [id]);

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
  };
};


