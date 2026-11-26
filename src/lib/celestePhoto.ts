import fs from "node:fs";
import path from "node:path";


export function getCelestePhotoUrl(): string | null {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", "images", `celeste.${ext}`))) {
      return `/images/celeste.${ext}`;
    }
  }
  return null;
}
