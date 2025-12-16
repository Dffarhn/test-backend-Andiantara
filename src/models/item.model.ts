import { dbPool } from '../config/database';

export interface Item {
  id: string;
  name: string;
  description: string | null;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  stock?: number;
  createdBy: string;
}

export interface UpdateItemDetailsInput {
  name?: string;
  description?: string;
}

export const createItem = async (input: CreateItemInput): Promise<Item> => {
  const name = input.name;
  const description = input.description ?? null;
  const initialStock = input.stock ?? 0;
  const createdBy = input.createdBy;

  const query = `
    INSERT INTO items (name, description, stock, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, description, stock, created_at, updated_at, created_by
  `;

  const result = await dbPool.query(query, [
    name,
    description,
    initialStock,
    createdBy,
  ]);
  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
};

export const getItems = async (): Promise<Item[]> => {
  const query = `
    SELECT id, name, description, stock, created_at, updated_at, created_by
    FROM items
    ORDER BY created_at DESC
  `;

  const result = await dbPool.query(query);

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  }));
};

export const getItemById = async (id: string): Promise<Item | null> => {
  const query = `
    SELECT id, name, description, stock, created_at, updated_at, created_by
    FROM items
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
    description: row.description,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
};

export const updateItemStock = async (
  id: string,
  newStock: number,
): Promise<Item | null> => {
  const query = `
    UPDATE items
    SET stock = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, name, description, stock, created_at, updated_at, created_by
  `;

  const result = await dbPool.query(query, [newStock, id]);

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  };
};

export const updateItemDetails = async (
  id: string,
  input: UpdateItemDetailsInput,
): Promise<Item | null> => {
  const name: string | null =
    input.name !== undefined ? input.name : null;
  const description: string | null =
    input.description !== undefined ? input.description : null;

  const query = `
    UPDATE items
    SET
      name = COALESCE($1, name),
      description = COALESCE($2, description),
      updated_at = NOW()
    WHERE id = $3
    RETURNING id, name, description, stock, created_at, updated_at
  `;

  const result = await dbPool.query(query, [name, description, id]);

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const deleteItem = async (id: string): Promise<void> => {
  const query = `
    DELETE FROM items
    WHERE id = $1
  `;

  await dbPool.query(query, [id]);
};



