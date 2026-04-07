import { fixPublicStorageUrl } from '../services/storageService.js'

/** URLs públicas de la galería `imagenes` (strings u objetos `{ url }`). */
export function collectProyectoImagenUrls(imagenes, fixUrl = fixPublicStorageUrl) {
  if (!Array.isArray(imagenes)) return []
  const out = []
  for (const x of imagenes) {
    let u = ''
    if (typeof x === 'string') u = x.trim()
    else if (x && typeof x === 'object' && typeof x.url === 'string') u = x.url.trim()
    if (!u) continue
    const fixed = typeof fixUrl === 'function' ? fixUrl(u) : u
    if (fixed) out.push(fixed)
  }
  return out
}
