import { dbPool } from '../config/database';

export type ActivityAction = 'IN' | 'OUT';

export interface ActivityUser {
  id: string;
  name: string;
  email: string;
}

export interface ActivityItem {
  id: string;
  name: string;
  description: string | null;
  stock: number;
}

export interface ActivityLog {
  id: string;
  itemId: string;
  userId: string;
  action: ActivityAction;
  quantity: number;
  createdAt: Date;
  user: ActivityUser;
  item: ActivityItem;
}

export interface CreateActivityLogInput {
  itemId: string;
  userId: string;
  action: ActivityAction;
  quantity: number;
}

interface ActivityLogRow {
  id: string;
  item_id: string;
  user_id: string;
  action: ActivityAction;
  quantity: number;
  created_at: Date;
  user_name: string;
  user_email: string;
  item_name: string;
  item_description: string | null;
  item_stock: number;
}

const mapActivityRow = (row: ActivityLogRow): ActivityLog => {
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    action: row.action,
    quantity: row.quantity,
    createdAt: row.created_at,
    user: {
      id: row.user_id,
      name: row.user_name,
      email: row.user_email,
    },
    item: {
      id: row.item_id,
      name: row.item_name,
      description: row.item_description,
      stock: row.item_stock,
    },
  };
};

export const createActivityLog = async (
  input: CreateActivityLogInput,
): Promise<ActivityLog> => {
  const query = `
    INSERT INTO activity_logs (item_id, user_id, action, quantity)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const result = await dbPool.query(query, [
    input.itemId,
    input.userId,
    input.action,
    input.quantity,
  ]);

  const created = await getActivityLogById(result.rows[0].id);
  if (!created) {
    throw new Error('Failed to fetch created activity log');
  }
  return created;
};

export const getActivityLogById = async (
  id: string,
): Promise<ActivityLog | null> => {
  const query = `
    SELECT
      al.id,
      al.item_id,
      al.user_id,
      al.action,
      al.quantity,
      al.created_at,
      u.name AS user_name,
      u.email AS user_email,
      i.name AS item_name,
      i.description AS item_description,
      i.stock AS item_stock
    FROM activity_logs al
    JOIN users u ON u.id = al.user_id
    JOIN items i ON i.id = al.item_id
    WHERE al.id = $1
  `;

  const result = await dbPool.query<ActivityLogRow>(query, [id]);

  if (result.rowCount === 0) {
    return null;
  }

  return mapActivityRow(result.rows[0]);
};

export const getActivityLogsByItemId = async (
  itemId: string,
): Promise<ActivityLog[]> => {
  const query = `
    SELECT
      al.id,
      al.item_id,
      al.user_id,
      al.action,
      al.quantity,
      al.created_at,
      u.name AS user_name,
      u.email AS user_email,
      i.name AS item_name,
      i.description AS item_description,
      i.stock AS item_stock
    FROM activity_logs al
    JOIN users u ON u.id = al.user_id
    JOIN items i ON i.id = al.item_id
    WHERE al.item_id = $1
    ORDER BY al.created_at DESC
  `;

  const result = await dbPool.query<ActivityLogRow>(query, [itemId]);

  return result.rows.map(mapActivityRow);
};


