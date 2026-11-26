# Celeste Platini Pastelería — cursos online

Sitio y plataforma de venta de cursos online de pastelería para Celeste Platini, de San Francisco, Córdoba.

**Sitio:** https://celesteplatinipasteleriasf.onrender.com

## Funcionalidades

- Catálogo de cursos grabados y recetarios con precio y fotos de portada.
- Pago con Mercado Pago (Checkout Pro + webhook) y acceso inmediato al material después del pago.
- Cuentas de alumno con login; cada alumno ve sus cursos comprados.
- Panel de administración: cursos, links de material, portadas, alumnos y accesos.
- Contacto por WhatsApp e Instagram, y páginas legales (términos, privacidad, cancelaciones).
- Imágenes en Cloudinary y mails transaccionales con Resend.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma · PostgreSQL (Neon) · Auth.js · Mercado Pago · Cloudinary · Render

## Correr en local

```bash
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run create-admin
npm run dev
```
