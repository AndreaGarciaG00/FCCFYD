/** Correos generados solo para cumplir el esquema; no mostrar como contacto. */
export function esCorreoDocentePlaceholder(correo) {
  return String(correo || '').includes('@placeholder.fccfyd.local')
}

const REDES_LABEL = {
  linkedin: 'LinkedIn',
  twitter: 'X / Twitter',
  facebook: 'Facebook',
  instagram: 'Instagram',
  github: 'GitHub',
}

/** URLs de redes en `docentes.redes_sociales` (solo http/https). */
export function integranteRedesEntries(redes) {
  if (!redes || typeof redes !== 'object') return []
  return Object.entries(redes)
    .filter(([, url]) => typeof url === 'string' && url.trim().startsWith('http'))
    .map(([key, url]) => ({
      key,
      url: url.trim(),
      label: REDES_LABEL[key] || key.charAt(0).toUpperCase() + key.slice(1),
    }))
}

/** Mapea fila `docentes` al shape que usa la UI (tarjetas, sidebar y modal). */
export function docenteRowToIntegranteUi(d) {
  const grado = d.grado_academico && d.grado_academico !== '—' ? `${d.grado_academico} ` : ''
  const nombre = `${grado}${d.nombres || ''} ${d.apellidos || ''}`.trim()
  const redes = d.redes_sociales && typeof d.redes_sociales === 'object' ? d.redes_sociales : {}
  return {
    id: d.id,
    nombre: nombre || 'Sin nombre',
    rol: d.cargo || 'Cuerpo académico',
    disciplina: d.area_trabajo || 'CIMOHU · FCCFyD',
    foto_url: d.foto_url || null,
    correo: d.correo || '',
    telefono: d.telefono || '',
    ubicacion_fisica: d.ubicacion_fisica || '',
    descripcion_breve: d.descripcion_breve || '',
    cv_url: d.cv_url || null,
    redes_sociales: redes,
    slug: d.slug || '',
  }
}

export function splitNombreCompleto(full) {
  const t = String(full || '').trim()
  if (!t) return { nombres: '', apellidos: '—' }
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return { nombres: parts[0], apellidos: '—' }
  return { nombres: parts.slice(0, -1).join(' '), apellidos: parts[parts.length - 1] }
}

export function slugifyDocenteKey(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || 'docente'
}

export function syntheticDocenteCorreo() {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
      : String(Date.now())
  return `docente.${id}@placeholder.fccfyd.local`
}
