import { Router } from 'express';
import authRouter from './auth.routes';
import itemRouter from './item.routes';

const router: Router = Router();

router.use('/auth', authRouter);
router.use('/items', itemRouter);

export default router;


