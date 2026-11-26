import { CheckCircle2, AlertTriangle } from "lucide-react";


export function SaveNotice({ guardado, error, detalle }: { guardado?: string; error?: string; detalle?: string }) {
  if (error === "portada") {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        Se guardó todo menos alguna foto de portada: no se pudo subir. Probá con otra foto (JPG, PNG o WEBP) y volvé a guardar.
      </p>
    );
  }
  if (error === "drive" && detalle) {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <span>
          Se guardó todo, pero esto no es un link y no se guardó: <strong className="break-all">&quot;{detalle}&quot;</strong>.
          En la casilla <strong>Link</strong> tiene que ir el link de Drive (Compartir → Copiar enlace); el nombre va en la
          casilla <strong>Nombre del botón</strong>.
        </span>
      </p>
    );
  }
  if (error === "drive") {
    return (
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm px-4 py-3 mb-6">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        Se guardó todo menos los links de Google Drive: alguno de los que pegaste no parece un link válido. Copialo de nuevo desde Drive
        (Compartir → Copiar enlace) y volvé a guardar.
      </p>
    );
  }
  if (guardado) {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 mb-6">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> Cambios guardados.
      </p>
    );
  }
  return null;
}
