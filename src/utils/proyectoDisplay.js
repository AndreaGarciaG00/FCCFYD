/** Portada para tarjetas y modal; usa URL guardada o imagen de respaldo por id. */
export function proyectoCoverUrl(p) {
  const u = p?.imagen && String(p.imagen).trim()
  if (u) return u
  return `https://picsum.photos/seed/fccfyd-proy-${p.id}/480/320`
}
