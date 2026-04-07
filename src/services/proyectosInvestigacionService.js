import supabase from '../supabase.js'
import { collectProyectoImagenUrls } from '../utils/proyectoImagenes.js'

function isAdminRole(role) {
  return String(role ?? '')
    .trim()
    .toLowerCase() === 'admin'
}

const ensureAdmin = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('No hay sesion activa.')

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilError) throw perfilError
  if (!isAdminRole(perfil?.rol)) {
    throw new Error('Acceso denegado: solo admin puede gestionar proyectos de investigacion.')
  }
}

function slugify(s) {
  return (
    String(s || '')
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'proyecto'
  )
}

function safeParseJson(str, fallback) {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/** Compat lectura: BD nueva (cuaderno) o columnas antiguas del repo. */
export function normalizeProyectoRow(row) {
  if (!row) return row
  const imagenes = row.imagenes ?? row.galeria
  const imagenes_paths = row.imagenes_paths ?? []
  const visible = row.es_visible ?? row.es_publicado
  return {
    ...row,
    es_visible: visible !== false,
    informacion_general: row.informacion_general ?? row.informacion_institucional ?? {},
    contenido_protocolo: row.contenido_protocolo ?? row.contenido_dinamico ?? [],
    imagenes: Array.isArray(imagenes) ? imagenes : [],
    imagenes_paths: Array.isArray(imagenes_paths) ? imagenes_paths : [],
  }
}

export function firstImagenUrlFromRow(row) {
  const n = normalizeProyectoRow(row)
  const imgs = n.imagenes
  if (!Array.isArray(imgs) || !imgs.length) return ''
  const x = imgs[0]
  if (typeof x === 'string') return x.trim()
  if (x && typeof x === 'object' && typeof x.url === 'string') return x.url.trim()
  return ''
}

export function mapProyectoRowToUi(row) {
  const r = normalizeProyectoRow(row)
  const da = r.datos_adicionales && typeof r.datos_adicionales === 'object' ? r.datos_adicionales : {}
  const vigente = r.estado === 'Vigente' || r.estado === 'En curso'
  const cover = firstImagenUrlFromRow(r) || (typeof da.imagen === 'string' ? da.imagen.trim() : '')
  return {
    id: r.id,
    title: r.titulo,
    slug: r.slug || '',
    cat: da.cat || 'General',
    status: vigente ? 'En curso' : 'Planificación',
    icon: da.icon && ['flask', 'chip', 'leaf', 'book'].includes(da.icon) ? da.icon : 'flask',
    desc: da.desc || r.slug || r.investigador_responsable || '',
    imagen: cover,
    orden: r.orden ?? 0,
    esVisible: r.es_visible !== false,
    esPublicado: r.es_visible !== false,
  }
}

/** Datos ampliados para el modal público (fila ya normalizada o cruda). */
export function mapProyectoDetalleUi(row) {
  const r = normalizeProyectoRow(row)
  const base = mapProyectoRowToUi(r)
  return {
    ...base,
    investigador_responsable: r.investigador_responsable || '',
    estadoDb: r.estado || '',
    fechas: r.fechas,
    informacion_general: r.informacion_general,
    financiamiento: r.financiamiento,
    colaboradores: r.colaboradores,
    contenido_protocolo: r.contenido_protocolo,
    config_visibilidad: r.config_visibilidad,
    datos_adicionales: r.datos_adicionales,
    imagenes: r.imagenes,
  }
}

export function emptyProyectoAdminForm() {
  return {
    title: '',
    cat: 'General',
    status: 'En curso',
    desc: '',
    imagen: '',
    imagenGaleria: [],
    imagenesPendientes: [],
    investigador_responsable: 'Coordinación de investigación',
    fecha_inicio: '',
    fecha_fin: '',
    informacion_text: '',
    opcionales_text: '',
  }
}

function fechasRowToInputs(fechas) {
  const f = fechas && typeof fechas === 'object' && !Array.isArray(fechas) ? fechas : {}
  const pick = f.inicio ?? f.desde ?? f.start ?? f.fecha_inicio ?? ''
  const pickFin = f.fin ?? f.hasta ?? f.end ?? f.fecha_fin ?? ''
  const toInput = (v) => {
    if (v == null || v === '') return ''
    const s = String(v)
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
    const d = new Date(s)
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
  }
  return { fecha_inicio: toInput(pick), fecha_fin: toInput(pickFin) }
}

function informacionGeneralToText(ig) {
  if (ig == null) return ''
  if (typeof ig === 'string') return ig
  if (typeof ig === 'object' && typeof ig.cuerpo === 'string') return ig.cuerpo
  if (typeof ig === 'object' && typeof ig.texto === 'string') return ig.texto
  try {
    return JSON.stringify(ig, null, 2)
  } catch {
    return ''
  }
}

export function proyectoRowToAdminForm(row) {
  const base = emptyProyectoAdminForm()
  if (!row) return base
  const r = normalizeProyectoRow(row)
  const da = r.datos_adicionales && typeof r.datos_adicionales === 'object' ? r.datos_adicionales : {}
  const vigente = r.estado === 'Vigente' || r.estado === 'En curso'
  const { fecha_inicio, fecha_fin } = fechasRowToInputs(r.fechas)
  const opcionales =
    typeof da.resumen_opcional === 'string'
      ? da.resumen_opcional
      : [fmtLegacyOptional(r.financiamiento), fmtLegacyOptional(r.colaboradores)]
          .filter(Boolean)
          .join('\n\n---\n\n')

  return {
    ...base,
    title: r.titulo || '',
    cat: da.cat || 'General',
    status: vigente ? 'En curso' : 'Planificación',
    desc: da.desc || r.slug || '',
    imagen: firstImagenUrlFromRow(r) || (typeof da.imagen === 'string' ? da.imagen : ''),
    imagenGaleria: collectProyectoImagenUrls(r.imagenes),
    imagenesPendientes: [],
    investigador_responsable: r.investigador_responsable || base.investigador_responsable,
    fecha_inicio,
    fecha_fin,
    informacion_text: informacionGeneralToText(r.informacion_general),
    opcionales_text: opcionales,
  }
}

function fmtLegacyOptional(v) {
  if (v == null) return ''
  if (typeof v === 'string' && v.trim()) return v.trim()
  if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length) {
    try {
      return JSON.stringify(v, null, 2)
    } catch {
      return ''
    }
  }
  if (Array.isArray(v) && v.length) {
    try {
      return JSON.stringify(v, null, 2)
    } catch {
      return ''
    }
  }
  return ''
}

function mergeDatosAdicionales(form, prev) {
  const p = prev ? normalizeProyectoRow(prev) : null
  const seed = p?.datos_adicionales && typeof p.datos_adicionales === 'object' ? p.datos_adicionales : {}
  const da = { ...seed }
  da.cat = form.cat?.trim() || da.cat || 'General'
  da.desc = form.desc?.trim() || da.desc || ''
  const opt = form.opcionales_text?.trim()
  if (opt) da.resumen_opcional = opt
  else if ('resumen_opcional' in da) delete da.resumen_opcional
  return da
}

function mergeImagenesFromPortada(form, prev) {
  const p = prev ? normalizeProyectoRow(prev) : null
  const prevImgs = Array.isArray(p?.imagenes) ? [...p.imagenes] : []

  if (!p) {
    const pend = Array.isArray(form.imagenesPendientes)
      ? form.imagenesPendientes.map((x) => String(x).trim()).filter(Boolean)
      : []
    if (pend.length) return pend
    const cover = form.imagen?.trim()
    return cover ? [cover] : []
  }

  const cover = form.imagen?.trim()
  if (!cover) return prevImgs.length ? prevImgs : []

  const firstNorm = firstImagenUrlFromRow({ imagenes: prevImgs }) || ''
  if (firstNorm === cover && prevImgs.length) return prevImgs

  const rest = prevImgs.length > 1 ? prevImgs.slice(1) : []
  return [cover, ...rest]
}

function mergeImagenesPaths(imgs, prev) {
  const p = prev ? normalizeProyectoRow(prev) : null
  let paths = Array.isArray(p?.imagenes_paths) ? [...p.imagenes_paths] : []
  while (paths.length < imgs.length) paths.push(null)
  if (paths.length > imgs.length) paths = paths.slice(0, imgs.length)
  return paths
}

function fechasFromForm(form, prev) {
  const p = prev ? normalizeProyectoRow(prev) : null
  const base = p?.fechas && typeof p.fechas === 'object' && !Array.isArray(p.fechas) ? { ...p.fechas } : {}
  const ini = form.fecha_inicio?.trim()
  const fin = form.fecha_fin?.trim()
  if (ini) base.inicio = ini
  else delete base.inicio
  if (fin) base.fin = fin
  else delete base.fin
  return Object.keys(base).length ? base : {}
}

function adminFormToDbPayload(form, prev) {
  const p = prev ? normalizeProyectoRow(prev) : null
  const imagenes = mergeImagenesFromPortada(form, p)
  const imagenes_paths = mergeImagenesPaths(imagenes, p)

  const infoText = form.informacion_text?.trim() || ''
  const informacion_general = infoText ? { cuerpo: infoText } : {}

  const base = {
    titulo: form.title.trim(),
    investigador_responsable: form.investigador_responsable?.trim() || 'Coordinación de investigación',
    estado: form.status === 'En curso' ? 'Vigente' : 'Concluido',
    fechas: fechasFromForm(form, prev),
    informacion_general,
    financiamiento: p?.financiamiento ?? {},
    colaboradores: p?.colaboradores ?? [],
    contenido_protocolo: p?.contenido_protocolo ?? [],
    config_visibilidad: p?.config_visibilidad ?? {},
    imagenes,
    imagenes_paths,
    datos_adicionales: mergeDatosAdicionales(form, p),
    es_visible: true,
    orden: Number(p?.orden) || 0,
  }

  const descSlug = slugify(form.desc?.trim() || '')
  const slug =
    descSlug ||
    (p?.slug && String(p.slug).trim()) ||
    `${slugify(form.title.trim())}-${Date.now().toString(36)}`

  return { ...base, slug }
}

function adminFormToInsertRow(form) {
  return adminFormToDbPayload(form, null)
}

function adminFormToUpdateRow(form, prev) {
  return adminFormToDbPayload(form, prev)
}

/** Columnas como en schema.sql (informacion_general, contenido_protocolo, imagenes, es_visible, …). */
function toSupabaseRow(payload) {
  return {
    slug: payload.slug,
    titulo: payload.titulo,
    investigador_responsable: payload.investigador_responsable,
    estado: payload.estado,
    fechas: payload.fechas,
    informacion_general: payload.informacion_general,
    financiamiento: payload.financiamiento,
    colaboradores: payload.colaboradores,
    contenido_protocolo: payload.contenido_protocolo,
    config_visibilidad: payload.config_visibilidad,
    imagenes: payload.imagenes,
    imagenes_paths: payload.imagenes_paths,
    datos_adicionales: payload.datos_adicionales,
    es_visible: payload.es_visible,
    orden: payload.orden,
  }
}

/** Esquema previo al rename (ver supabase/migrations/20260331120000_proyectos_investigacion_columnas.sql). */
function toSupabaseRowLegacy(payload) {
  return {
    slug: payload.slug,
    titulo: payload.titulo,
    investigador_responsable: payload.investigador_responsable,
    estado: payload.estado,
    fechas: payload.fechas,
    informacion_institucional: payload.informacion_general,
    financiamiento: payload.financiamiento,
    colaboradores: payload.colaboradores,
    contenido_dinamico: payload.contenido_protocolo,
    config_visibilidad: payload.config_visibilidad,
    galeria: payload.imagenes,
    datos_adicionales: payload.datos_adicionales,
    es_publicado: payload.es_visible,
    orden: payload.orden,
  }
}

function withoutImagenesPaths(row) {
  const { imagenes_paths: _p, ...rest } = row
  return rest
}

function isSchemaOrColumnError(error) {
  if (!error) return false
  if (error.code === 'PGRST204') return true
  const s = `${error.message || ''} ${error.details || ''} ${String(error.hint || '')}`.toLowerCase()
  return (
    s.includes('schema cache') ||
    s.includes('could not find') ||
    (s.includes('column') && (s.includes('does not exist') || s.includes('not exist')))
  )
}

/** No tiene sentido reintentar con otro mapa de columnas (p. ej. mismo slug duplicado o RLS). */
function isNonRetriableDbError(error) {
  if (!error) return false
  const code = String(error.code || '')
  if (code === '23505') return true
  if (code === 'PGRST116') return true
  const s = `${error.message || ''} ${error.details || ''}`.toLowerCase()
  if (s.includes('row-level security') || s.includes('violates row-level security')) return true
  if (s.includes('permission denied') && s.includes('policy')) return true
  return false
}

function formatSupabaseError(error) {
  if (!error) return new Error('Error al guardar en la base de datos.')
  const parts = [error.code, error.message, error.details, error.hint].filter(Boolean)
  const msg = parts.length ? parts.join(' — ') : 'Error al guardar en la base de datos.'
  const err = new Error(msg)
  err.cause = error
  return err
}

/** Tabla antigua sin config_visibilidad (o sin imagenes_paths). */
function toSupabaseRowLegacyMinimal(payload) {
  return {
    slug: payload.slug,
    titulo: payload.titulo,
    investigador_responsable: payload.investigador_responsable,
    estado: payload.estado,
    fechas: payload.fechas,
    informacion_institucional: payload.informacion_general,
    financiamiento: payload.financiamiento,
    colaboradores: payload.colaboradores,
    contenido_dinamico: payload.contenido_protocolo,
    galeria: payload.imagenes,
    datos_adicionales: payload.datos_adicionales,
    es_publicado: payload.es_visible,
    orden: payload.orden,
  }
}

function withoutConfigVisibilidad(row) {
  const { config_visibilidad: _cv, ...rest } = row
  return rest
}

async function insertProyectoCompat(payload) {
  const builders = [
    () => toSupabaseRow(payload),
    () => withoutImagenesPaths(toSupabaseRow(payload)),
    () => withoutConfigVisibilidad(withoutImagenesPaths(toSupabaseRow(payload))),
    () => toSupabaseRowLegacy(payload),
    () => toSupabaseRowLegacyMinimal(payload),
  ]
  let lastError = null
  for (const build of builders) {
    const row = build()
    const { data, error } = await supabase.from('proyectos_investigacion').insert([row]).select('*').single()
    if (!error) return data
    lastError = error
    if (isNonRetriableDbError(error)) throw formatSupabaseError(error)
  }
  throw formatSupabaseError(lastError)
}

async function updateProyectoCompat(id, payload) {
  const builders = [
    () => toSupabaseRow(payload),
    () => withoutImagenesPaths(toSupabaseRow(payload)),
    () => withoutConfigVisibilidad(withoutImagenesPaths(toSupabaseRow(payload))),
    () => toSupabaseRowLegacy(payload),
    () => toSupabaseRowLegacyMinimal(payload),
  ]
  let lastError = null
  for (const build of builders) {
    const row = build()
    const { data, error } = await supabase.from('proyectos_investigacion').update(row).eq('id', id).select('*').single()
    if (!error) return data
    lastError = error
    if (isNonRetriableDbError(error)) throw formatSupabaseError(error)
  }
  throw formatSupabaseError(lastError)
}

async function persistProyectoImagenes(id, imagenes, imagenes_paths) {
  let uerr = (
    await supabase.from('proyectos_investigacion').update({ imagenes, imagenes_paths }).eq('id', id)
  ).error
  if (!uerr) return
  if (isSchemaOrColumnError(uerr)) {
    uerr = (await supabase.from('proyectos_investigacion').update({ imagenes }).eq('id', id)).error
  }
  if (!uerr) return
  if (isSchemaOrColumnError(uerr)) {
    uerr = (await supabase.from('proyectos_investigacion').update({ galeria: imagenes }).eq('id', id)).error
  }
  if (uerr) throw formatSupabaseError(uerr)
}

export const proyectosInvestigacionService = {
  listarParaSitio: async () => {
    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .select('*')
      .order('orden', { ascending: true })

    if (error) throw error
    const rows = data ?? []
    return rows
      .filter((r) => {
        const n = normalizeProyectoRow(r)
        return n.es_visible !== false
      })
      .map(mapProyectoRowToUi)
  },

  /** Detalle público por id (respeta visibilidad). */
  obtenerPublicoPorId: async (id) => {
    const { data, error } = await supabase.from('proyectos_investigacion').select('*').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) throw new Error('Proyecto no encontrado.')
    const n = normalizeProyectoRow(data)
    if (n.es_visible === false) throw new Error('Proyecto no disponible.')
    return data
  },

  listarTodosAdmin: async () => {
    await ensureAdmin()
    const { data, error } = await supabase.from('proyectos_investigacion').select('*').order('orden', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapProyectoRowToUi)
  },

  obtenerFilaAdmin: async (id) => {
    await ensureAdmin()
    const { data, error } = await supabase.from('proyectos_investigacion').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  crearAdmin: async (form) => {
    await ensureAdmin()
    const payload = adminFormToInsertRow(form)
    const data = await insertProyectoCompat(payload)
    return mapProyectoRowToUi(data)
  },

  actualizarAdmin: async (id, form) => {
    await ensureAdmin()
    const { data: prev, error: prevErr } = await supabase.from('proyectos_investigacion').select('*').eq('id', id).single()

    if (prevErr) throw formatSupabaseError(prevErr)

    const payload = adminFormToUpdateRow(form, prev)
    const data = await updateProyectoCompat(id, payload)
    return mapProyectoRowToUi(data)
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('proyectos_investigacion').delete().eq('id', id)
    if (error) throw error
  },

  /** Reemplaza solo la primera imagen (portada); el resto de la galería se mantiene. */
  setPortadaDesdeStorage: async (id, publicUrl, storagePath) => {
    await ensureAdmin()
    const { data: prev, error } = await supabase.from('proyectos_investigacion').select('*').eq('id', id).single()
    if (error) throw formatSupabaseError(error)
    const r = normalizeProyectoRow(prev)
    const imgs = Array.isArray(r.imagenes) ? [...r.imagenes] : []
    const pths = Array.isArray(r.imagenes_paths) ? [...r.imagenes_paths] : []
    const restI = imgs.length > 1 ? imgs.slice(1) : []
    const restP = pths.length > 1 ? pths.slice(1) : []
    const nextImgs = [publicUrl, ...restI]
    const nextPths = [storagePath, ...restP]
    await persistProyectoImagenes(id, nextImgs, nextPths)
  },

  /** Añade una imagen al final de la galería (no reemplaza la portada). */
  agregarImagenDesdeStorage: async (id, publicUrl, storagePath) => {
    await ensureAdmin()
    const { data: prev, error } = await supabase.from('proyectos_investigacion').select('*').eq('id', id).single()
    if (error) throw formatSupabaseError(error)
    const r = normalizeProyectoRow(prev)
    const imgs = Array.isArray(r.imagenes) ? [...r.imagenes] : []
    const pths = Array.isArray(r.imagenes_paths) ? [...r.imagenes_paths] : []
    imgs.push(publicUrl)
    pths.push(storagePath)
    while (pths.length < imgs.length) pths.push(null)
    if (pths.length > imgs.length) pths.length = imgs.length
    await persistProyectoImagenes(id, imgs, pths)
  },
}
