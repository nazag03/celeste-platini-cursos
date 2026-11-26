import { randomUUID } from "crypto";
import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";


export const isStorageConfigured = Boolean(process.env.CLOUDINARY_URL);

const ROOT_FOLDER = "celeste-platini";

function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
  if (!isStorageConfigured) {
    throw new Error("Falta configurar CLOUDINARY_URL para poder subir archivos.");
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) reject(error ?? new Error("Cloudinary no devolvió resultado."));
      else resolve(result);
    });
    stream.end(buffer);
  });
}


export async function uploadPublicImage(buffer: Buffer, folder: string): Promise<string> {
  const result = await uploadBuffer(buffer, {
    folder: `${ROOT_FOLDER}/${folder}`,
    resource_type: "image",
  });
  return result.secure_url;
}


function publicIdFromUrl(url: string): string | null {
  const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
  return match ? match[1] : null;
}


export async function deletePublicImage(url: string): Promise<void> {
  if (!isStorageConfigured) return;
  const publicId = publicIdFromUrl(url);
  if (!publicId) return;
  await cloudinary.uploader
    .destroy(publicId, { resource_type: "image" })
    .catch((err) => console.error(`[storage] no se pudo borrar ${publicId}:`, err));
}


export async function uploadPrivateFile(buffer: Buffer, folder: string, extension: string): Promise<string> {
  const result = await uploadBuffer(buffer, {
    folder: `${ROOT_FOLDER}/${folder}`,
    public_id: `${randomUUID()}.${extension}`,
    resource_type: "raw",
    type: "private",
  });
  return result.public_id;
}


export function getPrivateFileDownloadUrl(publicId: string, expiresInSeconds = 300): string {
  return cloudinary.utils.private_download_url(publicId, "", {
    resource_type: "raw",
    type: "private",
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
  });
}
