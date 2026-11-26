"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export function AutoRefresh({ everyMs = 4000, maxTimes = 30 }: { everyMs?: number; maxTimes?: number }) {
  const router = useRouter();
  useEffect(() => {
    let times = 0;
    const id = setInterval(() => {
      times += 1;
      router.refresh();
      if (times >= maxTimes) clearInterval(id);
    }, everyMs);
    return () => clearInterval(id);
  }, [router, everyMs, maxTimes]);
  return null;
}
