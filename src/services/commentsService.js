import supabase from '../supabase.js'

/**
 * @typedef {Object} ComentarioNuevo
 * @property {string} publicacion_id UUID de `publicaciones`
 * @property {string} contenido Texto del comentario
 * @property {boolean} [es_visible] Por defecto `true` (moderacion admin puede ocultar luego)
 */

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
    throw new Error('Acceso denegado: solo admin puede usar esta funcion.')
  }
}

/**
 * @param {string} comentarioId
 * @param {boolean} es_visible
 */
const actualizarVisibilidadComentarioAdmin = async (comentarioId, es_visible) => {
  await ensureAdmin()

  const cid = String(comentarioId ?? '').trim()
  if (!cid) {
    throw new Error('id del comentario es obligatorio.')
  }

  const { data, error } = await supabase
    .from('comentarios')
    .update({ es_visible: Boolean(es_visible) })
    .eq('id', cid)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export const commentsService = {
  /**
   * Lista comentarios visibles (`es_visible=true`) solo si la publicacion esta publicada (`es_publicado=true`).
   * Sin sesion o con cualquier rol: si la publicacion es borrador o no es visible para el cliente (RLS), devuelve [].
   * Un admin logueado tampoco ve aqui comentarios de borradores (vista publica); moderacion seria otro endpoint.
   *
   * @param {{ publicacionId: string }} params
   * @returns {Promise<object[]>}
   */
  verComentariosVisiblesPublicacion: async ({ publicacionId }) => {
    const pid = String(publicacionId ?? '').trim()
    if (!pid) {
      throw new Error('publicacionId es obligatorio.')
    }

    const { data: pub, error: pubError } = await supabase
      .from('publicaciones')
      .select('id')
      .eq('id', pid)
      .eq('es_publicado', true)
      .maybeSingle()

    if (pubError) throw pubError
    if (!pub) {
      return []
    }

    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .eq('publicacion_id', pid)
      .eq('es_visible', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data ?? []
  },

  /**
   * Lista todos los comentarios (visibles u ocultos) de todas las publicaciones (publicadas o borrador).
   * Solo admin. RLS: politica "Admin: Moderacion total" en `comentarios` y lectura completa de `publicaciones`.
   *
   * @returns {Promise<object[]>} Filas con `publicaciones` embebido (id, titulo, slug, tipo, es_publicado).
   */
  verTodosComentariosAdmin: async () => {
    await ensureAdmin()

    const { data, error } = await supabase
      .from('comentarios')
      .select(
        '*, publicaciones ( id, titulo, slug, tipo, es_publicado )'
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  /**
   * Marca el comentario como visible (`es_visible=true`) para el resto de usuarios. Solo admin.
   *
   * @param {{ id: string }} params id UUID del comentario
   * @returns {Promise<object>}
   */
  activarComentarioAdmin: async ({ id }) => {
    return actualizarVisibilidadComentarioAdmin(id, true)
  },

  /**
   * Oculta el comentario (`es_visible=false`) para usuarios no admin. Solo admin.
   *
   * @param {{ id: string }} params id UUID del comentario
   * @returns {Promise<object>}
   */
  desactivarComentarioAdmin: async ({ id }) => {
    return actualizarVisibilidadComentarioAdmin(id, false)
  },

  /**
   * Crea un comentario en una publicacion. Requiere sesion (alumno, maestro, invitado con cuenta, admin).
   * RLS: `auth.uid()` debe coincidir con `perfil_id` (no puedes comentar como otro usuario).
   * Quien no es admin solo puede comentar si la publicacion esta publicada (`es_publicado`, visible por RLS).
   *
   * Nota: usuarios **anon** sin login no pueden insertar con la politica actual de `schema_logic.sql`.
   *
   * @param {ComentarioNuevo} payload
   * @returns {Promise<object>} fila insertada en `comentarios`
   */
  crearComentario: async (payload) => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) throw authError
    if (!user) {
      throw new Error('Debes iniciar sesion para comentar.')
    }

    const publicacionId = String(payload?.publicacion_id ?? '').trim()
    if (!publicacionId) {
      throw new Error('publicacion_id es obligatorio.')
    }

    const contenido = String(payload?.contenido ?? '').trim()
    if (!contenido) {
      throw new Error('El contenido del comentario no puede estar vacio.')
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle()

    if (perfilError) throw perfilError

    const esAdmin = perfil?.rol === 'admin'

    const { data: pub, error: pubError } = await supabase
      .from('publicaciones')
      .select('id, es_publicado')
      .eq('id', publicacionId)
      .maybeSingle()

    if (pubError) throw pubError
    if (!pub) {
      throw new Error(
        'Publicacion no encontrada o no disponible para tu usuario.'
      )
    }

    if (!esAdmin && !pub.es_publicado) {
      throw new Error(
        'Solo se pueden comentar publicaciones publicadas (es_publicado=true).'
      )
    }

    const row = {
      publicacion_id: publicacionId,
      perfil_id: user.id,
      contenido,
      es_visible: payload.es_visible !== undefined ? Boolean(payload.es_visible) : true
    }

    const { data, error } = await supabase
      .from('comentarios')
      .insert([row])
      .select('*')
      .single()

    if (error) throw error
    return data
  }
}
