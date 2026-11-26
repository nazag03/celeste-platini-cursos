
export type MaterialLink = { label: string; url: string };


export function readMaterialLinks(value: unknown): MaterialLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is { label?: unknown; url: unknown } => typeof v === "object" && v !== null && "url" in v)
    .filter((v) => typeof v.url === "string" && v.url)
    .map((v) => ({ label: typeof v.label === "string" ? v.label.trim() : "", url: v.url as string }));
}


export function materialLinkLabel(link: MaterialLink, index: number, total: number): string {
  if (link.label) return link.label;
  if (total === 1) return "Abrir en Google Drive";
  if (/drive\.google\.com\/drive\/(u\/\d+\/)?folders\//.test(link.url)) return `Abrir carpeta ${index + 1}`;
  return `Abrir material ${index + 1}`;
}

const LINK_PATTERN = /(?:https?:\/\/|www\.|drive\.google\.com\/|docs\.google\.com\/)[^\s<>"']+/gi;


export function findLinks(text: string): string[] {
  const found: string[] = [];
  
  const spaced = text.replace(/(\S)(https?:\/\/)/gi, "$1 $2");
  for (const match of spaced.match(LINK_PATTERN) ?? []) {
    const raw = match.replace(/[.,;)\]]+$/, "");
    try {
      const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
      if (url.hostname.includes(".")) {
        url.protocol = "https:";
        if (!found.includes(url.toString())) found.push(url.toString());
      }
    } catch {
      
    }
  }
  return found;
}


export function buildMaterialLinks(rows: { label: string; url: string }[]): {
  links: MaterialLink[];
  rejected: string[];
} {
  const links: MaterialLink[] = [];
  const rejected: string[] = [];
  for (const row of rows) {
    const label = row.label.trim();
    const urlText = row.url.trim();
    if (!label && !urlText) continue;

    let urls = findLinks(urlText);
    let name = label;
    if (urls.length === 0) {
      
      urls = findLinks(label);
      name = findLinks(urlText).length === 0 ? urlText : "";
    } else if (findLinks(label).length > 0) {
      name = "";
    }

    if (urls.length === 0) {
      if (urlText) rejected.push(urlText);
      continue;
    }
    
    if (!name) name = urlText.replace(LINK_PATTERN, "").replace(/[\s:–—-]+$/g, "").replace(/^[\s:–—-]+/g, "").trim();
    urls.forEach((url, i) => links.push({ label: urls.length > 1 && name ? `${name} ${i + 1}` : name, url }));
  }
  return { links, rejected };
}
