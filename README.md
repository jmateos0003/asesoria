# Asesoría Citas

Aplicación web completa para que una asesoría pueda gestionar reservas de citas online.

## Funcionalidades

- Vista pública para que potenciales clientes pidan cita.
- Panel privado para la asesoría.
- Aprobación o rechazo de solicitudes.
- Bloqueo automático del hueco cuando una cita se aprueba.
- Emails automáticos:
  - aviso interno de nueva solicitud
  - confirmación al cliente
  - rechazo al cliente
  - recordatorio antes de la cita
- Script de recordatorios ejecutable por cron.
- API REST con Node.js, Express, TypeScript y Prisma.
- Frontend con Next.js, TypeScript y Tailwind.
- Base de datos PostgreSQL.
- Docker Compose incluido.

## Estructura

```txt
asesoria-citas-production/
  apps/
    api/
    web/
  docker-compose.yml
  README.md
```

## Requisitos

- Node.js 20+
- Docker y Docker Compose
- npm

## Arranque local rápido

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend:

```txt
http://localhost:3000
```

API:

```txt
http://localhost:4000/health
```

## Usuario administrador inicial

```txt
Email: admin@asesoria.local
Password: CambiarEstaPassword123!
```

Cambia esta contraseña después del primer despliegue.

## Variables de entorno

Copia `.env.example` a `.env`.

```bash
cp .env.example .env
```

Configura especialmente:

```env
DATABASE_URL=
JWT_SECRET=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
ADMIN_NOTIFICATION_EMAIL=
PUBLIC_APP_URL=
```

## Ejecutar con Docker completo

```bash
cp .env.example .env
docker compose up --build
```

Frontend:

```txt
http://localhost:3000
```

API:

```txt
http://localhost:4000
```

## Recordatorios

El backend incluye un comando para enviar recordatorios:

```bash
npm run reminders --workspace apps/api
```

En un servidor Linux puedes añadir un cron cada 15 minutos:

```cron
*/15 * * * * cd /ruta/asesoria-citas-production && npm run reminders --workspace apps/api >> reminders.log 2>&1
```

Por defecto se envían recordatorios para citas aprobadas que ocurren dentro de las próximas 24 horas y que no tengan `reminderSentAt`.

## Despliegue recomendado

Opción sencilla:

- Frontend: Vercel
- API: Render, Railway o VPS
- PostgreSQL: Supabase, Railway o servidor propio

Opción servidor propio:

- VPS con Docker
- Nginx como reverse proxy
- Certbot para HTTPS
- PostgreSQL en Docker o gestionado

## Endpoints principales

### Público

```http
GET /api/availability
POST /api/appointments
```

### Admin

```http
POST /api/auth/login
GET /api/admin/appointments
POST /api/admin/appointments/:id/approve
POST /api/admin/appointments/:id/reject
```

## Seguridad mínima incluida

- Hash de contraseña con bcrypt.
- JWT para sesión admin.
- Validación con Zod.
- Helmet.
- CORS controlado.
- Rate limiting básico.
- Separación de rutas públicas/admin.

## Nota importante

Esta app está lista como base funcional de producción, pero antes de usarla con clientes reales deberías:

- Cambiar secretos.
- Configurar SMTP real.
- Activar HTTPS.
- Revisar textos legales.
- Añadir política de privacidad.
- Añadir CAPTCHA si recibes spam.
