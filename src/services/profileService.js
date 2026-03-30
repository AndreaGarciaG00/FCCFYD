import supabase from '../supabase.js'

/**
 * @typedef {Object} Perfil
 * @property {string} id
 * @property {string} nombres
 * @property {string} apellidos
 * @property {string|null} matricula
 * @property {'alumno'|'maestro'|'admin'|'invitado'} rol
 * @property {string|null} email_capsula
 * @property {string|null} avatar_url
 * @property {string|null} avatar_path
 * @property {Record<string, any>} datos_adicionales
 * @property {string|null} created_at
 * @property {string|null} updated_at
 */

/**
 * Campos que un usuario puede editar en su propio perfil (RLS + trigger protegen el resto).
 * @typedef {Object} PerfilEdicionPropia
 * @property {string} [nombres]
 * @property {string} [apellidos]
 * @property {string|null} [avatar_url]
 * @property {string|null} [avatar_path]
 */

const pickCamposPropios = (payload = {}) => {
  const allowed = ['nombres', 'apellidos', 'avatar_url', 'avatar_path']
  const out = {}
  for (const key of allowed) {
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
    throw new Error('Acceso denegado: solo admin puede ver todos los perfiles.')
  }
}

export const profileService = {
  /**
   * Obtiene el perfil del usuario autenticado actual.
   * Aplica para cualquier rol logueado: alumno, maestro, admin o invitado.
   * @returns {Promise<Perfil>}
   */
  verMiPerfil: async () => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('No hay sesion activa.')

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualiza solo nombres, apellidos y avatar (avatar_url / avatar_path) del perfil propio.
   * Cualquier usuario autenticado puede usarla; no permite tocar rol, matricula, email_capsula, etc.
   * @param {PerfilEdicionPropia} cambios
   * @returns {Promise<Perfil>}
   */
  editarMiPerfil: async (cambios = {}) => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('No hay sesion activa.')

    const updates = pickCamposPropios(cambios)
    if (Object.keys(updates).length === 0) {
      throw new Error('No hay campos permitidos para actualizar (nombres, apellidos, avatar_url, avatar_path).')
    }

    const { data, error } = await supabase
      .from('perfiles')
      .update(updates)
      .eq('id', user.id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Lista todos los perfiles registrados. Solo admin (RLS y validacion en cliente).
   * @returns {Promise<Perfil[]>}
   */
  verTodosLosPerfilesAdmin: async () => {
    await ensureAdmin()

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  }
}
