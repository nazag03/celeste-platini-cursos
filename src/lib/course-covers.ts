
export const MAX_COVER_IMAGES = 8;


export function readCoverImages(course: { coverImages?: unknown; coverImageUrl?: string | null }): string[] {
  const list = Array.isArray(course.coverImages)
    ? course.coverImages.filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];
  if (list.length > 0) return list;
  return course.coverImageUrl ? [course.coverImageUrl] : [];
}
