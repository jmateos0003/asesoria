import { Router } from 'express';
import { z } from 'zod';
import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { addMinutes, toDateOrThrow } from '../lib/dates.js';
import {
  notifyAdminNewAppointment,
  sendClientRequestReceived
} from '../services/email.service.js';

export const publicRouter = Router();

const appointmentSchema = z.object({
  clientName: z.string().min(2).max(120),
  clientEmail: z.string().email(),
  clientPhone: z.string().max(40).optional().nullable(),
  reason: z.string().max(1000).optional().nullable(),
  startsAt: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(180).default(60)
});

publicRouter.get('/availability', async (req, res, next) => {
  try {
    const date = String(req.query.date || '');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: 'date must be YYYY-MM-DD' });
    }

    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const approved = await prisma.appointment.findMany({
      where: {
        status: AppointmentStatus.APPROVED,
        startsAt: { gte: dayStart, lte: dayEnd }
      },
      select: { startsAt: true }
    });

    const blockedTimes = new Set(approved.map((a) => a.startsAt.toISOString()));

    const slots: { startsAt: string; available: boolean }[] = [];
    const businessHours = [9, 10, 11, 12, 16, 17, 18];

    for (const hour of businessHours) {
      const slot = new Date(`${date}T${String(hour).padStart(2, '0')}:00:00.000Z`);
      slots.push({
        startsAt: slot.toISOString(),
        available: !blockedTimes.has(slot.toISOString()) && slot > new Date()
      });
    }

    return res.json({ slots });
  } catch (error) {
    return next(error);
  }
});

publicRouter.post('/appointments', async (req, res, next) => {
  try {
    const input = appointmentSchema.parse(req.body);
    const startsAt = toDateOrThrow(input.startsAt);
    const endsAt = addMinutes(startsAt, input.durationMinutes);

    const existingApproved = await prisma.appointment.findFirst({
      where: {
        status: AppointmentStatus.APPROVED,
        startsAt
      }
    });

    if (existingApproved) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone,
        reason: input.reason,
        startsAt,
        endsAt,
        status: AppointmentStatus.PENDING
      }
    });

    await Promise.all([
      notifyAdminNewAppointment(appointment),
      sendClientRequestReceived(appointment)
    ]);

    return res.status(201).json({ appointment });
  } catch (error) {
    return next(error);
  }
});
