import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { prisma } from '../../db/prisma';

const router = Router();

router.get('/', requireAuth, async (_req, res) => {
  try {
    const shifts = await prisma.setts_shifts.findMany({
      orderBy: { id: 'asc' },
    });
    res.status(200).json({ shifts });
  } catch (err) {
    console.error('Error listing shifts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
