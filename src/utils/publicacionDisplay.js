const DEFAULT_IMG = 'https://picsum.photos/seed/fccfyd-pub/320/200'

function firstImageFromGaleria(galeria) {
  if (!Array.isArray(galeria)) return ''
  for (const g of galeria) {
    if (g && typeof g === 'object' && typeof g.imagen_url === 'string' && g.imagen_url.trim()) {
      return g.imagen_url.trim()
    }
  }
  return ''
}

/** Texto para badge en UI pública (valor BD sigue siendo Evento / Noticia). */
export function tipoPublicacionLabel(tipo) {
  if (tipo === 'Evento') return 'Publicación'
  if (tipo === 'Noticia') return 'Noticia'
  return String(tipo || '—')
}

export function formatoFechaCorta(fechaIso) {
  if (!fechaIso) return '—'
  const s = String(fechaIso).slice(0, 10)
  return new Date(`${s}T12:00:00`).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function metaUnaLinea(hora, lugar) {
  const h = String(hora || '').trim()
  const l = String(lugar || '').trim()
  if (h && l) return `${h} · ${l}`
  return h || l || '—'
}

/** Tarjeta para lista pública (compatibilidad con UI tipo Eventos). */
export function publicacionRowToCard(row) {
  const da = row.datos_adicionales && typeof row.datos_adicionales === 'object' ? row.datos_adicionales : {}
  const fechaISO = row.fecha_publicacion ? String(row.fecha_publicacion).slice(0, 10) : ''
  const snippet = String(row.cuerpo_texto || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200)
  const imagen = firstImageFromGaleria(row.galeria) || DEFAULT_IMG

  let meta = '—'
  if (row.tipo === 'Evento') {
    meta = metaUnaLinea(da.hora, da.ubicacion || da.lugar)
  } else {
    const parts = [da.autor, da.fuente].filter((x) => typeof x === 'string' && x.trim())
    meta = parts.length ? parts.join(' · ') : '—'
  }

  return {
    id: row.id,
    row,
    titulo: row.titulo,
    badge: tipoPublicacionLabel(row.tipo),
    fechaISO,
    fechaCorta: formatoFechaCorta(fechaISO),
    hora: da.hora || '',
    lugar: da.ubicacion || da.lugar || '',
    resumen: snippet,
    imagen,
    metaLinea: meta,
  }
}

export function firstImageFromPublicacionRow(row) {
  return firstImageFromGaleria(row?.galeria) || DEFAULT_IMG
}
