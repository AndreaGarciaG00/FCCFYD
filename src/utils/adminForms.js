/** Formularios iniciales para el panel admin (alineados al esquema Supabase). */

export function emptyFormDocente() {
  return {
    nombres: '',
    apellidos: '',
    grado_academico: '',
    slug: '',
    correo: '',
    cargo: '',
    area_trabajo: '',
    descripcion_breve: '',
    telefono: '',
    ubicacion_fisica: '',
    orden: 0,
    foto_url: '',
    foto_path: '',
    cv_url: '',
    cv_path: '',
    redes_sociales_json: '{}',
    datos_adicionales_json: '{}',
  }
}

export function docenteRowToForm(d) {
  return {
    nombres: d.nombres || '',
    apellidos: d.apellidos || '',
    grado_academico: d.grado_academico || '',
    slug: d.slug || '',
    correo: d.correo || '',
    cargo: d.cargo || '',
    area_trabajo: d.area_trabajo || '',
    descripcion_breve: d.descripcion_breve || '',
    telefono: d.telefono || '',
    ubicacion_fisica: d.ubicacion_fisica || '',
    orden: d.orden ?? 0,
    foto_url: d.foto_url || '',
    foto_path: d.foto_path || '',
    cv_url: d.cv_url || '',
    cv_path: d.cv_path || '',
    redes_sociales_json: JSON.stringify(d.redes_sociales || {}, null, 2),
    datos_adicionales_json: JSON.stringify(d.datos_adicionales || {}, null, 2),
  }
}

export function emptyFormInscripcion() {
  return {
    titulo: '',
    descripcion: '',
    file_url: '',
    file_path: '',
    file_size: '',
    orden: 0,
    es_descargable: true,
    es_visible: true,
    datos_adicionales_json: '{}',
  }
}

export function inscripcionRowToForm(row) {
  return {
    titulo: row.titulo || '',
    descripcion: row.descripcion || '',
    file_url: row.file_url || '',
    file_path: row.file_path || '',
    file_size: row.file_size || '',
    orden: row.orden ?? 0,
    es_descargable: row.es_descargable !== false,
    es_visible: row.es_visible !== false,
    datos_adicionales_json: JSON.stringify(row.datos_adicionales || {}, null, 2),
  }
}

export function emptyFormPerfil() {
  return {
    nombres: '',
    apellidos: '',
    matricula: '',
    rol: 'alumno',
    email_capsula: '',
    avatar_url: '',
    avatar_path: '',
    datos_adicionales_json: '{}',
  }
}

export function perfilRowToForm(p) {
  return {
    nombres: p.nombres || '',
    apellidos: p.apellidos || '',
    matricula: p.matricula || '',
    rol: p.rol || 'alumno',
    email_capsula: p.email_capsula || '',
    avatar_url: p.avatar_url || '',
    avatar_path: p.avatar_path || '',
    datos_adicionales_json: JSON.stringify(p.datos_adicionales || {}, null, 2),
  }
}

const DEFAULT_CONFIG_UI = {
  mostrar_links: true,
  mostrar_galeria: true,
  mostrar_adjuntos: true,
}

export function emptyFormPublicacion() {
  return {
    tipo: 'Noticia',
    slug: '',
    titulo: '',
    cuerpo_texto: '',
    galeria_json: '[]',
    adjuntos_json: '[]',
    links_json: '{}',
    datos_adicionales_json: '{}',
    config_ui_json: JSON.stringify(DEFAULT_CONFIG_UI, null, 2),
    fecha_publicacion: new Date().toISOString().slice(0, 16),
  }
}

/** En BD: galeria ≈ imágenes; adjuntos, links, datos_adicionales, config_ui como en schema.sql */
export function publicacionRowToForm(row) {
  const fp = row.fecha_publicacion
  const fecha =
    fp && typeof fp === 'string'
      ? fp.slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  return {
    tipo: row.tipo || 'Noticia',
    slug: row.slug || '',
    titulo: row.titulo || '',
    cuerpo_texto: row.cuerpo_texto || '',
    galeria_json: JSON.stringify(row.galeria ?? [], null, 2),
    adjuntos_json: JSON.stringify(row.adjuntos ?? [], null, 2),
    links_json: JSON.stringify(row.links ?? {}, null, 2),
    datos_adicionales_json: JSON.stringify(row.datos_adicionales ?? {}, null, 2),
    config_ui_json: JSON.stringify(row.config_ui ?? DEFAULT_CONFIG_UI, null, 2),
    fecha_publicacion: fecha,
  }
}
