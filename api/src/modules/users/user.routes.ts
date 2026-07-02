// src/modules/users/user.routes.ts
import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware';
import { AppError } from '../../shared/errors/appError';
import * as userService from './user.service';
import {listAuditorSupervisors,setAuditorSupervisor,removeAuditorSupervisor} from "./user.service"
export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(['ADMINISTRATOR']));

adminRouter.get('/users', async (req, res) => {
  try {
    const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
    const users = await userService.listUsers(statusFilter);
    res.status(200).json({ users });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error during list:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const handleAccept = async (req: any, res: any) => {
  try {
    const membership = await userService.acceptUser(req.params.id);
    res.status(200).json({ message: 'User accepted successfully', membership });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error during accept:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

adminRouter.post('/users/:id/accept', handleAccept);
adminRouter.patch('/users/:id/accept', handleAccept);

const handleBlock = async (req: any, res: any) => {
  try {
    const membership = await userService.blockUser(req.params.id);
    res.status(200).json({ message: 'User blocked successfully', membership });
  } catch (err) {
    if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
    console.error('Unexpected error during block:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

adminRouter.post('/users/:id/block', handleBlock);
adminRouter.patch('/users/:id/block', handleBlock);

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

adminRouter.get(
  '/users/:userId/supervisors',
  requireAuth,
  requireRole(['ADMINISTRATOR']),
  async (req, res, next) => {
    try {
      const result = await listAuditorSupervisors(req.params.userId as string);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.put(
  '/users/:userId/supervisors/:plantId',
  requireAuth,
  requireRole(['ADMINISTRATOR']),
  async (req, res, next) => {
    try {
      const { supervisorId } = req.body;
      const result = await setAuditorSupervisor(
        req.params.userId as string,
        Number(req.params.plantId),
        supervisorId
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.delete(
  '/users/:userId/supervisors/:plantId',
  requireAuth,
  requireRole(['ADMINISTRATOR']),
  async (req, res, next) => {
    try {
      const result = await removeAuditorSupervisor(
        req.params.userId as string,
        Number(req.params.plantId)
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);