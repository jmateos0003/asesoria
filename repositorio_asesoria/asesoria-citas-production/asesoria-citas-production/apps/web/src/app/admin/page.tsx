'use client';

import { useEffect, useState } from 'react';
import { API_URL, apiFetch } from '../../lib/api';

type Appointment = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  reason?: string;
  startsAt: string;
  endsAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminNotes?: string;
};

export default function AdminPage() {
  const [token, setToken] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const stored = window.localStorage.getItem('adminToken') || '';
    setToken(stored);
  }, []);

  useEffect(() => {
    if (token) {
      loadAppointments().catch(() => setMessage('No se han podido cargar las citas.'));
    }
  }, [token]);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    const formData = new FormData(event.currentTarget);

    try {
      const data = await apiFetch<{ token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: formData.get('email'),
          password: formData.get('password')
        })
      });

      window.localStorage.setItem('adminToken', data.token);
      setToken(data.token);
    } catch {
      setMessage('Credenciales incorrectas.');
    }
  }

  async function loadAppointments() {
    const response = await fetch(`${API_URL}/admin/appointments`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    setAppointments(data.appointments);
  }

  async function approve(id: string) {
    await fetch(`${API_URL}/admin/appointments/${id}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadAppointments();
  }

  async function reject(id: string) {
    const adminNotes = window.prompt('Motivo opcional para el cliente') || '';
    await fetch(`${API_URL}/admin/appointments/${id}/reject`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ adminNotes })
    });
    await loadAppointments();
  }

  function logout() {
    window.localStorage.removeItem('adminToken');
    setToken('');
  }

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <form onSubmit={login} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="mb-6 text-3xl font-bold">Panel asesoría</h1>
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="mb-4 w-full rounded-xl border px-4 py-3"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Contraseña"
            className="mb-4 w-full rounded-xl border px-4 py-3"
          />
          <button className="w-full rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white">
            Entrar
          </button>
          {message && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{message}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Agenda de citas</h1>
            <p className="mt-2 text-slate-600">Solicitudes pendientes y citas aprobadas.</p>
          </div>
          <button onClick={logout} className="rounded-xl border px-4 py-2 text-sm font-semibold">
            Salir
          </button>
        </div>

        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <article key={appointment.id} className="rounded-3xl bg-white p-6 shadow">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                    {appointment.status}
                  </span>
                  <h2 className="mt-3 text-xl font-bold">{appointment.clientName}</h2>
                  <p className="text-sm text-slate-600">{appointment.clientEmail}</p>
                  {appointment.clientPhone && (
                    <p className="text-sm text-slate-600">{appointment.clientPhone}</p>
                  )}
                  <p className="mt-3 font-semibold">
                    {new Intl.DateTimeFormat('es-ES', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    }).format(new Date(appointment.startsAt))}
                  </p>
                  {appointment.reason && <p className="mt-3 text-slate-700">{appointment.reason}</p>}
                </div>

                {appointment.status === 'PENDING' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => approve(appointment.id)}
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => reject(appointment.id)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}

          {appointments.length === 0 && (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-600 shadow">
              No hay citas todavía.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
