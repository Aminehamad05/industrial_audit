// src/modules/audits/audits.routes.ts
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as auditsController from './audits.controller';

const router = Router();

router.use(requireAuth);

// Read access — supervisors see scoped audits via supervisorId query param.
router.get('/', requireRole(['ADMINISTRATOR', 'AUDITOR', 'SUPERVISOR']), auditsController.listAudits);
router.get('/dashboard', requireRole(['ADMINISTRATOR']), auditsController.getDashboardAudits);
router.get('/kpis', requireRole(['ADMINISTRATOR', 'SUPERVISOR']), auditsController.getAuditKpis);
router.get('/:id', requireRole(['ADMINISTRATOR', 'AUDITOR', 'SUPERVISOR']), auditsController.getAudit);

// Write actions — admins can assign any supervisor, supervisors self-assign.
router.post('/', requireRole(['ADMINISTRATOR', 'SUPERVISOR']), auditsController.createAndAssignAudit);
router.post('/:id/details', requireRole(['ADMINISTRATOR', 'SUPERVISOR']), auditsController.bulkCreateDetails);
router.patch('/:id/reassign', requireRole(['ADMINISTRATOR', 'SUPERVISOR']), auditsController.reassignAuditor);

export default router;