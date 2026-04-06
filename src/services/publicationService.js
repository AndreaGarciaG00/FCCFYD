import supabase from '../supabase.js'

/**
 * @typedef {Object} PublicacionGaleriaItem
 * @property {string} [imagen_url]
 * @property {string} [imagen_path]
 * @property {string} [descripcion]
 * @property {boolean} [es_visible]
 */

/**
 * @typedef {Object} PublicacionAdjuntoItem
 * @property {string} [nombre]
 * @property {string} [archivo_url]
 * @property {string} [archivo_path]
 * @property {boolean} [es_visible]
 */

/**
 * @typedef {Object} PublicacionLinks
 * @property {string} [video]
 * @property {string} [formulario]
 * @property {string} [sitio_externo]
 */

/**
 * @typedef {Object} PublicacionDatosAdicionalesNoticia
 * @property {string} [autor]
 * @property {string} [fuente]
 * @property {string} [importancia]
 */

/**
 * Mismos metadatos editoriales que noticia, más campos de agenda del evento.
 * @typedef {Object} PublicacionDatosAdicionalesEvento
 * @property {string} [autor]
 * @property {string} [fuente]
 * @property {string} [importancia]
 * @property {string} [ubicacion]
 * @property {string} [hora]
 * @property {string} [organizador]
 * @property {string} [costo]
 */

/**
 * @typedef {Object} PublicacionConfigUi
 * @property {boolean} [mostrar_links]
 * @property {boolean} [mostrar_galeria]
 * @property {boolean} [mostrar_adjuntos]
 */

/**
 * Campos comunes al crear una publicacion (admin).
 * El slug se genera solo a partir del titulo; no enviar `slug`.
 * @typedef {Object} PublicacionNuevaBase
 * @property {string} titulo
 * @property {string} cuerpo_texto
 * @property {PublicacionGaleriaItem[]} [galeria]
 * @property {PublicacionAdjuntoItem[]} [adjuntos]
 * @property {PublicacionLinks} [links]
 * @property {PublicacionConfigUi} [config_ui]
 * @property {boolean} [es_publicado]
 * @property {string} [fecha_publicacion] ISO 8601
 */

/**
 * @typedef {PublicacionNuevaBase & {
 *   tipo: 'Noticia',
 *   datos_adicionales?: PublicacionDatosAdicionalesNoticia
 * }} PublicacionNuevaNoticia
 */

/**
 * @typedef {PublicacionNuevaBase & {
 *   tipo: 'Evento',
 *   datos_adicionales?: PublicacionDatosAdicionalesEvento
 * }} PublicacionNuevaEvento
 */

/**
 * Union discriminada por `tipo` (JSDoc / TypeScript structural).
 * @typedef {PublicacionNuevaNoticia|PublicacionNuevaEvento} PublicacionNueva
 */

/**
 * Campos que el admin puede actualizar (parcial). No incluye slug ni busqueda_vector.
 * @typedef {Object} PublicacionEdicion
 * @property {'Noticia'|'Evento'} [tipo]
 * @property {string} [titulo]
 * @property {string} [cuerpo_texto]
 * @property {PublicacionGaleriaItem[]} [galeria]
 * @property {PublicacionAdjuntoItem[]} [adjuntos]
 * @property {PublicacionLinks} [links]
 * @property {PublicacionDatosAdicionalesNoticia|PublicacionDatosAdicionalesEvento} [datos_adicionales]
 * @property {PublicacionConfigUi} [config_ui]
 * @property {boolean} [es_publicado]
 * @property {string} [fecha_publicacion] ISO 8601
 */

const TIPOS_VALIDOS = new Set(['Noticia', 'Evento'])

const CAMPOS_PUBLICACION_EDITABLES = [
  'tipo',
  'titulo',
  'cuerpo_texto',
  'galeria',
  'adjuntos',
  'links',
  'datos_adicionales',
  'config_ui',
  'es_publicado',
  'fecha_publicacion'
]

const DATOS_ADICIONALES_KEYS_NOTICIA = new Set([
  'autor',
  'fuente',
  'importancia'
])

const DATOS_ADICIONALES_KEYS_EVENTO = new Set([
  ...DATOS_ADICIONALES_KEYS_NOTICIA,
  'ubicacion',
  'hora',
  'organizador',
  'costo'
])

const CONFIG_UI_DEFAULT = {
  mostrar_links: true,
  mostrar_galeria: true,
  mostrar_adjuntos: true
}

/** Bucket Storage dedicado a archivos de la tabla `publicaciones` (noticias/eventos). */
const BUCKET_PUBLICACIONES = 'publicaciones'
const STORAGE_MAX_BYTES = 10 * 1024 * 1024

const GALERIA_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const ADJUNTOS_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
])

const MAX_LONGITUD_BASE_SLUG = 72

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
 * @param {string} titulo
 * @returns {string}
 */
const slugBaseDesdeTitulo = (titulo) => {
  let base = slugify(titulo)
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
const generarSlugPublicacionUnico = async (baseSlug, maxAttempts = 30) => {
  const base = baseSlug
  if (!base) throw new Error('No se pudo generar slug a partir del titulo.')

  for (let i = 0; i < maxAttempts; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`
    const { data } = await supabase
      .from('publicaciones')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()
    if (!data) return candidate
  }

  const suffix =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : String(Date.now())
  return `${base}-${suffix}`
}

/**
 * @param {'Noticia'|'Evento'} tipo
 * @param {Record<string, unknown>|undefined} datos
 */
const assertDatosAdicionalesPorTipo = (tipo, datos) => {
  if (datos == null || typeof datos !== 'object' || Array.isArray(datos)) return
  const allowed =
    tipo === 'Noticia'
      ? DATOS_ADICIONALES_KEYS_NOTICIA
      : DATOS_ADICIONALES_KEYS_EVENTO
  const invalid = Object.keys(datos).filter((k) => !allowed.has(k))
  if (invalid.length > 0) {
    throw new Error(
      `datos_adicionales (${tipo}): claves no permitidas: ${invalid.join(', ')}.`
    )
  }
}

/**
 * @param {File|Blob} file
 * @param {Set<string>} allowedMimes
 * @param {string} etiqueta
 */
const assertArchivoTamanoYTipo = (file, allowedMimes, etiqueta) => {
  if (!file || typeof file !== 'object') {
    throw new Error(`${etiqueta}: archivo invalido.`)
  }
  const type = /** @type {{ type?: string, size?: number }} */ (file).type
  const size = /** @type {{ type?: string, size?: number }} */ (file).size
  if (!type || !allowedMimes.has(type)) {
    throw new Error(`${etiqueta}: tipo MIME no permitido para este bucket.`)
  }
  if (typeof size !== 'number' || size > STORAGE_MAX_BYTES) {
    throw new Error(`${etiqueta}: el archivo excede 10 MB.`)
  }
}

/**
 * @param {string} mime
 * @returns {string|null}
 */
const extensionDesdeMimeAdjunto = (mime) => {
  switch (mime) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'application/pdf':
      return 'pdf'
    default:
      return null
  }
}

/**
 * @param {string} publicacionId
 * @param {string} path
 * @returns {boolean}
 */
const pathGaleriaPerteneceAPublicacion = (publicacionId, path) =>
  typeof path === 'string' &&
  path.startsWith(`${publicacionId}/galeria/`) &&
  !path.includes('..')

/**
 * @param {string} publicacionId
 * @param {string} path
 * @returns {boolean}
 */
const pathAdjuntoPerteneceAPublicacion = (publicacionId, path) =>
  typeof path === 'string' &&
  path.startsWith(`${publicacionId}/adjuntos/`) &&
  !path.includes('..')

/**
 * @param {string} publicacionId
 * @returns {Promise<{ galeria: object[], adjuntos: object[] }>}
 */
const cargarGaleriaYAdjuntos = async (publicacionId) => {
  const { data, error } = await supabase
    .from('publicaciones')
    .select('id, galeria, adjuntos')
    .eq('id', publicacionId)
    .single()

  if (error) throw error
  if (!data) throw new Error('Publicacion no encontrada.')

  return {
    galeria: Array.isArray(data.galeria) ? data.galeria.map((x) => ({ ...x })) : [],
    adjuntos: Array.isArray(data.adjuntos) ? data.adjuntos.map((x) => ({ ...x })) : []
  }
}

/**
 * @param {string} [nombre]
 * @param {string} [fallback]
 */
const nombreArchivoSeguro = (nombre, fallback = 'archivo') => {
  const raw = String(nombre ?? fallback).trim() || fallback
  const base = raw.split(/[/\\]/).pop() ?? fallback
  return base.slice(0, 255) || fallback
}

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
    throw new Error('Acceso denegado: solo admin puede gestionar publicaciones.')
  }
}

/**
 * @param {unknown} v
 * @returns {v is Record<string, unknown>}
 */
const esObjetoPlano = (v) =>
  v != null && typeof v === 'object' && !Array.isArray(v)

export const publicationService = {
  /**
   * Lista todas las publicaciones (`es_publicado` true y false). Solo admin.
   * El publico con RLS solo ve las publicadas; aqui el admin ve tambien borradores.
   *
   * @returns {Promise<object[]>}
   */
  verTodasPublicacionesAdmin: async () => {
    await ensureAdmin()

    const { data, error } = await supabase
      .from('publicaciones')
      .select('*')
      .order('fecha_publicacion', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  /**
   * Lista publicaciones visibles para el sitio (`es_publicado=true`).
   * No requiere sesion: anon, alumnos, maestros e invitados pueden usarla.
   * Con RLS, quien no es admin solo puede leer filas publicadas de todas formas;
   * el filtro explicito alinea la intencion y limita al admin a la misma vista si usa esta funcion.
   *
   * @returns {Promise<object[]>}
   */
  verPublicacionesPublicadas: async () => {
    const { data, error } = await supabase
      .from('publicaciones')
      .select('*')
      .eq('es_publicado', true)
      .order('fecha_publicacion', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  /**
   * Crea una publicacion (Noticia o Evento). Solo admin.
   * El slug se deriva del titulo y se garantiza unicidad en `publicaciones`.
   * @param {PublicacionNueva} payload
   * @returns {Promise<object>}
   */
  crearPublicacionAdmin: async (payload) => {
    await ensureAdmin()

    if (!payload?.tipo || !TIPOS_VALIDOS.has(payload.tipo)) {
      throw new Error('tipo debe ser Noticia o Evento.')
    }
    if (payload?.slug != null && String(payload.slug).trim() !== '') {
      throw new Error('El slug se genera automaticamente; no envies slug en el payload.')
    }
    if (!payload?.titulo || !String(payload.titulo).trim()) {
      throw new Error('titulo es obligatorio.')
    }
    if (!payload?.cuerpo_texto || !String(payload.cuerpo_texto).trim()) {
      throw new Error('cuerpo_texto es obligatorio.')
    }

    assertDatosAdicionalesPorTipo(payload.tipo, payload.datos_adicionales)

    const tituloTrim = String(payload.titulo).trim()
    const baseSlug = slugBaseDesdeTitulo(tituloTrim)
    const slugFinal = await generarSlugPublicacionUnico(baseSlug)

    const row = {
      tipo: payload.tipo,
      slug: slugFinal,
      titulo: tituloTrim,
      cuerpo_texto: String(payload.cuerpo_texto).trim(),
      galeria: payload.galeria ?? [],
      adjuntos: payload.adjuntos ?? [],
      links: payload.links ?? {},
      datos_adicionales: payload.datos_adicionales ?? {},
      config_ui: { ...CONFIG_UI_DEFAULT, ...(payload.config_ui ?? {}) },
      es_publicado: payload.es_publicado ?? false,
      fecha_publicacion: payload.fecha_publicacion ?? new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('publicaciones')
      .insert([row])
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza una publicacion existente (PATCH parcial). Solo admin.
   * No permite cambiar `slug` (URLs estables). `busqueda_vector` lo mantiene el trigger.
   * Si envias `links`, `config_ui` o `datos_adicionales`, se fusionan con lo guardado.
   * Tras aplicar cambios, `datos_adicionales` debe cumplir las claves permitidas para el `tipo` resultante.
   *
   * @param {{ id: string, updates: PublicacionEdicion }} params
   * @returns {Promise<object>}
   */
  editarPublicacionAdmin: async ({ id, updates }) => {
    await ensureAdmin()

    if (!id || !String(id).trim()) {
      throw new Error('id es obligatorio.')
    }
    if (!esObjetoPlano(updates)) {
      throw new Error('updates debe ser un objeto.')
    }
    if (updates.slug != null || updates.busqueda_vector != null) {
      throw new Error('No se puede editar slug ni busqueda_vector desde aqui.')
    }

    const tieneAlguno = CAMPOS_PUBLICACION_EDITABLES.some((k) =>
      Object.prototype.hasOwnProperty.call(updates, k)
    )
    if (!tieneAlguno) {
      throw new Error('No hay campos editables en updates.')
    }

    const { data: existing, error: fetchError } = await supabase
      .from('publicaciones')
      .select('*')
      .eq('id', String(id).trim())
      .single()

    if (fetchError) throw fetchError
    if (!existing) throw new Error('Publicacion no encontrada.')

    const patch = {}

    if (Object.prototype.hasOwnProperty.call(updates, 'tipo')) {
      if (!TIPOS_VALIDOS.has(updates.tipo)) {
        throw new Error('tipo debe ser Noticia o Evento.')
      }
      patch.tipo = updates.tipo
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'titulo')) {
      const t = String(updates.titulo).trim()
      if (!t) throw new Error('titulo no puede quedar vacio.')
      patch.titulo = t
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'cuerpo_texto')) {
      const c = String(updates.cuerpo_texto).trim()
      if (!c) throw new Error('cuerpo_texto no puede quedar vacio.')
      patch.cuerpo_texto = c
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'galeria')) {
      patch.galeria = updates.galeria
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'adjuntos')) {
      patch.adjuntos = updates.adjuntos
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'es_publicado')) {
      patch.es_publicado = updates.es_publicado
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'fecha_publicacion')) {
      patch.fecha_publicacion = updates.fecha_publicacion
    }

    const nextTipo = patch.tipo ?? existing.tipo
    if (!TIPOS_VALIDOS.has(nextTipo)) {
      throw new Error('tipo de la publicacion es invalido.')
    }

    let nextDatos = esObjetoPlano(existing.datos_adicionales)
      ? { ...existing.datos_adicionales }
      : {}
    if (Object.prototype.hasOwnProperty.call(updates, 'datos_adicionales')) {
      if (!esObjetoPlano(updates.datos_adicionales)) {
        throw new Error('datos_adicionales debe ser un objeto.')
      }
      nextDatos = { ...nextDatos, ...updates.datos_adicionales }
      patch.datos_adicionales = nextDatos
    }

    assertDatosAdicionalesPorTipo(nextTipo, nextDatos)

    if (Object.prototype.hasOwnProperty.call(updates, 'links')) {
      if (!esObjetoPlano(updates.links)) {
        throw new Error('links debe ser un objeto.')
      }
      const base = esObjetoPlano(existing.links) ? existing.links : {}
      patch.links = { ...base, ...updates.links }
    }

    if (Object.prototype.hasOwnProperty.call(updates, 'config_ui')) {
      if (!esObjetoPlano(updates.config_ui)) {
        throw new Error('config_ui debe ser un objeto.')
      }
      const base = esObjetoPlano(existing.config_ui) ? existing.config_ui : {}
      patch.config_ui = { ...CONFIG_UI_DEFAULT, ...base, ...updates.config_ui }
    }

    if (Object.keys(patch).length === 0) {
      throw new Error('No hay cambios para aplicar.')
    }

    const { data, error } = await supabase
      .from('publicaciones')
      .update(patch)
      .eq('id', String(id).trim())
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Sube una imagen al bucket y agrega un elemento a `galeria` (imagen_url + imagen_path).
   * Solo admin. Bucket `publicaciones`, rutas `{publicacionId}/galeria/...` y `{publicacionId}/adjuntos/...`
   *
   * @param {{ publicacionId: string, file: File, descripcion?: string, es_visible?: boolean }} params
   * @returns {Promise<object>} fila `publicaciones` actualizada
   */
  subirImagenGaleriaPublicacionAdmin: async ({
    publicacionId,
    file,
    descripcion = '',
    es_visible = false
  }) => {
    await ensureAdmin()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) throw new Error('publicacionId es obligatorio.')
    assertArchivoTamanoYTipo(file, GALERIA_MIMES, 'Galeria')

    const ext = extensionDesdeMimeAdjunto(file.type)
    if (!ext) throw new Error('Galeria: extension no soportada.')

    const { galeria } = await cargarGaleriaYAdjuntos(pid)
    const newPath = `${pid}/galeria/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_PUBLICACIONES)
      .upload(newPath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from(BUCKET_PUBLICACIONES).getPublicUrl(newPath)

    galeria.push({
      imagen_url: publicUrl,
      imagen_path: newPath,
      descripcion: String(descripcion ?? ''),
      es_visible: Boolean(es_visible)
    })

    const { data: updated, error: updateError } = await supabase
      .from('publicaciones')
      .update({ galeria })
      .eq('id', pid)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from(BUCKET_PUBLICACIONES).remove([newPath])
      throw updateError
    }
    return updated
  },

  /**
   * Reemplaza el archivo de un item de galeria o solo actualiza descripcion / es_visible.
   * Solo admin.
   *
   * @param {{ publicacionId: string, indice: number, file?: File, descripcion?: string, es_visible?: boolean }} params
   * @returns {Promise<object>}
   */
  actualizarImagenGaleriaPublicacionAdmin: async ({
    publicacionId,
    indice,
    file,
    descripcion,
    es_visible
  }) => {
    await ensureAdmin()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) throw new Error('publicacionId es obligatorio.')
    if (!Number.isInteger(indice) || indice < 0) {
      throw new Error('indice debe ser un entero >= 0.')
    }

    const tieneMeta =
      descripcion !== undefined ||
      es_visible !== undefined ||
      file != null
    if (!tieneMeta) {
      throw new Error('Envia file y/o descripcion y/o es_visible.')
    }

    const { galeria } = await cargarGaleriaYAdjuntos(pid)
    if (indice >= galeria.length) {
      throw new Error('indice fuera de rango en galeria.')
    }

    const item = { ...galeria[indice] }
    let oldPath =
      typeof item.imagen_path === 'string' ? item.imagen_path.trim() : ''
    let newPath = null

    if (file != null) {
      assertArchivoTamanoYTipo(file, GALERIA_MIMES, 'Galeria')
      const ext = extensionDesdeMimeAdjunto(file.type)
      if (!ext) throw new Error('Galeria: extension no soportada.')

      newPath = `${pid}/galeria/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_PUBLICACIONES)
        .upload(newPath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl }
      } = supabase.storage.from(BUCKET_PUBLICACIONES).getPublicUrl(newPath)

      item.imagen_url = publicUrl
      item.imagen_path = newPath
    }

    if (descripcion !== undefined) item.descripcion = String(descripcion)
    if (es_visible !== undefined) item.es_visible = Boolean(es_visible)

    galeria[indice] = item

    const { data: updated, error: updateError } = await supabase
      .from('publicaciones')
      .update({ galeria })
      .eq('id', pid)
      .select('*')
      .single()

    if (updateError) {
      if (newPath) {
        await supabase.storage.from(BUCKET_PUBLICACIONES).remove([newPath])
      }
      throw updateError
    }

    if (file != null && oldPath && pathGaleriaPerteneceAPublicacion(pid, oldPath)) {
      await supabase.storage.from(BUCKET_PUBLICACIONES).remove([oldPath])
    }

    return updated
  },

  /**
   * Quita un item de `galeria` y borra el objeto en Storage si la ruta es de esta publicacion.
   * Solo admin.
   *
   * @param {{ publicacionId: string, indice: number }} params
   * @returns {Promise<object>}
   */
  borrarImagenGaleriaPublicacionAdmin: async ({ publicacionId, indice }) => {
    await ensureAdmin()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) throw new Error('publicacionId es obligatorio.')
    if (!Number.isInteger(indice) || indice < 0) {
      throw new Error('indice debe ser un entero >= 0.')
    }

    const { galeria } = await cargarGaleriaYAdjuntos(pid)
    if (indice >= galeria.length) {
      throw new Error('indice fuera de rango en galeria.')
    }

    const [removed] = galeria.splice(indice, 1)
    const path =
      removed && typeof removed.imagen_path === 'string'
        ? removed.imagen_path.trim()
        : ''

    const { data: updated, error: updateError } = await supabase
      .from('publicaciones')
      .update({ galeria })
      .eq('id', pid)
      .select('*')
      .single()

    if (updateError) throw updateError

    if (path && pathGaleriaPerteneceAPublicacion(pid, path)) {
      const { error: rmErr } = await supabase.storage
        .from(BUCKET_PUBLICACIONES)
        .remove([path])
      if (rmErr) throw rmErr
    }

    return updated
  },

  /**
   * Sube un adjunto (imagen o PDF) y agrega entrada en `adjuntos`.
   * Solo admin.
   *
   * @param {{ publicacionId: string, file: File, nombre?: string, es_visible?: boolean }} params
   * @returns {Promise<object>}
   */
  subirAdjuntoPublicacionAdmin: async ({
    publicacionId,
    file,
    nombre,
    es_visible = true
  }) => {
    await ensureAdmin()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) throw new Error('publicacionId es obligatorio.')
    assertArchivoTamanoYTipo(file, ADJUNTOS_MIMES, 'Adjunto')

    const ext = extensionDesdeMimeAdjunto(file.type)
    if (!ext) throw new Error('Adjunto: extension no soportada.')

    const { adjuntos } = await cargarGaleriaYAdjuntos(pid)
    const newPath = `${pid}/adjuntos/${crypto.randomUUID()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_PUBLICACIONES)
      .upload(newPath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from(BUCKET_PUBLICACIONES).getPublicUrl(newPath)

    const nom = nombreArchivoSeguro(
      nombre,
      /** @type {{ name?: string }} */ (file).name
    )

    adjuntos.push({
      nombre: nom,
      archivo_url: publicUrl,
      archivo_path: newPath,
      es_visible: Boolean(es_visible)
    })

    const { data: updated, error: updateError } = await supabase
      .from('publicaciones')
      .update({ adjuntos })
      .eq('id', pid)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from(BUCKET_PUBLICACIONES).remove([newPath])
      throw updateError
    }
    return updated
  },

  /**
   * Reemplaza archivo del adjunto o actualiza nombre / es_visible. Solo admin.
   *
   * @param {{ publicacionId: string, indice: number, file?: File, nombre?: string, es_visible?: boolean }} params
   * @returns {Promise<object>}
   */
  actualizarAdjuntoPublicacionAdmin: async ({
    publicacionId,
    indice,
    file,
    nombre,
    es_visible
  }) => {
    await ensureAdmin()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) throw new Error('publicacionId es obligatorio.')
    if (!Number.isInteger(indice) || indice < 0) {
      throw new Error('indice debe ser un entero >= 0.')
    }

    const tieneCambio =
      file != null || nombre !== undefined || es_visible !== undefined
    if (!tieneCambio) {
      throw new Error('Envia file y/o nombre y/o es_visible.')
    }

    const { adjuntos } = await cargarGaleriaYAdjuntos(pid)
    if (indice >= adjuntos.length) {
      throw new Error('indice fuera de rango en adjuntos.')
    }

    const item = { ...adjuntos[indice] }
    let oldPath =
      typeof item.archivo_path === 'string' ? item.archivo_path.trim() : ''
    let newPath = null

    if (file != null) {
      assertArchivoTamanoYTipo(file, ADJUNTOS_MIMES, 'Adjunto')
      const ext = extensionDesdeMimeAdjunto(file.type)
      if (!ext) throw new Error('Adjunto: extension no soportada.')

      newPath = `${pid}/adjuntos/${crypto.randomUUID()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_PUBLICACIONES)
        .upload(newPath, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false
        })
      if (uploadError) throw uploadError

      const {
        data: { publicUrl }
      } = supabase.storage.from(BUCKET_PUBLICACIONES).getPublicUrl(newPath)

      item.archivo_url = publicUrl
      item.archivo_path = newPath
      if (nombre === undefined && /** @type {{ name?: string }} */ (file).name) {
        item.nombre = nombreArchivoSeguro(undefined, file.name)
      }
    }

    if (nombre !== undefined) item.nombre = nombreArchivoSeguro(nombre)
    if (es_visible !== undefined) item.es_visible = Boolean(es_visible)

    adjuntos[indice] = item

    const { data: updated, error: updateError } = await supabase
      .from('publicaciones')
      .update({ adjuntos })
      .eq('id', pid)
      .select('*')
      .single()

    if (updateError) {
      if (newPath) {
        await supabase.storage.from(BUCKET_PUBLICACIONES).remove([newPath])
      }
      throw updateError
    }

    if (file != null && oldPath && pathAdjuntoPerteneceAPublicacion(pid, oldPath)) {
      await supabase.storage.from(BUCKET_PUBLICACIONES).remove([oldPath])
    }

    return updated
  },

  /**
   * Quita un adjunto del arreglo y borra el objeto en Storage si la ruta pertenece a la publicacion.
   * Solo admin.
   *
   * @param {{ publicacionId: string, indice: number }} params
   * @returns {Promise<object>}
   */
  borrarAdjuntoPublicacionAdmin: async ({ publicacionId, indice }) => {
    await ensureAdmin()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) throw new Error('publicacionId es obligatorio.')
    if (!Number.isInteger(indice) || indice < 0) {
      throw new Error('indice debe ser un entero >= 0.')
    }

    const { adjuntos } = await cargarGaleriaYAdjuntos(pid)
    if (indice >= adjuntos.length) {
      throw new Error('indice fuera de rango en adjuntos.')
    }

    const [removed] = adjuntos.splice(indice, 1)
    const path =
      removed && typeof removed.archivo_path === 'string'
        ? removed.archivo_path.trim()
        : ''

    const { data: updated, error: updateError } = await supabase
      .from('publicaciones')
      .update({ adjuntos })
      .eq('id', pid)
      .select('*')
      .single()

    if (updateError) throw updateError

    if (path && pathAdjuntoPerteneceAPublicacion(pid, path)) {
      const { error: rmErr } = await supabase.storage
        .from(BUCKET_PUBLICACIONES)
        .remove([path])
      if (rmErr) throw rmErr
    }

    return updated
  },

  /**
   * Elimina una publicacion solo si es borrador (`es_publicado=false`). Solo admin.
   * Las publicadas no se pueden borrar por este medio (evita romper enlaces vivos).
   *
   * @param {{ id: string }} params
   * @returns {Promise<{ id: string }>}
   */
  borrarPublicacionBorradorAdmin: async ({ id }) => {
    await ensureAdmin()

    const trimmed = String(id ?? '').trim()
    if (!trimmed) {
      throw new Error('id es obligatorio.')
    }

    const { data: row, error: fetchError } = await supabase
      .from('publicaciones')
      .select('id, es_publicado')
      .eq('id', trimmed)
      .maybeSingle()

    if (fetchError) throw fetchError
    if (!row) {
      throw new Error('Publicacion no encontrada.')
    }
    if (row.es_publicado) {
      throw new Error(
        'Solo se pueden borrar publicaciones no publicadas (es_publicado=false).'
      )
    }

    const { data: deleted, error: delError } = await supabase
      .from('publicaciones')
      .delete()
      .eq('id', trimmed)
      .eq('es_publicado', false)
      .select('id')
      .maybeSingle()

    if (delError) throw delError
    if (!deleted) {
      throw new Error(
        'No se pudo borrar la publicacion (pudo haberse publicado en paralelo).'
      )
    }

    return deleted
  }
}
