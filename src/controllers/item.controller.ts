import { Request, Response, NextFunction } from 'express';
import { successResponse } from '../utils/response';
import {
  createItemService,
  getItemByIdService,
  getItemsService,
  updateItemStockService,
  updateItemDetailsService,
  deleteItemService,
} from '../services/item.service';

export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { name, description, stock } = req.body as {
      name?: string;
      description?: string;
      stock?: number;
    };

    const userId: string | undefined = req.user?.id;

    const item = await createItemService(
      {
        name: name ?? '',
        description,
        stock,
      },
      userId ?? '',
    );

    successResponse(res, 'Item created successfully', item, 201);
  } catch (error) {
    next(error);
  }
};

export const getItemsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const items = await getItemsService(userId ?? '');
    successResponse(res, 'Items fetched successfully', items, 200);
  } catch (error) {
    next(error);
  }
};

export const getItemByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const item = await getItemByIdService(id, userId ?? '');
    successResponse(res, 'Item fetched successfully', item, 200);
  } catch (error) {
    next(error);
  }
};

export const updateItemStockController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { type, quantity } = req.body as {
      type?: string;
      quantity?: number;
    };

    const userId: string | undefined = req.user?.id;

    const result = await updateItemStockService(
      id,
      {
        type: (type ?? '') as 'IN' | 'OUT',
        quantity: quantity ?? 0,
      },
      userId ?? '',
    );

    successResponse(
      res,
      'Stock updated successfully',
      {
        item: result.item,
        activity: {
          id: result.activity.id,
          action: result.activity.action,
          quantity: result.activity.quantity,
          createdAt: result.activity.createdAt,
          user: result.activity.user,
          item: result.activity.item,
        },
      },
      200,
    );
  } catch (error) {
    next(error);
  }
};

export const updateItemDetailsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body as {
      name?: string;
      description?: string;
    };

    const userId = req.user?.id;

    const updated = await updateItemDetailsService(
      id,
      {
        name,
        description,
      },
      userId ?? '',
    );

    successResponse(res, 'Item updated successfully', updated, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await deleteItemService(id, userId ?? '');

    successResponse(res, 'Item deleted successfully', null, 200);
  } catch (error) {
    next(error);
  }
};


