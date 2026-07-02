import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as schedulesController from './schedules.controller';

const router = Router();

router.use(requireAuth);

// Read actions
router.get('/', requireRole(['ADMINISTRATOR', 'AUDITOR', 'SUPERVISOR']), schedulesController.listSchedules);
router.get('/calendar', requireRole(['ADMINISTRATOR', 'AUDITOR', 'SUPERVISOR']), schedulesController.getCalendar);
router.get('/:id', requireRole(['ADMINISTRATOR', 'AUDITOR', 'SUPERVISOR']), schedulesController.getSchedule);

// Write actions (Admin only)
router.post('/', requireRole(['ADMINISTRATOR']), schedulesController.createSchedule);
router.put('/:id', requireRole(['ADMINISTRATOR']), schedulesController.updateSchedule);
router.delete('/:id', requireRole(['ADMINISTRATOR']), schedulesController.deleteSchedule);

export default router;
