/** Mapea fila `docentes` al shape que usa la UI (nombre, rol, disciplina). */
export function docenteRowToIntegranteUi(d) {
  const grado = d.grado_academico && d.grado_academico !== '—' ? `${d.grado_academico} ` : ''
  const nombre = `${grado}${d.nombres || ''} ${d.apellidos || ''}`.trim()
  return {
    id: d.id,
    nombre: nombre || 'Sin nombre',
    rol: d.cargo || 'Cuerpo académico',
    disciplina: d.area_trabajo || d.descripcion_breve || 'FCCFyD',
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
