import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Asesoría Citas',
  description: 'Reserva de citas online para asesorías'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
