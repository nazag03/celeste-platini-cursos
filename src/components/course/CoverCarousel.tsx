"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

const INTERVAL_MS = 4500;


export function CoverCarousel({
  images,
  alt,
  sizes,
  className,
  interactive = false,
  priority = false,
}: {
  images: string[];
  alt: string;
  sizes: string;
  className?: string;
  interactive?: boolean;
  priority?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [count, paused]);

  return (
    <div
      className={clsx("absolute inset-0", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={i === 0 ? alt : `${alt} (foto ${i + 1})`}
          fill
          sizes={sizes}
          priority={priority && i === 0}
          aria-hidden={i !== index}
          className={clsx(
            "object-cover transition-opacity duration-1000 ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
        />
      ))}

      {count > 1 && (
        <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
          {images.map((src, i) =>
            interactive ? (
              <button
                key={src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={clsx(
                  "h-2 rounded-full transition-all duration-300 shadow-sm",
                  i === index ? "w-6 bg-cream" : "w-2 bg-cream/60 hover:bg-cream/90",
                )}
              />
            ) : (
              <span
                key={src}
                aria-hidden
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                  i === index ? "w-4 bg-cream" : "w-1.5 bg-cream/60",
                )}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}
