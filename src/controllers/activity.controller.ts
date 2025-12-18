import { Request, Response, NextFunction } from 'express';
import { getItemActivities } from '../services/activity.service';
import { successResponse } from '../utils/response';

export const getItemActivitiesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const logs = await getItemActivities(id, userId ?? '');
    const data = logs.map((log) => ({
      id: log.id,
      action: log.action,
      quantity: log.quantity,
      createdAt: log.createdAt,
      user: log.user,
      item: log.item,
    }));
    successResponse(res, 'Activity logs fetched successfully', data, 200);
  } catch (error) {
    next(error);
  }
};


