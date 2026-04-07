/** Portada para tarjetas y modal; usa URL en `imagen` (primera de `imagenes` en BD). */
export function proyectoCoverUrl(p) {
  const u = p?.imagen && String(p.imagen).trim()
  if (u) return u
  const id = p?.id != null ? p.id : 'x'
  return `https://picsum.photos/seed/fccfyd-proy-${id}/480/320`
}
