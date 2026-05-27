import 'dotenv/config';
import { AppointmentStatus } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { sendClientReminder } from '../services/email.service.js';

async function main() {
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: AppointmentStatus.APPROVED,
      reminderSentAt: null,
      startsAt: {
        gte: now,
        lte: in24Hours
      }
    }
  });

  for (const appointment of appointments) {
    await sendClientReminder(appointment);
    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { reminderSentAt: new Date() }
    });
  }

  console.log(`Reminders sent: ${appointments.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
