import { Router } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../middleware/auth.js';
import {
  sendClientApproved,
  sendClientRejected
} from '../services/email.service.js';

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/appointments', async (req, res, next) => {
  try {
    const status = req.query.status ? String(req.query.status) : undefined;

    const appointments = await prisma.appointment.findMany({
      where: status ? { status: status as AppointmentStatus } : undefined,
      orderBy: { startsAt: 'asc' }
    });

    return res.json({ appointments });
  } catch (error) {
    return next(error);
  }
});

adminRouter.post('/appointments/:id/approve', async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id }
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const conflictingApproved = await prisma.appointment.findFirst({
      where: {
        id: { not: appointment.id },
        status: AppointmentStatus.APPROVED,
        startsAt: appointment.startsAt
      }
    });

    if (conflictingApproved) {
      return res.status(409).json({
        message: 'Another approved appointment already uses this slot'
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: AppointmentStatus.APPROVED }
    });

    await sendClientApproved(updated);
    return res.json({ appointment: updated });
  } catch (error) {
    return next(error);
  }
});

const rejectSchema = z.object({
  adminNotes: z.string().max(1000).optional()
});

adminRouter.post('/appointments/:id/reject', async (req, res, next) => {
  try {
    const input = rejectSchema.parse(req.body);

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status: AppointmentStatus.REJECTED,
        adminNotes: input.adminNotes
      }
    });

    await sendClientRejected(updated);
    return res.json({ appointment: updated });
  } catch (error) {
    return next(error);
  }
});
