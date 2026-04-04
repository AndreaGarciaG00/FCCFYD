import supabase from '../supabase.js'

/**
 * @typedef {Object} ProyectoFechas
 * @property {string} [inicio]
 * @property {string} [fin]
 * @property {string|number} [duracion_meses]
 */

/**
 * @typedef {Object} ProyectoInfoInstitucional
 * @property {string} [red_colaboracion]
 * @property {string} [cuerpo_academico]
 * @property {string} [area_conocimiento]
 * @property {string} [disciplina]
 */

/**
 * @typedef {Object} ProyectoFinanciamiento
 * @property {string} [tipo_financiamiento]
 * @property {string} [fuente_financiamiento]
 * @property {string} [convocatoria_apoyo]
 */

/**
 * @typedef {Object} ProyectoColaborador
 * @property {string} nombre
 * @property {string} [rol]
 * @property {string} [institucion]
 * @property {string|boolean} [es_visible]
 */

/**
 * @typedef {Object} ProyectoContenidoSeccion
 * @property {string} seccion
 * @property {string} [texto]
 * @property {string|boolean} [es_visible]
 */

/**
 * @typedef {Object} ProyectoConfigVisibilidadFechas
 * @property {boolean} [inicio]
 * @property {boolean} [fin]
 * @property {boolean} [duracion_meses]
 */

/**
 * @typedef {Object} ProyectoConfigVisibilidadInstitucional
 * @property {boolean} [red_colaboracion]
 * @property {boolean} [cuerpo_academico]
 * @property {boolean} [area_conocimiento]
 * @property {boolean} [disciplina]
 */

/**
 * @typedef {Object} ProyectoConfigVisibilidadFinanciamiento
 * @property {boolean} [tipo_financiamiento]
 * @property {boolean} [fuente_financiamiento]
 * @property {boolean} [fuente_financiamento]
 * @property {boolean} [convocatoria_apoyo]
 */

/**
 * @typedef {Object} ProyectoConfigVisibilidad
 * @property {boolean} [estado]
 * @property {ProyectoConfigVisibilidadFechas} [fechas]
 * @property {ProyectoConfigVisibilidadInstitucional} [institucional]
 * @property {ProyectoConfigVisibilidadFinanciamiento} [financiamiento]
 */

/**
 * @typedef {Object} ProyectoGaleriaItem
 * @property {string} [imagen_url]
 * @property {string} [imagen_path]
 * @property {string} [descripcion]
 * @property {string|boolean} [es_visible]
 */

/**
 * Payload para crear un proyecto de investigacion (admin).
 * @typedef {Object} ProyectoInvestigacionNuevo
 * @property {string} titulo
 * @property {string} investigador_responsable
 * @property {'Vigente'|'Concluido'} estado
 * @property {ProyectoFechas} fechas
 * @property {ProyectoInfoInstitucional} [informacion_institucional]
 * @property {ProyectoFinanciamiento} [financiamiento]
 * @property {ProyectoColaborador[]} [colaboradores]
 * @property {ProyectoContenidoSeccion[]} [contenido_dinamico]
 * @property {ProyectoConfigVisibilidad} [config_visibilidad]
 * @property {Record<string, any>} [datos_adicionales]
 * @property {ProyectoGaleriaItem[]} [galeria]
 * @property {boolean} [es_publicado]
 * @property {number} [orden]
 */

/**
 * Campos editables de un proyecto (PATCH parcial). No incluye slug ni busqueda_vector.
 * @typedef {Object} ProyectoInvestigacionEdicion
 * @property {string} [titulo]
 * @property {string} [investigador_responsable]
 * @property {'Vigente'|'Concluido'} [estado]
 * @property {ProyectoFechas} [fechas]
 * @property {ProyectoInfoInstitucional} [informacion_institucional]
 * @property {ProyectoFinanciamiento} [financiamiento]
 * @property {ProyectoColaborador[]} [colaboradores]
 * @property {ProyectoContenidoSeccion[]} [contenido_dinamico]
 * @property {ProyectoConfigVisibilidad} [config_visibilidad]
 * @property {Record<string, any>} [datos_adicionales]
 * @property {ProyectoGaleriaItem[]} [galeria]
 * @property {boolean} [es_publicado]
 * @property {number} [orden]
 */

/**
 * @typedef {Object} VisibilidadColaboradorPatch
 * @property {number} indice
 * @property {boolean} visible
 */

/**
 * @typedef {Object} VisibilidadContenidoPatch
 * @property {number} [indice]
 * @property {string} [seccion]
 * @property {boolean} visible
 */

/**
 * @typedef {Object} VisibilidadGaleriaPatch
 * @property {number} indice
 * @property {boolean} visible
 */

const PROYECTO_INVESTIGACION_EDITABLE_KEYS = [
  'titulo',
  'investigador_responsable',
  'estado',
  'fechas',
  'informacion_institucional',
  'financiamiento',
  'colaboradores',
  'contenido_dinamico',
  'config_visibilidad',
  'datos_adicionales',
  'galeria',
  'es_publicado',
  'orden'
]

const pickProyectoUpdates = (updates = {}) => {
  const out = {}
  for (const key of PROYECTO_INVESTIGACION_EDITABLE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      out[key] = updates[key]
    }
  }
  return out
}

/**
 * Fusion profunda parcial de config_visibilidad (fechas, institucional, financiamiento, estado, etc.).
 * @param {Record<string, any>} base
 * @param {Record<string, any>} patch
 * @returns {Record<string, any>}
 */
const deepMergeConfigVisibilidad = (base, patch) => {
  const b =
    base && typeof base === 'object' && !Array.isArray(base) ? { ...base } : {}
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) return b

  for (const k of Object.keys(patch)) {
    const pv = patch[k]
    const bv = b[k]
    if (
      pv !== null &&
      typeof pv === 'object' &&
      !Array.isArray(pv) &&
      bv !== null &&
      typeof bv === 'object' &&
      !Array.isArray(bv)
    ) {
      b[k] = deepMergeConfigVisibilidad(bv, pv)
    } else {
      b[k] = pv
    }
  }
  return b
}

/** Formato de ejemplo en BD para es_visible en arreglos. */
const visibilidadAString = (visible) => {
  const v =
    visible === true ||
    visible === 'true' ||
    visible === 1 ||
    visible === '1'
  return v ? 'true' : 'false'
}

const clonarJson = (x) => {
  if (x == null) return x
  return JSON.parse(JSON.stringify(x))
}

/** Bucket Storage para imagenes de galeria (crear en Supabase con este id si aun no existe). */
const BUCKET_PROYECTOS_INVESTIGACION = 'proyectos_investigacion'

const GALERIA_IMG_MAX_BYTES = 5 * 1024 * 1024
const GALERIA_IMG_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])

const galeriaExtFromMime = (mimeType) => {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return null
}

const ESTADOS_VALIDOS = new Set(['Vigente', 'Concluido'])

/** Palabras vacias comunes en titulos (se omiten para acercar el slug al nucleo tematico). */
const TITULO_STOP_WORDS = new Set([
  'de', 'del', 'la', 'las', 'el', 'los', 'un', 'una', 'unos', 'unas', 'y', 'o', 'e',
  'en', 'con', 'por', 'para', 'al', 'a', 'ante', 'bajo', 'cabe', 'contra', 'desde',
  'durante', 'hacia', 'hasta', 'mediante', 'segun', 'sin', 'sobre', 'entre', 'tras',
  'es', 'son', 'ser', 'se', 'su', 'sus', 'lo', 'le', 'les', 'que', 'como', 'cual',
  'cuales', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'eso', 'mi', 'tu', 'sus',
  'proyecto', 'proyectos', 'estudio', 'analisis'
])

const MAX_PALABRAS_CLAVE_SLUG = 6
const MAX_LONGITUD_BASE_SLUG = 72

const ensureAdmin = async () => {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('No hay sesion activa.')

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilError) throw perfilError
  if (perfil?.rol !== 'admin') {
    throw new Error('Acceso denegado: solo admin puede gestionar proyectos de investigacion.')
  }
}

const slugify = (value = '') => {
  const normalized = value
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  return normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/**
 * Construye la base del slug a partir de las palabras mas relevantes del titulo
 * (sin palabras vacias; primeras N palabras con contenido).
 * @param {string} titulo
 * @returns {string}
 */
const slugBaseDesdeTitulo = (titulo) => {
  const raw = titulo
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const tokens = raw.split(/[^a-z0-9]+/).filter(Boolean)
  if (tokens.length === 0) return ''

  const significativas = tokens.filter(
    (t) => t.length > 1 && !TITULO_STOP_WORDS.has(t)
  )

  let nucleo =
    significativas.length >= 2
      ? significativas.slice(0, MAX_PALABRAS_CLAVE_SLUG)
      : tokens.slice(0, Math.min(MAX_PALABRAS_CLAVE_SLUG, tokens.length))

  let base = slugify(nucleo.join(' '))
  if (!base) base = slugify(titulo)
  if (!base) return ''

  if (base.length > MAX_LONGITUD_BASE_SLUG) {
    base = base.slice(0, MAX_LONGITUD_BASE_SLUG).replace(/-+$/, '')
  }
  return base
}

/**
 * @param {string} baseSlug
 * @param {number} [maxAttempts]
 * @returns {Promise<string>}
 */
const generarSlugProyectoUnico = async (baseSlug, maxAttempts = 10) => {
  const base = baseSlug
  if (!base) throw new Error('No se pudo generar slug a partir del titulo.')

  for (let i = 0; i < maxAttempts; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    const { data } = await supabase
      .from('proyectos_investigacion')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!data) return candidate
  }
  throw new Error('No se pudo generar un slug unico.')
}

export const investigationProjectsService = {
  /**
   * Lista todos los proyectos de investigacion (publicados y borradores).
   * Solo admin: RLS permite al publico solo es_publicado=true; el admin ve el resto.
   * @returns {Promise<object[]>}
   */
  verTodosProyectosInvestigacionAdmin: async () => {
    await ensureAdmin()

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .select('*')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  /**
   * Lista proyectos publicados (es_publicado = true).
   * Sin validar rol: anon, alumno, maestro, invitado y admin pueden usarla;
   * RLS igual limita lo que cada sesion ve; el filtro explicito alinea la intencion del catalogo publico.
   * @returns {Promise<object[]>}
   */
  verProyectosInvestigacionPublicados: async () => {
    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .select('*')
      .eq('es_publicado', true)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  /**
   * Crea un proyecto de investigacion. Solo admin.
   * El slug se genera siempre automaticamente a partir del nucleo del titulo
   * (palabras clave sin palabras vacias; sufijo numerico si ya existe).
   * @param {ProyectoInvestigacionNuevo} payload
   * @returns {Promise<object>}
   */
  crearProyectoInvestigacionAdmin: async (payload) => {
    await ensureAdmin()

    if (payload?.slug != null && String(payload.slug).trim() !== '') {
      throw new Error('El slug se genera automaticamente; no envies slug en el payload.')
    }

    if (!payload?.titulo?.trim()) {
      throw new Error('El campo titulo es obligatorio.')
    }
    if (!payload?.investigador_responsable?.trim()) {
      throw new Error('El campo investigador_responsable es obligatorio.')
    }
    if (!payload?.estado || !ESTADOS_VALIDOS.has(payload.estado)) {
      throw new Error('estado debe ser Vigente o Concluido.')
    }
    if (!payload?.fechas || typeof payload.fechas !== 'object' || Array.isArray(payload.fechas)) {
      throw new Error('fechas es obligatorio y debe ser un objeto JSON.')
    }

    const baseSlug = slugBaseDesdeTitulo(payload.titulo.trim())
    const slugFinal = await generarSlugProyectoUnico(baseSlug)

    const row = {
      slug: slugFinal,
      titulo: payload.titulo.trim(),
      investigador_responsable: payload.investigador_responsable.trim(),
      estado: payload.estado,
      fechas: payload.fechas,
      informacion_institucional: payload.informacion_institucional ?? {},
      financiamiento: payload.financiamiento ?? {},
      colaboradores: payload.colaboradores ?? [],
      contenido_dinamico: payload.contenido_dinamico ?? [],
      config_visibilidad: payload.config_visibilidad ?? {},
      datos_adicionales: payload.datos_adicionales ?? {},
      galeria: payload.galeria ?? [],
      es_publicado: payload.es_publicado ?? false,
      orden: payload.orden ?? 0
    }

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .insert([row])
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Edita un proyecto de investigacion. Solo admin.
   * Acepta los mismos bloques JSON que en la BD (fechas, informacion_institucional, etc.).
   * El slug no se edita aqui (evita romper URLs publicas).
   * @param {{ id: string, updates: ProyectoInvestigacionEdicion }} params
   * @returns {Promise<object>}
   */
  editarProyectoInvestigacionAdmin: async ({ id, updates }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del proyecto a editar.')
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Debes enviar al menos un campo para actualizar.')
    }

    const sanitized = pickProyectoUpdates(updates)
    if (Object.keys(sanitized).length === 0) {
      throw new Error('No hay campos validos para actualizar.')
    }

    if (Object.prototype.hasOwnProperty.call(sanitized, 'estado')) {
      if (!ESTADOS_VALIDOS.has(sanitized.estado)) {
        throw new Error('estado debe ser Vigente o Concluido.')
      }
    }

    if (Object.prototype.hasOwnProperty.call(sanitized, 'titulo')) {
      if (!sanitized.titulo || !String(sanitized.titulo).trim()) {
        throw new Error('El titulo no puede quedar vacio.')
      }
      sanitized.titulo = String(sanitized.titulo).trim()
    }

    if (Object.prototype.hasOwnProperty.call(sanitized, 'investigador_responsable')) {
      if (!sanitized.investigador_responsable || !String(sanitized.investigador_responsable).trim()) {
        throw new Error('investigador_responsable no puede quedar vacio.')
      }
      sanitized.investigador_responsable = String(sanitized.investigador_responsable).trim()
    }

    if (Object.prototype.hasOwnProperty.call(sanitized, 'fechas')) {
      const f = sanitized.fechas
      if (!f || typeof f !== 'object' || Array.isArray(f)) {
        throw new Error('fechas debe ser un objeto JSON.')
      }
    }

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .update(sanitized)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Hace visible el proyecto para el publico (anon + usuarios no admin).
   * En BD corresponde a es_publicado = true (ver RLS en schema_logic.sql).
   * @param {{ id: string }} params
   * @returns {Promise<object>}
   */
  activarVisibilidadPublicaProyectoAdmin: async ({ id }) => {
    await ensureAdmin()
    if (!id) throw new Error('Debes enviar el id del proyecto.')

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .update({ es_publicado: true })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Oculta el proyecto al publico general (solo admin lo ve completo segun RLS).
   * En BD corresponde a es_publicado = false.
   * @param {{ id: string }} params
   * @returns {Promise<object>}
   */
  desactivarVisibilidadPublicaProyectoAdmin: async ({ id }) => {
    await ensureAdmin()
    if (!id) throw new Error('Debes enviar el id del proyecto.')

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .update({ es_publicado: false })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Aplica cambios de visibilidad de forma independiente (solo admin):
   * - Fusion parcial de config_visibilidad (ej. solo fechas.fin y fechas.duracion_meses).
   * - es_visible por indice en colaboradores, contenido_dinamico y galeria (como "true"/"false" en BD).
   * - Opcional: es_publicado (visible el proyecto al publico en general).
   * @param {{
   *   id: string,
   *   es_publicado?: boolean,
   *   config_visibilidad?: Record<string, any>,
   *   colaboradores?: VisibilidadColaboradorPatch[],
   *   contenido_dinamico?: VisibilidadContenidoPatch[],
   *   galeria?: VisibilidadGaleriaPatch[]
   * }} params
   * @returns {Promise<object>}
   */
  aplicarVisibilidadGranularProyectoAdmin: async ({
    id,
    es_publicado,
    config_visibilidad: configPatch,
    colaboradores: colPatches,
    contenido_dinamico: contPatches,
    galeria: galPatches
  }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del proyecto.')

    const hasConfig =
      configPatch != null && typeof configPatch === 'object' && !Array.isArray(configPatch)
    const hasPub = typeof es_publicado === 'boolean'
    const hasCol = Array.isArray(colPatches) && colPatches.length > 0
    const hasCont = Array.isArray(contPatches) && contPatches.length > 0
    const hasGal = Array.isArray(galPatches) && galPatches.length > 0

    if (!hasConfig && !hasPub && !hasCol && !hasCont && !hasGal) {
      throw new Error(
        'Envia al menos un cambio: config_visibilidad, es_publicado, colaboradores, contenido_dinamico o galeria.'
      )
    }

    const { data: row, error: fetchError } = await supabase
      .from('proyectos_investigacion')
      .select('id, config_visibilidad, colaboradores, contenido_dinamico, galeria, es_publicado')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    const updatePayload = {}

    if (hasPub) {
      updatePayload.es_publicado = es_publicado
    }

    if (hasConfig) {
      updatePayload.config_visibilidad = deepMergeConfigVisibilidad(
        row.config_visibilidad && typeof row.config_visibilidad === 'object'
          ? row.config_visibilidad
          : {},
        configPatch
      )
    }

    if (hasCol) {
      const arr = Array.isArray(row.colaboradores) ? clonarJson(row.colaboradores) : []
      for (const p of colPatches) {
        const i = p.indice
        if (typeof i !== 'number' || i < 0 || i >= arr.length) {
          throw new Error(`Colaborador: indice invalido (${i}).`)
        }
        arr[i] = { ...arr[i], es_visible: visibilidadAString(p.visible) }
      }
      updatePayload.colaboradores = arr
    }

    if (hasCont) {
      const arr = Array.isArray(row.contenido_dinamico)
        ? clonarJson(row.contenido_dinamico)
        : []

      const normSeccion = (s) =>
        String(s || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')

      for (const p of contPatches) {
        let i = p.indice
        if (typeof p.seccion === 'string' && p.seccion.trim()) {
          const target = normSeccion(p.seccion)
          i = arr.findIndex((item) => normSeccion(item.seccion) === target)
          if (i < 0) {
            throw new Error(`contenido_dinamico: seccion no encontrada "${p.seccion}".`)
          }
        }
        if (typeof i !== 'number' || i < 0 || i >= arr.length) {
          throw new Error('contenido_dinamico: indice o seccion invalido.')
        }
        arr[i] = { ...arr[i], es_visible: visibilidadAString(p.visible) }
      }
      updatePayload.contenido_dinamico = arr
    }

    if (hasGal) {
      const arr = Array.isArray(row.galeria) ? clonarJson(row.galeria) : []
      for (const p of galPatches) {
        const i = p.indice
        if (typeof i !== 'number' || i < 0 || i >= arr.length) {
          throw new Error(`Galeria: indice invalido (${i}).`)
        }
        arr[i] = { ...arr[i], es_visible: visibilidadAString(p.visible) }
      }
      updatePayload.galeria = arr
    }

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .update(updatePayload)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Sube una imagen al bucket proyectos_investigacion (carpeta galeria/) y actualiza el item en galeria[].
   * Si indice es un numero, reemplaza ese slot (borra el archivo anterior en Storage).
   * Si indice se omite, agrega un nuevo item al final.
   * Solo admin.
   * @param {{ id: string, file: File, indice?: number, descripcion?: string }} params
   * @returns {Promise<object>} Proyecto actualizado
   */
  subirImagenGaleriaProyectoAdmin: async ({ id, file, indice, descripcion }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del proyecto.')
    if (!file) throw new Error('Debes enviar un archivo de imagen.')
    if (file.size > GALERIA_IMG_MAX_BYTES) {
      throw new Error('La imagen excede el limite de 5 MB.')
    }
    if (!GALERIA_IMG_MIME.has(file.type)) {
      throw new Error('Tipo no permitido. Usa image/jpeg, image/png o image/webp.')
    }

    const ext = galeriaExtFromMime(file.type)
    if (!ext) throw new Error('No se pudo determinar la extension del archivo.')

    const { data: row, error: rowError } = await supabase
      .from('proyectos_investigacion')
      .select('id, galeria')
      .eq('id', id)
      .single()

    if (rowError) throw rowError

    const galeria = Array.isArray(row.galeria) ? clonarJson(row.galeria) : []
    const newPath = `galeria/${id}/img-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_PROYECTOS_INVESTIGACION)
      .upload(newPath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from(BUCKET_PROYECTOS_INVESTIGACION).getPublicUrl(newPath)

    const itemBase = {
      imagen_url: publicUrl,
      imagen_path: newPath,
      descripcion: descripcion != null ? String(descripcion) : '',
      es_visible: 'true'
    }

    let oldPath = null

    if (typeof indice === 'number') {
      if (indice < 0 || indice >= galeria.length) {
        await supabase.storage.from(BUCKET_PROYECTOS_INVESTIGACION).remove([newPath])
        throw new Error(`Galeria: indice invalido (${indice}).`)
      }
      const prev = galeria[indice] || {}
      oldPath = prev.imagen_path || null
      galeria[indice] = {
        ...prev,
        ...itemBase,
        descripcion:
          descripcion != null ? String(descripcion) : (prev.descripcion ?? '') || ''
      }
    } else {
      galeria.push({
        ...itemBase,
        descripcion: descripcion != null ? String(descripcion) : ''
      })
    }

    const { data: updated, error: updateError } = await supabase
      .from('proyectos_investigacion')
      .update({ galeria })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from(BUCKET_PROYECTOS_INVESTIGACION).remove([newPath])
      throw updateError
    }

    if (oldPath && oldPath !== newPath) {
      await supabase.storage.from(BUCKET_PROYECTOS_INVESTIGACION).remove([oldPath])
    }

    return updated
  },

  /**
   * Reemplaza la imagen de un slot existente de galeria. Solo admin.
   * @param {{ id: string, file: File, indice: number, descripcion?: string }} params
   * @returns {Promise<object>}
   */
  actualizarImagenGaleriaProyectoAdmin: async ({ id, file, indice, descripcion }) => {
    if (typeof indice !== 'number') {
      throw new Error('indice es obligatorio para actualizar una imagen de galeria.')
    }
    return investigationProjectsService.subirImagenGaleriaProyectoAdmin({
      id,
      file,
      indice,
      descripcion
    })
  },

  /**
   * Elimina la imagen en Storage y quita el elemento del arreglo galeria en ese indice. Solo admin.
   * @param {{ id: string, indice: number }} params
   * @returns {Promise<object>}
   */
  borrarImagenGaleriaProyectoAdmin: async ({ id, indice }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del proyecto.')
    if (typeof indice !== 'number' || indice < 0) {
      throw new Error('indice invalido.')
    }

    const { data: row, error: rowError } = await supabase
      .from('proyectos_investigacion')
      .select('id, galeria')
      .eq('id', id)
      .single()

    if (rowError) throw rowError

    const galeria = Array.isArray(row.galeria) ? clonarJson(row.galeria) : []
    if (indice >= galeria.length) {
      throw new Error(`Galeria: indice invalido (${indice}).`)
    }

    const oldPath = galeria[indice]?.imagen_path || null
    if (oldPath) {
      const { error: removeError } = await supabase.storage
        .from(BUCKET_PROYECTOS_INVESTIGACION)
        .remove([oldPath])
      if (removeError) throw removeError
    }

    galeria.splice(indice, 1)

    const { data: updated, error: updateError } = await supabase
      .from('proyectos_investigacion')
      .update({ galeria })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return updated
  },

  /**
   * Borra un proyecto de investigacion solo si no esta publicado (es_publicado = false). Solo admin.
   * @param {{ id: string }} params
   * @returns {Promise<object>}
   */
  borrarProyectoInvestigacionNoPublicadoAdmin: async ({ id }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del proyecto a borrar.')

    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .delete()
      .eq('id', id)
      .eq('es_publicado', false)
      .select('*')
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error(
        'No se pudo borrar: el proyecto no existe, sigue publicado (es_publicado=true) o ya fue eliminado.'
      )
    }

    return data[0]
  }
}
