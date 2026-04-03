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

const AVATAR_ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp'
])

const fileExtFromMime = (mimeType) => {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/png') return 'png'
  if (mimeType === 'image/webp') return 'webp'
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
   * Sube/reemplaza el avatar del usuario autenticado en Storage bucket "perfiles"
   * y guarda avatar_path + avatar_url en la tabla perfiles.
   * @param {File} file
   * @param {{ maxMb?: number }} [opts]
   * @returns {Promise<Perfil>}
   */
  subirMiAvatar: async (file, opts = {}) => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('No hay sesion activa.')
    if (!file) throw new Error('Debes enviar un archivo de imagen.')

    const maxMb = Number(opts.maxMb ?? 2)
    const maxBytes = maxMb * 1024 * 1024
    if (file.size > maxBytes) {
      throw new Error(`La imagen excede el limite permitido de ${maxMb} MB.`)
    }

    if (!AVATAR_ALLOWED_MIME_TYPES.has(file.type)) {
      throw new Error('Tipo de archivo no permitido. Usa image/jpeg, image/png o image/webp.')
    }

    const ext = fileExtFromMime(file.type)
    if (!ext) throw new Error('No se pudo determinar la extension del archivo.')

    const { data: perfilActual, error: perfilActualError } = await supabase
      .from('perfiles')
      .select('avatar_path')
      .eq('id', user.id)
      .single()

    if (perfilActualError) throw perfilActualError

    const oldPath = perfilActual?.avatar_path ?? null
    const objectPath = `${user.id}/avatar-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('perfiles')
      .upload(objectPath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      })

    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from('perfiles').getPublicUrl(objectPath)

    const { data: perfilActualizado, error: updateError } = await supabase
      .from('perfiles')
      .update({
        avatar_path: objectPath,
        avatar_url: publicUrl
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from('perfiles').remove([objectPath])
      throw updateError
    }

    if (oldPath && oldPath !== objectPath) {
      await supabase.storage.from('perfiles').remove([oldPath])
    }

    return perfilActualizado
  },

  /**
   * Borra el avatar del usuario autenticado:
   * 1) elimina el archivo en bucket "perfiles" (si existe avatar_path)
   * 2) limpia avatar_path y avatar_url en tabla perfiles.
   * @returns {Promise<Perfil>}
   */
  borrarMiAvatar: async () => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) throw new Error('No hay sesion activa.')

    const { data: perfilActual, error: perfilError } = await supabase
      .from('perfiles')
      .select('avatar_path')
      .eq('id', user.id)
      .single()

    if (perfilError) throw perfilError

    const oldPath = perfilActual?.avatar_path ?? null
    if (oldPath) {
      const { error: removeError } = await supabase.storage.from('perfiles').remove([oldPath])
      if (removeError) throw removeError
    }

    const { data: perfilActualizado, error: updateError } = await supabase
      .from('perfiles')
      .update({
        avatar_path: null,
        avatar_url: null
      })
      .eq('id', user.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return perfilActualizado
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
