import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as plantsController from './plant.controller';

const router = Router();

router.get('/', requireAuth, plantsController.listPlants);

export default router;
