import Image from "next/image";
import { X, Check, Minus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  createFAQ,
  deleteFAQ,
  toggleFAQPublished,
  createTestimonial,
  toggleTestimonialPublished,
  deleteTestimonial,
  uploadGalleryImage,
  deleteGalleryImage,
  updateLegalPage,
} from "@/lib/actions/content";

export default async function AdminContentPage() {
  const [faqs, testimonials, galleryImages, legalPages] = await Promise.all([
    prisma.fAQ.findMany({ orderBy: [{ section: "asc" }, { sortOrder: "asc" }] }),
    prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.galleryImage.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.legalPage.findMany({ orderBy: { slug: "asc" } }),
  ]);

  return (
    <div className="max-w-4xl space-y-12">
      <h1 className="font-display text-3xl text-cocoa">Contenido de la web</h1>

      <section>
        <h2 className="font-display text-xl text-cocoa mb-4">Preguntas frecuentes</h2>
        <div className="rounded-2xl border border-cocoa/10 bg-cream divide-y divide-cocoa/10 mb-5">
          {faqs.map((faq) => (
            <div key={faq.id} className="flex items-start gap-3 px-5 py-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-cocoa">{faq.question}</p>
                <p className="text-sm text-ink/60 mt-1">{faq.answer}</p>
                <p className="text-xs text-ink/30 mt-1">Sección: {faq.section}</p>
              </div>
              <form action={toggleFAQPublished.bind(null, faq.id, !faq.isPublished)}>
                <button type="submit" className={`p-1.5 rounded-full ${faq.isPublished ? "text-[#3F6B3A]" : "text-ink/30"}`} title={faq.isPublished ? "Publicada" : "Oculta"}>
                  {faq.isPublished ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </button>
              </form>
              <form action={deleteFAQ.bind(null, faq.id)}>
                <button type="submit" className="p-1.5 text-ink/30 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
          {faqs.length === 0 && <p className="text-center text-ink/40 py-6 text-sm">Todavía no hay preguntas cargadas.</p>}
        </div>
        <form action={createFAQ} className="rounded-xl border border-dashed border-cocoa/20 p-4 space-y-3">
          <input name="question" placeholder="Pregunta" className="input" required />
          <textarea name="answer" placeholder="Respuesta" rows={2} className="input resize-none" required />
          <div className="flex gap-3">
            <select name="section" className="input w-auto">
              <option value="general">General</option>
              <option value="pedidos">Pedidos</option>
              <option value="cursos">Cursos</option>
              <option value="recetarios">Recetarios</option>
            </select>
            <button type="submit" className="rounded-full border border-cocoa/20 px-4 py-2 text-sm text-cocoa">
              Agregar pregunta
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-cocoa mb-4">Opiniones de clientes</h2>
        <p className="text-xs text-ink/40 mb-4">
          Las opiniones nuevas quedan ocultas hasta que las publiques, para no mostrar nada sin tu revisión.
        </p>
        <div className="rounded-2xl border border-cocoa/10 bg-cream divide-y divide-cocoa/10 mb-5">
          {testimonials.map((t) => (
            <div key={t.id} className="flex items-start gap-3 px-5 py-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-cocoa">
                  {t.customerName} {t.isVerified && <span className="text-xs text-blush-deep">· Verificado</span>}
                </p>
                <p className="text-sm text-ink/60 mt-1">{t.content}</p>
              </div>
              <form action={toggleTestimonialPublished.bind(null, t.id, !t.isPublished)}>
                <button type="submit" className={`p-1.5 rounded-full ${t.isPublished ? "text-[#3F6B3A]" : "text-ink/30"}`} title={t.isPublished ? "Publicada" : "Oculta"}>
                  {t.isPublished ? <Check className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                </button>
              </form>
              <form action={deleteTestimonial.bind(null, t.id)}>
                <button type="submit" className="p-1.5 text-ink/30 hover:text-red-600">
                  <X className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
          {testimonials.length === 0 && <p className="text-center text-ink/40 py-6 text-sm">Todavía no hay opiniones cargadas.</p>}
        </div>
        <form action={createTestimonial} className="rounded-xl border border-dashed border-cocoa/20 p-4 space-y-3">
          <input name="customerName" placeholder="Nombre del cliente" className="input" required />
          <textarea name="content" placeholder="Qué dijo el cliente" rows={2} className="input resize-none" required />
          <div className="flex items-center gap-4">
            <select name="rating" className="input w-auto">
              <option value="">Sin calificación</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} estrellas
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-ink/60">
              <input type="checkbox" name="isVerified" className="h-4 w-4" /> Es una opinión verificada
            </label>
          </div>
          <button type="submit" className="rounded-full border border-cocoa/20 px-4 py-2 text-sm text-cocoa">
            Agregar opinión
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-cocoa mb-4">Galería</h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mb-5">
          {galleryImages.map((img) => (
            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden group">
              <Image src={img.url} alt={img.alt ?? ""} fill sizes="(min-width: 640px) 16vw, 25vw" className="object-cover" />
              <form action={deleteGalleryImage.bind(null, img.id)} className="absolute top-1 right-1">
                <button type="submit" className="rounded-full bg-cocoa/80 text-cream p-1 opacity-0 group-hover:opacity-100">
                  <X className="h-3 w-3" />
                </button>
              </form>
            </div>
          ))}
        </div>
        <form action={uploadGalleryImage} className="flex flex-wrap gap-3 items-center">
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required className="text-sm" />
          <select name="category" className="input w-auto">
            <option value="tortas">Tortas</option>
            <option value="boxes">Boxes</option>
            <option value="eventos">Eventos</option>
            <option value="mesas-dulces">Mesas dulces</option>
          </select>
          <button type="submit" className="rounded-full border border-cocoa/20 px-4 py-2 text-sm text-cocoa">
            Subir imagen
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl text-cocoa mb-4">Páginas legales</h2>
        <div className="space-y-3">
          {legalPages.map((page) => (
            <details key={page.slug} className="rounded-xl border border-cocoa/10 bg-cream p-4">
              <summary className="text-sm font-medium text-cocoa cursor-pointer">{page.title}</summary>
              <form action={updateLegalPage.bind(null, page.slug)} className="space-y-3 mt-4">
                <input name="title" defaultValue={page.title} className="input" required />
                <textarea name="content" defaultValue={page.content} rows={6} className="input resize-none" required />
                <label className="flex items-center gap-2 text-sm text-ink/60">
                  <input type="checkbox" name="needsReview" defaultChecked={page.needsReview} className="h-4 w-4" />
                  Mostrar aviso de &quot;pendiente de revisión&quot;
                </label>
                <button type="submit" className="rounded-full bg-cocoa text-cream px-5 py-2 text-sm">
                  Guardar
                </button>
              </form>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
