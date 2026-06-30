// src/modules/audits/audits.routes.ts
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as auditsController from './audits.controller';

const router = Router();

router.use(requireAuth);

// Read access for both roles — auditors need to see their own assigned audits.
router.get('/', requireRole(['ADMINISTRATOR', 'AUDITOR']), auditsController.listAudits);
router.get('/dashboard', requireRole(['ADMINISTRATOR']), auditsController.getDashboardAudits);
router.get('/:id', requireRole(['ADMINISTRATOR', 'AUDITOR']), auditsController.getAudit);

// Write/admin-only actions.
router.post('/', requireRole(['ADMINISTRATOR']), auditsController.createAndAssignAudit);
router.post('/:id/details', requireRole(['ADMINISTRATOR']), auditsController.bulkCreateDetails);
router.patch('/:id/reassign', requireRole(['ADMINISTRATOR']), auditsController.reassignAuditor);

export default router;