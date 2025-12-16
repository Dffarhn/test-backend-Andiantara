import { dbPool } from '../config/database';

export type ActivityAction = 'IN' | 'OUT';

export interface ActivityLog {
  id: string;
  itemId: string;
  userId: string;
  action: ActivityAction;
  quantity: number;
  createdAt: Date;
}

export interface CreateActivityLogInput {
  itemId: string;
  userId: string;
  action: ActivityAction;
  quantity: number;
}

export const createActivityLog = async (
  input: CreateActivityLogInput,
): Promise<ActivityLog> => {
  const query = `
    INSERT INTO activity_logs (item_id, user_id, action, quantity)
    VALUES ($1, $2, $3, $4)
    RETURNING id, item_id, user_id, action, quantity, created_at
  `;

  const result = await dbPool.query(query, [
    input.itemId,
    input.userId,
    input.action,
    input.quantity,
  ]);

  const row = result.rows[0];

  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    action: row.action,
    quantity: row.quantity,
    createdAt: row.created_at,
  };
};

interface ActivityLogRow {
  id: string;
  item_id: string;
  user_id: string;
  action: ActivityAction;
  quantity: number;
  created_at: Date;
}

export const getActivityLogsByItemId = async (
  itemId: string,
): Promise<ActivityLog[]> => {
  const query = `
    SELECT id, item_id, user_id, action, quantity, created_at
    FROM activity_logs
    WHERE item_id = $1
    ORDER BY created_at DESC
  `;

  const result = await dbPool.query<ActivityLogRow>(query, [itemId]);

  return result.rows.map((row: ActivityLogRow) => ({
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    action: row.action,
    quantity: row.quantity,
    createdAt: row.created_at,
  }));
};


