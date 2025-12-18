import { dbPool } from '../config/database';

export interface ItemUser {
  id: string;
  name: string;
  email: string;
}

export interface Item {
  id: string;
  name: string;
  description: string | null;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ItemUser;
}

export interface CreateItemInput {
  name: string;
  description?: string;
  stock?: number;
  createdBy: string; // user id
}

export interface UpdateItemDetailsInput {
  name?: string;
  description?: string;
}

interface ItemRow {
  id: string;
  name: string;
  description: string | null;
  stock: number;
  created_at: Date;
  updated_at: Date;
  created_by: string;
  created_by_name: string;
  created_by_email: string;
}

const mapItemRow = (row: ItemRow): Item => {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    stock: row.stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: {
      id: row.created_by,
      name: row.created_by_name,
      email: row.created_by_email,
    },
  };
};

export const createItem = async (input: CreateItemInput): Promise<Item> => {
  const name = input.name;
  const description = input.description ?? null;
  const initialStock = input.stock ?? 0;
  const createdBy = input.createdBy;

  const query = `
    INSERT INTO items (name, description, stock, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const result = await dbPool.query(query, [
    name,
    description,
    initialStock,
    createdBy,
  ]);

  const created = await getItemById(result.rows[0].id);
  if (!created) {
    throw new Error('Failed to fetch created item');
  }
  return created;
};

export const getItems = async (userId: string): Promise<Item[]> => {
  const query = `
    SELECT
      i.id,
      i.name,
      i.description,
      i.stock,
      i.created_at,
      i.updated_at,
      i.created_by,
      u.name AS created_by_name,
      u.email AS created_by_email
    FROM items i
    JOIN users u ON u.id = i.created_by
    WHERE i.created_by = $1
    ORDER BY i.created_at DESC
  `;

  const result = await dbPool.query<ItemRow>(query, [userId]);

  return result.rows.map(mapItemRow);
};

export const getItemById = async (id: string): Promise<Item | null> => {
  const query = `
    SELECT
      i.id,
      i.name,
      i.description,
      i.stock,
      i.created_at,
      i.updated_at,
      i.created_by,
      u.name AS created_by_name,
      u.email AS created_by_email
    FROM items i
    JOIN users u ON u.id = i.created_by
    WHERE i.id = $1
  `;

  const result = await dbPool.query<ItemRow>(query, [id]);

  if (result.rowCount === 0) {
    return null;
  }

  return mapItemRow(result.rows[0]);
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
    RETURNING id
  `;

  const result = await dbPool.query(query, [newStock, id]);

  if (result.rowCount === 0) {
    return null;
  }

  return await getItemById(result.rows[0].id);
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
    RETURNING id
  `;

  const result = await dbPool.query(query, [name, description, id]);

  if (result.rowCount === 0) {
    return null;
  }

  return await getItemById(result.rows[0].id);
};

export const deleteItem = async (id: string): Promise<void> => {
  const query = `
    DELETE FROM items
    WHERE id = $1
  `;

  await dbPool.query(query, [id]);
};



