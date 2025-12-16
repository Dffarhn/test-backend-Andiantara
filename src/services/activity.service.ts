import {
  ActivityAction,
  ActivityLog,
  createActivityLog,
  getActivityLogsByItemId,
} from '../models/activity.model';
import { AppError } from '../middlewares/app-error';

export const logStockChange = async (
  itemId: string,
  action: ActivityAction,
  quantity: number,
  userId: string,
): Promise<ActivityLog> => {
  if (!itemId) {
    throw new AppError('Item ID is required for activity log', 400);
  }

  if (!userId) {
    throw new AppError('User ID is required for activity log', 400);
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

  const logs = await getActivityLogsByItemId(itemId);
  return logs;
};


