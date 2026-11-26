"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { MAX_COVER_IMAGES } from "@/lib/course-covers";

const MAX_SIDE = 2000;


async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}


type Item = { key: string; preview: string } & ({ kind: "saved"; url: string } | { kind: "new"; file: File });

let nextKey = 0;


export function CoverImageField({ currentUrls }: { currentUrls: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>(() =>
    currentUrls.map((url) => ({ key: `s${nextKey++}`, kind: "saved", url, preview: url })),
  );
  const [busy, setBusy] = useState(false);
  const full = items.length >= MAX_COVER_IMAGES;

  
  useEffect(() => {
    if (!inputRef.current) return;
    const dt = new DataTransfer();
    for (const item of items) if (item.kind === "new") dt.items.add(item.file);
    inputRef.current.files = dt.files;
  }, [items]);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.currentTarget.files ?? []);
    e.currentTarget.value = ""; 
    if (picked.length === 0) return;
    setBusy(true);
    const room = MAX_COVER_IMAGES - items.length;
    const small = await Promise.all(picked.slice(0, Math.max(0, room)).map(shrinkImage));
    setItems((prev) => [
      ...prev,
      ...small.map((file): Item => ({ key: `n${nextKey++}`, kind: "new", file, preview: URL.createObjectURL(file) })),
    ]);
    setBusy(false);
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function move(index: number, delta: number) {
    setItems((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <input key={item.key} type="hidden" name="coverSlot" value={item.kind === "saved" ? item.url : "new"} />
      ))}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <div
            key={item.key}
            className="relative aspect-[4/3] rounded-xl overflow-hidden bg-ivory border border-cocoa/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt={`Portada ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1.5 left-1.5 rounded-full bg-cream/90 px-2 py-0.5 text-[10px] uppercase tracking-wide text-cocoa">
                Principal
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(item.key)}
              aria-label="Quitar foto"
              className="absolute top-1.5 right-1.5 grid place-items-center h-6 w-6 rounded-full bg-cream/90 text-red-600/80 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            {items.length > 1 && (
              <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Mover a la izquierda"
                  className="grid place-items-center h-6 w-6 rounded-full bg-cream/90 text-cocoa disabled:invisible"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === items.length - 1}
                  aria-label="Mover a la derecha"
                  className="grid place-items-center h-6 w-6 rounded-full bg-cream/90 text-cocoa disabled:invisible"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}

        {!full && (
          <label className="relative aspect-[4/3] rounded-xl border border-dashed border-cocoa/25 grid place-items-center cursor-pointer text-cocoa/70 hover:bg-cocoa/5">
            {busy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-xs">
                <ImagePlus className="h-6 w-6" strokeWidth={1.4} />
                {items.length === 0 ? "Elegir fotos" : "Agregar fotos"}
              </span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={onChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      
      <input ref={inputRef} type="file" name="coverImageFile" multiple className="hidden" tabIndex={-1} aria-hidden />

      <p className="text-xs text-ink/50">
        Hasta {MAX_COVER_IMAGES} fotos, JPG, PNG o WEBP. Si ponés más de una, en la web van pasando solas; la primera es la
        principal. Con las flechitas cambiás el orden. Se guarda al tocar &quot;Guardar&quot;.
      </p>
    </div>
  );
}
