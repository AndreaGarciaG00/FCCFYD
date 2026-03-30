import supabase from '../supabase.js'

/**
 * @typedef {Object} DocenteNuevo
 * @property {string} grado_academico
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string} slug
 * @property {string} correo
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

    if (!grado_academico || !nombres || !apellidos || !slug || !correo) {
      throw new Error(
        'Faltan campos obligatorios: grado_academico, nombres, apellidos, slug, correo.'
      )
    }

    const row = {
      grado_academico,
      nombres,
      apellidos,
      slug,
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
  }
}
