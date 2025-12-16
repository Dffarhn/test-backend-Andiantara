import { Router } from 'express';
import {
  createItem,
  getItemByIdController,
  getItemsController,
  updateItemStockController,
  updateItemDetailsController,
  deleteItemController,
} from '../controllers/item.controller';
import { getItemActivitiesController } from '../controllers/activity.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const itemRouter: Router = Router();

itemRouter.use(authMiddleware);

itemRouter.post('/', createItem);
itemRouter.get('/', getItemsController);
itemRouter.get('/:id', getItemByIdController);
itemRouter.patch('/:id', updateItemDetailsController);
itemRouter.patch('/:id/stock', updateItemStockController);
itemRouter.get('/:id/activities', getItemActivitiesController);
itemRouter.delete('/:id', deleteItemController);

export default itemRouter;


