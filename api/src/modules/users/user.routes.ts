// src/modules/users/user.routes.ts
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/appError';
import * as userService from './user.service';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(['Administrator']));

adminRouter.get('/users', async (req, res) => {
  try {
    const users = await userService.listUsers();
    res.status(200).json({ users });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    throw err;
  }
});

adminRouter.delete('/users/:id', async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error during delete:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});