import {
  createItem,
  CreateItemInput,
  getItemById,
  getItems,
  Item,
  updateItemStock,
  updateItemDetails,
  UpdateItemDetailsInput,
  deleteItem,
} from '../models/item.model';
import { AppError } from '../middlewares/app-error';
import { ActivityLog, ActivityAction } from '../models/activity.model';
import { logStockChange } from './activity.service';

const isUuid = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
};

export interface CreateItemPayload {
  name: string;
  description?: string;
  stock?: number;
}

export interface UpdateStockPayload {
  type: ActivityAction;
  quantity: number;
}

export interface UpdateItemDetailsPayload {
  name?: string;
  description?: string;
}

export const createItemService = async (
  payload: CreateItemPayload,
  userId: string,
): Promise<Item> => {
  const { name, description, stock } = payload;

  if (!userId) {
    throw new AppError('User ID is required to create item', 401);
  }

  if (!name) {
    throw new AppError('Name is required', 400);
  }

  if (stock !== undefined && (typeof stock !== 'number' || Number.isNaN(stock))) {
    throw new AppError('Stock must be a number', 400);
  }

  if (stock !== undefined && stock < 0) {
    throw new AppError('Initial stock cannot be negative', 400);
  }

  const input: CreateItemInput = {
    name,
    description,
    stock,
    createdBy: userId,
  };

  const item = await createItem(input);
  return item;
};

export const getItemsService = async (userId: string): Promise<Item[]> => {
  const items = await getItems(userId);
  return items;
};

export const getItemByIdService = async (id: string, userId: string): Promise<Item> => {
  if (!id) {
    throw new AppError('Item ID is required', 400);
  }

  if (!isUuid(id)) {
    throw new AppError('Item ID must be a valid UUID', 400);
  }

  const item = await getItemById(id);

  if (!item) {
    throw new AppError('Item not found', 404);
  }

  if (item.createdBy.id !== userId) {
    throw new AppError('Access denied: You do not own this item', 403);
  }

  return item;
};

export const updateItemDetailsService = async (
  id: string,
  payload: UpdateItemDetailsPayload,
  userId: string,
): Promise<Item> => {
  if (!id) {
    throw new AppError('Item ID is required', 400);
  }

  if (!isUuid(id)) {
    throw new AppError('Item ID must be a valid UUID', 400);
  }

  const hasName: boolean = payload.name !== undefined;
  const hasDescription: boolean = payload.description !== undefined;

  if (!hasName && !hasDescription) {
    throw new AppError('At least one field (name or description) is required', 400);
  }

  // Check existence and ownership
  await getItemByIdService(id, userId);

  const input: UpdateItemDetailsInput = {
    name: payload.name,
    description: payload.description,
  };

  const updated = await updateItemDetails(id, input);

  if (!updated) {
    throw new AppError('Failed to update item', 500);
  }

  return updated;
};

export interface UpdateStockResult {
  item: Item;
  activity: ActivityLog;
}

export const updateItemStockService = async (
  id: string,
  payload: UpdateStockPayload,
  userId: string,
): Promise<UpdateStockResult> => {
  if (!id) {
    throw new AppError('Item ID is required', 400);
  }

  if (!isUuid(id)) {
    throw new AppError('Item ID must be a valid UUID', 400);
  }

  if (!userId) {
    throw new AppError('User ID is required to update stock', 401);
  }

  const { type, quantity } = payload;

  if (type !== 'IN' && type !== 'OUT') {
    throw new AppError('Invalid stock action type', 400);
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }

  // Check existence and ownership
  const item = await getItemByIdService(id, userId);

  const delta = type === 'IN' ? quantity : -quantity;
  const newStock = item.stock + delta;

  if (newStock < 0) {
    throw new AppError('Stock cannot be negative', 400);
  }

  const updatedItem = await updateItemStock(id, newStock);

  if (!updatedItem) {
    throw new AppError('Failed to update stock', 500);
  }

  const activity = await logStockChange(id, type, quantity, userId);

  return {
    item: updatedItem,
    activity,
  };
};

export const deleteItemService = async (id: string, userId: string): Promise<void> => {
  if (!id) {
    throw new AppError('Item ID is required', 400);
  }

  if (!isUuid(id)) {
    throw new AppError('Item ID must be a valid UUID', 400);
  }

  // Check existence and ownership
  await getItemByIdService(id, userId);

  await deleteItem(id);
};



