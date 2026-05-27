'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

type Slot = {
  startsAt: string;
  available: boolean;
};

export default function BookingPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function loadSlots() {
    setMessage('');
    const data = await apiFetch<{ slots: Slot[] }>(`/availability?date=${date}`);
    setSlots(data.slots);
  }

  useEffect(() => {
    loadSlots().catch(() => setMessage('No se han podido cargar los horarios.'));
  }, [date]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(event.currentTarget);

    try {
      await apiFetch('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          clientName: formData.get('clientName'),
          clientEmail: formData.get('clientEmail'),
          clientPhone: formData.get('clientPhone'),
          reason: formData.get('reason'),
          startsAt: selectedSlot,
          durationMinutes: 60
        })
      });

      setMessage('Solicitud enviada. Te avisaremos por email cuando sea aprobada.');
      event.currentTarget.reset();
      setSelectedSlot('');
      await loadSlots();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Error enviando la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-slate-950 p-8 text-white shadow-xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            Asesoría
          </p>
          <h1 className="text-4xl font-bold">Reserva tu cita online</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Solicita una cita con nuestra asesoría. Revisaremos tu solicitud y recibirás
            confirmación por email.
          </p>
          <a
            href="/admin"
            className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Acceso asesoría
          </a>
        </div>

        <form onSubmit={submit} className="grid gap-6 rounded-3xl bg-white p-6 shadow-lg md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold">Fecha</label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border px-4 py-3"
            />

            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold">Horarios disponibles</p>
              <div className="grid grid-cols-2 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.startsAt}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.startsAt)}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      selectedSlot === slot.startsAt
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : slot.available
                          ? 'bg-white hover:bg-slate-100'
                          : 'cursor-not-allowed bg-slate-100 text-slate-400'
                    }`}
                  >
                    {new Intl.DateTimeFormat('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }).format(new Date(slot.startsAt))}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <input
              name="clientName"
              required
              placeholder="Nombre y apellidos"
              className="w-full rounded-xl border px-4 py-3"
            />
            <input
              name="clientEmail"
              type="email"
              required
              placeholder="Email"
              className="w-full rounded-xl border px-4 py-3"
            />
            <input
              name="clientPhone"
              placeholder="Teléfono"
              className="w-full rounded-xl border px-4 py-3"
            />
            <textarea
              name="reason"
              placeholder="Motivo de la consulta"
              className="min-h-32 w-full rounded-xl border px-4 py-3"
            />
            <button
              disabled={loading || !selectedSlot}
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? 'Enviando...' : 'Solicitar cita'}
            </button>
            {message && <p className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
          </div>
        </form>
      </section>
    </main>
  );
}
