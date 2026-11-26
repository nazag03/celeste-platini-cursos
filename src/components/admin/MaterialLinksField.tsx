"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink, Plus, X } from "lucide-react";
import { findLinks, type MaterialLink } from "@/lib/material-links";


export function MaterialLinksField({ initialLinks }: { initialLinks: MaterialLink[] }) {
  const [rows, setRows] = useState(() =>
    (initialLinks.length > 0 ? initialLinks : [{ label: "", url: "" }]).map((link, i) => ({ ...link, key: i })),
  );
  const [nextKey, setNextKey] = useState(rows.length);

  const update = (key: number, field: "label" | "url", value: string) =>
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, [field]: value } : r)));

  const add = () => {
    setRows((rs) => [...rs, { label: "", url: "", key: nextKey }]);
    setNextKey((k) => k + 1);
  };

  const remove = (key: number) =>
    setRows((rs) => (rs.length === 1 ? [{ label: "", url: "", key: rs[0].key }] : rs.filter((r) => r.key !== key)));

  return (
    <div className="space-y-3">
      <div className="hidden sm:grid grid-cols-[12rem_minmax(0,1fr)_2.25rem] gap-2 text-xs font-medium text-ink/50">
        <span>Nombre del botón (opcional)</span>
        <span>Link de Google Drive</span>
        <span />
      </div>
      {rows.map((row, i) => {
        const found = findLinks(row.url);
        const notALink = row.url.trim() !== "" && found.length === 0;
        return (
          <div key={row.key} className="rounded-xl sm:rounded-none bg-cream/60 sm:bg-transparent p-3 sm:p-0">
            <div className="grid grid-cols-1 sm:grid-cols-[12rem_minmax(0,1fr)_2.25rem] gap-2 sm:items-center">
              <label className="sm:hidden text-xs font-medium text-ink/50">Nombre del botón (opcional)</label>
              <input
                name="linkLabel"
                value={row.label}
                onChange={(e) => update(row.key, "label", e.target.value)}
                placeholder={i === 0 ? "Ej: Video" : "Ej: PDF"}
                className="input"
                aria-label={`Nombre del botón ${i + 1}`}
              />
              <label className="sm:hidden text-xs font-medium text-ink/50 mt-1">Link de Google Drive</label>
              <input
                type="text"
                inputMode="url"
                name="linkUrl"
                value={row.url}
                onChange={(e) => update(row.key, "url", e.target.value)}
                placeholder="Pegá acá el link: https://drive.google.com/..."
                className={`input ${notALink ? "!border-amber-400" : ""}`}
                aria-label={`Link ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => remove(row.key)}
                className="justify-self-end sm:justify-self-auto grid place-items-center h-9 w-9 rounded-full text-ink/40 hover:text-red-600 hover:bg-red-50"
                aria-label={`Quitar link ${i + 1}`}
                title="Quitar este link"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="sm:ml-[12.5rem] mt-1.5 text-xs">
              {notALink ? (
                <p className="text-amber-700">
                  Esto no parece un link. Pegá acá el link de Drive; el nombre va en la casilla de la izquierda.
                </p>
              ) : found.length > 0 ? (
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-green-700">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Link cargado
                  </span>
                  <a
                    href={found[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cocoa underline underline-offset-2"
                  >
                    Probar link <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              ) : (
                <p className="text-ink/40">Sin link todavía.</p>
              )}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 rounded-full border border-cocoa/20 px-4 py-2 text-sm text-cocoa hover:bg-cocoa/5"
      >
        <Plus className="h-4 w-4" /> Agregar otro link
      </button>
    </div>
  );
}
