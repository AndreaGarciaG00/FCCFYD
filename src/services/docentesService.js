import supabase from '../supabase.js'

/**
 * @typedef {Object} DocenteNuevo
 * @property {string} grado_academico
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} correo
 * @property {string} [slug]
 * @property {string} [cargo]
 * @property {string} [area_trabajo]
 * @property {string} [descripcion_breve]
 * @property {string} [telefono]
 * @property {string} [ubicacion_fisica]
 * @property {string} [foto_url]
 * @property {string} [foto_path]
 * @property {string} [cv_url]
 * @property {string} [cv_path]
 * @property {Record<string, any>} [redes_sociales]
 * @property {Record<string, any>} [datos_adicionales]
 * @property {boolean} [es_activo]
 * @property {number} [orden]
 */

/**
 * Campos editables de un docente (misma tabla; todos opcionales en PATCH).
 * @typedef {Object} DocenteEdicion
 * @property {string} [grado_academico]
 * @property {string} [nombres]
 * @property {string} [apellidos]
 * @property {string} [slug]
 * @property {string} [correo]
 * @property {string} [cargo]
 * @property {string} [area_trabajo]
 * @property {string} [descripcion_breve]
 * @property {string} [telefono]
 * @property {string} [ubicacion_fisica]
 * @property {string} [foto_url]
 * @property {string} [foto_path]
 * @property {string} [cv_url]
 * @property {string} [cv_path]
 * @property {Record<string, any>} [redes_sociales]
 * @property {Record<string, any>} [datos_adicionales]
 * @property {boolean} [es_activo]
 * @property {number} [orden]
 */

/**
 * Fila de docentes (lectura). La visibilidad real la aplica RLS en Supabase.
 * @typedef {Object} Docente
 * @property {string} id
 * @property {string} grado_academico
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} slug
 * @property {string} correo
 * @property {boolean} es_activo
 * @property {number} orden
 */

const DOCENTE_EDITABLE_KEYS = [
  'grado_academico',
  'nombres',
  'apellidos',
  'slug',
  'correo',
  'cargo',
  'area_trabajo',
  'descripcion_breve',
  'telefono',
  'ubicacion_fisica',
  'foto_url',
  'foto_path',
  'cv_url',
  'cv_path',
  'redes_sociales',
  'datos_adicionales',
  'es_activo',
  'orden'
]

const pickDocenteUpdates = (payload = {}) => {
  const out = {}
  for (const key of DOCENTE_EDITABLE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      out[key] = payload[key]
    }
  }
  return out
}

const DOCENTE_FOTO_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
])

const DOCENTE_FOTO_MAX_BYTES = 2 * 1024 * 1024
const DOCENTE_CV_MAX_BYTES = 10 * 1024 * 1024

const DOCENTE_CV_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf'
])

const docenteFotoExtFromMime = (mimeType) => {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  return null
}

const docenteCvExtFromMime = (mimeType) => {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
  if (mimeType === 'application/pdf') return 'pdf'
  return null
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
    throw new Error('Acceso denegado: solo admin puede gestionar docentes.')
  }
}

const slugify = (value = '') => {
  const normalized = value
    .toString()
    .trim()
    // Quita acentos/diacriticos (García -> Garcia, ñ -> n, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  // Reemplaza cualquier cosa que no sea letra/numero por "-"
  const slug = normalized.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug
}

/**
 * Genera un slug para docentes usando nombres y apellidos, verificando unicidad en Supabase.
 * @param {string} nombres
 * @param {string} apellidos
 * @param {{ maxAttempts?: number }} [opts]
 * @returns {Promise<string>}
 */
const generarSlugDocente = async (nombres, apellidos, opts = {}) => {
  const base = slugify(`${nombres ?? ''} ${apellidos ?? ''}`)
  if (!base) throw new Error('No se pudo generar slug: nombres/apellidos invalidos.')

  const maxAttempts = opts.maxAttempts ?? 10
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`

    const { data } = await supabase
      .from('docentes')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    // Si no hay registro con ese slug, lo aceptamos.
    if (!data) return candidate
  }

  throw new Error('No se pudo generar un slug unico para el docente (muchos intentos).')
}

export const docentesService = {
  /**
   * Lista docentes visibles segun la sesion actual.
   * - Sin sesion o rol distinto de admin: RLS devuelve solo docentes con es_activo = true.
   * - Admin: puede ver todos (activos e inactivos), segun politica en schema_logic.sql.
   * @returns {Promise<Docente[]>}
   */
  listarDocentes: async () => {
    const { data, error } = await supabase
      .from('docentes')
      .select('*')
      .order('orden', { ascending: true })
      .order('apellidos', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  /**
   * Crea un registro en docentes. Solo admin (RLS + validacion en cliente).
   * @param {DocenteNuevo} datos
   * @returns {Promise<object>}
   */
  agregarDocenteAdmin: async (datos) => {
    await ensureAdmin()

    const {
      grado_academico,
      nombres,
      apellidos,
      slug,
      correo,
      cargo,
      area_trabajo,
      descripcion_breve,
      telefono,
      ubicacion_fisica,
      foto_url,
      foto_path,
      cv_url,
      cv_path,
      redes_sociales,
      datos_adicionales,
      es_activo,
      orden
    } = datos

    if (!grado_academico || !nombres || !apellidos || !correo) {
      throw new Error(
        'Faltan campos obligatorios: grado_academico, nombres, apellidos, correo.'
      )
    }

    // El admin NO pone el slug manualmente: siempre se autogenera
    // con base en nombres + apellidos y se verifica unicidad en Supabase.
    const slugFinal = await generarSlugDocente(nombres, apellidos)

    const row = {
      grado_academico,
      nombres,
      apellidos,
      slug: slugFinal,
      correo,
      cargo: cargo ?? null,
      area_trabajo: area_trabajo ?? null,
      descripcion_breve: descripcion_breve ?? null,
      telefono: telefono ?? null,
      ubicacion_fisica: ubicacion_fisica ?? null,
      foto_url: foto_url ?? null,
      foto_path: foto_path ?? null,
      cv_url: cv_url ?? null,
      cv_path: cv_path ?? null,
      redes_sociales: redes_sociales ?? {},
      datos_adicionales: datos_adicionales ?? {},
      es_activo: es_activo ?? true,
      orden: orden ?? 0
    }

    const { data, error } = await supabase
      .from('docentes')
      .insert([row])
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Edita un docente existente. Solo admin.
   * Identifica el registro por id (uuid) o por slug.
   * @param {{ id?: string, slug?: string, updates: DocenteEdicion }} params
   * @returns {Promise<object>}
   */
  editarDocenteAdmin: async ({ id, slug, updates }) => {
    await ensureAdmin()

    if (!id && !slug) {
      throw new Error('Debes enviar id o slug del docente a editar.')
    }

    const sanitized = pickDocenteUpdates(updates)
    if (Object.keys(sanitized).length === 0) {
      throw new Error('No hay campos validos para actualizar.')
    }

    let query = supabase.from('docentes').update(sanitized).select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', slug)
    }

    const { data, error } = await query.single()

    if (error) throw error
    return data
  },

  /**
   * Borra un docente solo si esta desactivado (es_activo = false). Solo admin.
   * @param {{ id?: string, slug?: string }} params
   * @returns {Promise<object>}
   */
  borrarDocenteDesactivadoAdmin: async ({ id, slug }) => {
    await ensureAdmin()

    if (!id && !slug) {
      throw new Error('Debes enviar id o slug del docente a borrar.')
    }

    let query = supabase
      .from('docentes')
      .delete()
      .eq('es_activo', false)
      .select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('slug', slug)
    }

    const { data, error } = await query.limit(1)

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error(
        'No se pudo borrar: el docente no existe, no esta desactivado o ya fue eliminado.'
      )
    }

    return data[0]
  },

  /**
   * Sube foto para un docente (admin only), guarda foto_path y foto_url.
   * Si ya tiene foto, la reemplaza eliminando la anterior.
   * @param {{ id?: string, slug?: string, file: File }} params
   * @returns {Promise<object>}
   */
  subirFotoDocenteAdmin: async ({ id, slug, file }) => {
    await ensureAdmin()

    if (!id && !slug) {
      throw new Error('Debes enviar id o slug del docente.')
    }
    if (!file) throw new Error('Debes enviar una imagen.')

    if (file.size > DOCENTE_FOTO_MAX_BYTES) {
      throw new Error('La imagen excede el limite de 2 MB.')
    }
    if (!DOCENTE_FOTO_ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error('Tipo no permitido. Usa image/jpeg, image/png o image/webp.')
    }

    const ext = docenteFotoExtFromMime(file.type)
    if (!ext) throw new Error('No se pudo determinar la extension del archivo.')

    let queryPerfil = supabase.from('docentes').select('id, foto_path').limit(1)
    queryPerfil = id ? queryPerfil.eq('id', id) : queryPerfil.eq('slug', slug)

    const { data: docente, error: docenteError } = await queryPerfil.single()
    if (docenteError) throw docenteError

    const oldPath = docente?.foto_path ?? null
    const newPath = `fotos/${docente.id}/foto-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('docentes')
      .upload(newPath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from('docentes').getPublicUrl(newPath)

    const { data: updatedDocente, error: updateError } = await supabase
      .from('docentes')
      .update({
        foto_path: newPath,
        foto_url: publicUrl
      })
      .eq('id', docente.id)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from('docentes').remove([newPath])
      throw updateError
    }

    if (oldPath && oldPath !== newPath) {
      await supabase.storage.from('docentes').remove([oldPath])
    }

    return updatedDocente
  },

  /**
   * Alias semantico para reemplazar foto docente.
   * @param {{ id?: string, slug?: string, file: File }} params
   * @returns {Promise<object>}
   */
  actualizarFotoDocenteAdmin: async ({ id, slug, file }) => {
    return docentesService.subirFotoDocenteAdmin({ id, slug, file })
  },

  /**
   * Borra foto docente: elimina objeto de storage y limpia foto_path/foto_url.
   * @param {{ id?: string, slug?: string }} params
   * @returns {Promise<object>}
   */
  borrarFotoDocenteAdmin: async ({ id, slug }) => {
    await ensureAdmin()

    if (!id && !slug) {
      throw new Error('Debes enviar id o slug del docente.')
    }

    let queryPerfil = supabase.from('docentes').select('id, foto_path').limit(1)
    queryPerfil = id ? queryPerfil.eq('id', id) : queryPerfil.eq('slug', slug)

    const { data: docente, error: docenteError } = await queryPerfil.single()
    if (docenteError) throw docenteError

    const oldPath = docente?.foto_path ?? null
    if (oldPath) {
      const { error: removeError } = await supabase.storage.from('docentes').remove([oldPath])
      if (removeError) throw removeError
    }

    const { data: updatedDocente, error: updateError } = await supabase
      .from('docentes')
      .update({
        foto_path: null,
        foto_url: null
      })
      .eq('id', docente.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return updatedDocente
  },

  /**
   * Sube CV para un docente (admin only), guarda cv_path y cv_url.
   * Si ya tiene CV, lo reemplaza eliminando el anterior.
   * @param {{ id?: string, slug?: string, file: File }} params
   * @returns {Promise<object>}
   */
  subirCvDocenteAdmin: async ({ id, slug, file }) => {
    await ensureAdmin()

    if (!id && !slug) {
      throw new Error('Debes enviar id o slug del docente.')
    }
    if (!file) throw new Error('Debes enviar un archivo para el CV.')

    if (file.size > DOCENTE_CV_MAX_BYTES) {
      throw new Error('El archivo excede el limite de 10 MB.')
    }
    if (!DOCENTE_CV_ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error(
        'Tipo no permitido. Usa image/jpeg, image/png, image/webp o application/pdf.'
      )
    }

    const ext = docenteCvExtFromMime(file.type)
    if (!ext) throw new Error('No se pudo determinar la extension del archivo.')

    let queryPerfil = supabase.from('docentes').select('id, cv_path').limit(1)
    queryPerfil = id ? queryPerfil.eq('id', id) : queryPerfil.eq('slug', slug)

    const { data: docente, error: docenteError } = await queryPerfil.single()
    if (docenteError) throw docenteError

    const oldPath = docente?.cv_path ?? null
    const newPath = `cv/${docente.id}/cv-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('docentes')
      .upload(newPath, file, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from('docentes').getPublicUrl(newPath)

    const { data: updatedDocente, error: updateError } = await supabase
      .from('docentes')
      .update({
        cv_path: newPath,
        cv_url: publicUrl
      })
      .eq('id', docente.id)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from('docentes').remove([newPath])
      throw updateError
    }

    if (oldPath && oldPath !== newPath) {
      await supabase.storage.from('docentes').remove([oldPath])
    }

    return updatedDocente
  },

  /**
   * Alias semantico para reemplazar CV docente.
   * @param {{ id?: string, slug?: string, file: File }} params
   * @returns {Promise<object>}
   */
  actualizarCvDocenteAdmin: async ({ id, slug, file }) => {
    return docentesService.subirCvDocenteAdmin({ id, slug, file })
  },

  /**
   * Borra CV docente: elimina objeto de storage y limpia cv_path/cv_url.
   * @param {{ id?: string, slug?: string }} params
   * @returns {Promise<object>}
   */
  borrarCvDocenteAdmin: async ({ id, slug }) => {
    await ensureAdmin()

    if (!id && !slug) {
      throw new Error('Debes enviar id o slug del docente.')
    }

    let queryPerfil = supabase.from('docentes').select('id, cv_path').limit(1)
    queryPerfil = id ? queryPerfil.eq('id', id) : queryPerfil.eq('slug', slug)

    const { data: docente, error: docenteError } = await queryPerfil.single()
    if (docenteError) throw docenteError

    const oldPath = docente?.cv_path ?? null
    if (oldPath) {
      const { error: removeError } = await supabase.storage.from('docentes').remove([oldPath])
      if (removeError) throw removeError
    }

    const { data: updatedDocente, error: updateError } = await supabase
      .from('docentes')
      .update({
        cv_path: null,
        cv_url: null
      })
      .eq('id', docente.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return updatedDocente
  }
}
