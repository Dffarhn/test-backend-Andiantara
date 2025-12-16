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
    const logs = await getItemActivities(id);
    successResponse(res, 'Activity logs fetched successfully', logs, 200);
  } catch (error) {
    next(error);
  }
};


