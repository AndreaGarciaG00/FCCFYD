import supabase from '../supabase.js'

/**
 * @typedef {Object} ReaccionLike
 * @property {string} publicacion_id
 * @property {string} perfil_id
 * @property {string|null} [created_at]
 */

const ensureAuthenticated = async () => {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) {
    throw new Error('Debes iniciar sesion para dar o quitar like.')
  }
  return user
}

/**
 * Comprueba que la publicacion exista y (si no es admin) este publicada.
 * @param {string} publicacionId
 * @param {string} userId
 */
const assertPublicacionPermiteReaccion = async (publicacionId, userId) => {
  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', userId)
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
    throw new Error('Publicacion no encontrada o no disponible para tu usuario.')
  }

  if (!esAdmin && !pub.es_publicado) {
    throw new Error(
      'Solo puedes reaccionar en publicaciones publicadas (es_publicado=true).'
    )
  }
}

export const reactionService = {
  /**
   * Registra un like del usuario actual en la publicacion (una fila en `reacciones`).
   * Idempotente: si ya habia like, devuelve la fila existente sin error.
   * RLS: `perfil_id` debe ser `auth.uid()`.
   *
   * @param {{ publicacionId: string }} params
   * @returns {Promise<{ reaccion: ReaccionLike, creado: boolean }>}
   */
  darLikePublicacion: async ({ publicacionId }) => {
    const user = await ensureAuthenticated()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) {
      throw new Error('publicacionId es obligatorio.')
    }

    await assertPublicacionPermiteReaccion(pid, user.id)

    const { data: ya, error: selErr } = await supabase
      .from('reacciones')
      .select('*')
      .eq('publicacion_id', pid)
      .eq('perfil_id', user.id)
      .maybeSingle()

    if (selErr) throw selErr
    if (ya) {
      return { reaccion: ya, creado: false }
    }

    const { data, error } = await supabase
      .from('reacciones')
      .insert({ publicacion_id: pid, perfil_id: user.id })
      .select('*')
      .single()

    if (error) throw error
    return { reaccion: data, creado: true }
  },

  /**
   * Elimina el like del usuario actual en esa publicacion.
   * RLS: solo puedes borrar tu propia reaccion (`perfil_id = auth.uid()`).
   *
   * @param {{ publicacionId: string }} params
   * @returns {Promise<{ eliminado: boolean, reaccion?: ReaccionLike }>}
   */
  quitarLikePublicacion: async ({ publicacionId }) => {
    const user = await ensureAuthenticated()

    const pid = String(publicacionId ?? '').trim()
    if (!pid) {
      throw new Error('publicacionId es obligatorio.')
    }

    const { data, error } = await supabase
      .from('reacciones')
      .delete()
      .eq('publicacion_id', pid)
      .eq('perfil_id', user.id)
      .select('*')
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return { eliminado: false }
    }
    return { eliminado: true, reaccion: data }
  }
}
