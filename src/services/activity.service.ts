import {
  ActivityAction,
  ActivityLog,
  createActivityLog,
  getActivityLogsByItemId,
} from '../models/activity.model';
import { AppError } from '../middlewares/app-error';

const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
};

export const logStockChange = async (
  itemId: string,
  action: ActivityAction,
  quantity: number,
  userId: string,
): Promise<ActivityLog> => {
  if (!itemId) {
    throw new AppError('Item ID is required for activity log', 400);
  }

  if (!isUuid(itemId)) {
    throw new AppError('Item ID must be a valid UUID', 400);
  }

  if (!userId) {
    throw new AppError('User ID is required for activity log', 400);
  }

  if (!isUuid(userId)) {
    throw new AppError('User ID must be a valid UUID', 400);
  }

  const log = await createActivityLog({
    itemId,
    userId,
    action,
    quantity,
  });

  return log;
};

export const getItemActivities = async (
  itemId: string,
): Promise<ActivityLog[]> => {
  if (!itemId) {
    throw new AppError('Item ID is required', 400);
  }

  if (!isUuid(itemId)) {
    throw new AppError('Item ID must be a valid UUID', 400);
  }

  const logs = await getActivityLogsByItemId(itemId);
  return logs;
};


