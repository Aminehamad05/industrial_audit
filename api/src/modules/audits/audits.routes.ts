// src/modules/audits/audits.routes.ts
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import * as auditsController from './audits.controller';

const router = Router();

router.use(requireAuth);

// Read access for both roles — auditors need to see their own assigned audits.
router.get('/', requireRole(['Administrator', 'Auditor']), auditsController.listAudits);
router.get('/dashboard', requireRole(['Administrator']), auditsController.getDashboardAudits);
router.get('/:id', requireRole(['Administrator', 'Auditor']), auditsController.getAudit);

// Write/admin-only actions.
router.post('/', requireRole(['Administrator']), auditsController.createAndAssignAudit);
router.post('/:id/details', requireRole(['Administrator']), auditsController.bulkCreateDetails);
router.patch('/:id/reassign', requireRole(['Administrator']), auditsController.reassignAuditor);

export default router;