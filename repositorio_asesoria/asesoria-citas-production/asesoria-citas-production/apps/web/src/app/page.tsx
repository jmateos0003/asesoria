'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../lib/api';

type Slot = {
  startsAt: string;
  available: boolean;
};

type MessageType = 'success' | 'error' | '';

export default function BookingPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>('');
  const [message, setMessage] = useState('');

  async function loadSlots() {
    const data = await apiFetch<{ slots: Slot[] }>(`/availability?date=${date}`);
    setSlots(data.slots);
  }

  useEffect(() => {
    setMessage('');
    setMessageType('');

    loadSlots().catch(() => {
      setMessageType('error');
      setMessage('No se han podido cargar los horarios.');
    });
  }, [date]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setMessage('');
    setMessageType('');

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

      form.reset();
      setSelectedSlot('');
      await loadSlots();

      setMessageType('success');
      setMessage('Solicitud enviada correctamente.');
    } catch (error) {
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Error enviando la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <section
        className="relative overflow-hidden px-6 py-8 text-white md:px-10 md:py-10"
        style={{
          background:
            "linear-gradient(115deg, rgba(3,9,18,.96) 0%, rgba(6,17,31,.88) 52%, rgba(26,128,182,.52) 100%), url('https://myhasesores.com/wp-content/uploads/2025/02/Shutterstock_2189726507-min.jpg') center/cover"
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,242,255,.24),transparent_35%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col gap-10">
          <header className="flex items-center justify-between gap-6">
            <div className="rounded-2xl bg-white p-3 shadow-2xl">
              <img
                src="https://myhasesores.com/wp-content/uploads/2018/02/Logo_288x180.jpg"
                alt="Martín y Herranz Asesores"
                className="h-16 w-auto object-contain md:h-20"
              />
            </div>

            <a
              href="/admin"
              className="rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition hover:bg-white hover:text-slate-950"
            >
              Acceso asesoría
            </a>
          </header>

          <div className="grid items-center gap-10 py-8 md:grid-cols-[1.05fr_.95fr] md:py-16">
            <div>
              <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-100 backdrop-blur">
                Primera cita · Reserva online
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
                Reserva tu cita con una asesoría cercana, clara y profesional
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-200 md:text-xl">
                Elige día y hora, envía tu solicitud y recibe la confirmación por email.
                Una forma sencilla de gestionar tu primera consulta sin llamadas ni esperas.
              </p>

              <div className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-3xl font-black">25+</p>
                  <p className="mt-1 text-sm text-slate-200">Años de experiencia</p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-3xl font-black">1000+</p>
                  <p className="mt-1 text-sm text-slate-200">Clientes asesorados</p>
                </div>

                <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <p className="text-3xl font-black">★★★★★</p>
                  <p className="mt-1 text-sm text-slate-200">Trato personalizado</p>
                </div>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/20 bg-white/15 p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-[28px] bg-white p-6 text-slate-950 shadow-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
                  Agenda digital
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  Selecciona tu cita
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Escoge una fecha disponible y completa tus datos. La asesoría revisará la
                  solicitud y te responderá por email.
                </p>

                <div className="mt-6 rounded-3xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <p className="text-sm font-bold">Próximos horarios</p>
                      <p className="text-xs text-slate-500">Consulta presencial</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                      60 min
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {slots.slice(0, 4).map((slot) => (
                      <div
                        key={slot.startsAt}
                        className={`rounded-2xl px-4 py-3 text-center text-sm font-bold ${
                          slot.available
                            ? 'bg-white text-blue-800 shadow-sm'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {new Intl.DateTimeFormat('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(new Date(slot.startsAt))}
                      </div>
                    ))}

                    {slots.length === 0 && (
                      <>
                        <div className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-800 shadow-sm">
                          10:00
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-800 shadow-sm">
                          12:00
                        </div>
                        <div className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-bold text-blue-800 shadow-sm">
                          16:00
                        </div>
                        <div className="rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-bold text-slate-400">
                          17:00
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <a
                  href="#reserva"
                  className="mt-6 flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-4 font-black text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-800"
                >
                  Reservar cita online
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-14 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[36px] bg-slate-950 shadow-2xl">
            <div
              className="min-h-[420px] p-8 text-white md:min-h-full"
              style={{
                background:
                  "linear-gradient(180deg, rgba(6,17,31,.10), rgba(6,17,31,.88)), url('https://myhasesores.com/wp-content/uploads/2025/02/Shutterstock_2189726507-min.jpg') center/cover"
              }}
            >
              <div className="flex h-full min-h-[360px] flex-col justify-end">
                <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-blue-200">
                  Martín y Herranz Asesores
                </p>
                <h2 className="max-w-md text-4xl font-black leading-tight tracking-[-0.05em]">
                  Una primera conversación puede ahorrarte mucho tiempo.
                </h2>
              </div>
            </div>
          </div>

          <form
            id="reserva"
            onSubmit={submit}
            className="grid gap-8 rounded-[36px] border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-900/10 md:grid-cols-2 md:p-8"
          >
            <div>
              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-700">
                  Agenda tu cita
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                  Elige día y hora
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Los horarios no disponibles aparecen bloqueados para evitar reservas duplicadas.
                </p>
              </div>

              <label className="mb-2 block text-sm font-bold text-slate-800">Fecha</label>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 font-semibold outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-7">
                <p className="mb-3 text-sm font-bold text-slate-800">Horarios disponibles</p>

                <div className="grid grid-cols-2 gap-3">
                  {slots.map((slot) => (
                    <button
                      key={slot.startsAt}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.startsAt)}
                      className={`rounded-2xl border px-4 py-4 text-sm font-black transition ${
                        selectedSlot === slot.startsAt
                          ? 'border-blue-700 bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                          : slot.available
                            ? 'border-slate-200 bg-white text-slate-900 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50'
                            : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-400'
                      }`}
                    >
                      {new Intl.DateTimeFormat('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(new Date(slot.startsAt))}
                    </button>
                  ))}
                </div>

                {slots.length === 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    No hay horarios cargados para esta fecha.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[28px] bg-slate-50 p-5 md:p-6">
              <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-slate-500">
                Tus datos
              </p>

              <div className="space-y-4">
                <input
                  name="clientName"
                  required
                  placeholder="Nombre y apellidos"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <input
                  name="clientEmail"
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <input
                  name="clientPhone"
                  placeholder="Teléfono"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <textarea
                  name="reason"
                  placeholder="Motivo de la consulta"
                  className="min-h-36 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  disabled={loading || !selectedSlot}
                  className="w-full rounded-2xl bg-blue-700 px-5 py-4 font-black text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                >
                  {loading ? 'Enviando solicitud...' : 'Solicitar cita'}
                </button>

                {messageType === 'success' && (
                  <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-900">
                    <p className="font-black">✅ {message}</p>
                    <p className="mt-1">Hemos recibido tu solicitud de cita.</p>
                    <p>Te enviaremos una confirmación por email cuando sea revisada.</p>
                  </div>
                )}

                {messageType === 'error' && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-900">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="px-6 pb-16 md:px-10">
        <div className="mx-auto max-w-7xl rounded-[36px] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-blue-300">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                Reserva en tres pasos
              </h2>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <p className="mb-4 text-3xl font-black text-blue-200">01</p>
              <h3 className="text-xl font-black">Elige horario</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Selecciona una fecha y uno de los huecos disponibles.
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
              <p className="mb-4 text-3xl font-black text-blue-200">02</p>
              <h3 className="text-xl font-black">Envía tus datos</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                La asesoría recibe tu solicitud y revisa la disponibilidad.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}