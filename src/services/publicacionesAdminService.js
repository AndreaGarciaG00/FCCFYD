import supabase from '../supabase.js'

const PAGE = 1000

async function listarPublicacionesAdminPaginado(build) {
  const all = []
  let from = 0
  while (true) {
    const to = from + PAGE - 1
    const { data, error } = await build(from, to)
    if (error) throw error
    const chunk = data ?? []
    all.push(...chunk)
    if (chunk.length < PAGE) break
    from += PAGE
  }
  return all
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
  if (perfil?.rol !== 'admin') throw new Error('Acceso denegado: solo admin.')
}

/** Payload listo para insert/update (sin busqueda_vector; lo llena el trigger). */
function sanitizeRow(row) {
  const {
    id: _id,
    busqueda_vector: _bv,
    created_at: _c,
    updated_at: _u,
    ...rest
  } = row
  return rest
}

export const publicacionesAdminService = {
  listarAdmin: async () => {
    await ensureAdmin()
    return listarPublicacionesAdminPaginado((from, to) =>
      supabase.from('publicaciones').select('*').order('fecha_publicacion', { ascending: false }).range(from, to),
    )
  },

  obtenerAdmin: async (id) => {
    await ensureAdmin()
    const { data, error } = await supabase.from('publicaciones').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  crearAdmin: async (row) => {
    await ensureAdmin()
    const payload = sanitizeRow(row)
    const { data, error } = await supabase.from('publicaciones').insert([payload]).select('*').single()
    if (error) throw error
    return data
  },

  actualizarAdmin: async (id, row) => {
    await ensureAdmin()
    const payload = sanitizeRow(row)
    const { data, error } = await supabase
      .from('publicaciones')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  /** Quita comentarios y reacciones ligados, luego la fila (orden seguro sin CASCADE en BD). */
  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error: e1 } = await supabase.from('comentarios').delete().eq('publicacion_id', id)
    if (e1) throw e1
    const { error: e2 } = await supabase.from('reacciones').delete().eq('publicacion_id', id)
    if (e2) throw e2
    const { error: e3 } = await supabase.from('publicaciones').delete().eq('id', id)
    if (e3) throw e3
  },
}
