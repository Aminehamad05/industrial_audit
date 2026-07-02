import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/appError';
import * as userService from './user.service';

export const supervisorRouter = Router();

supervisorRouter.use(requireAuth, requireRole(['SUPERVISOR']));

supervisorRouter.get('/auditors', async (req, res) => {
  try {
    const auditors = await userService.listSupervisorAuditors(req.user!.userId);
    res.status(200).json({ auditors });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Error listing supervisor auditors:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
