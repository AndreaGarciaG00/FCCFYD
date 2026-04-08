import supabase from '../supabase.js'

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
  if (String(perfil?.rol || '').trim().toLowerCase() !== 'admin') {
    throw new Error('Acceso denegado: solo admin.')
  }
}

export const divulgacionArticulosService = {
  /** `select('*')` evita 400 si falta alguna columna (p. ej. `descripcion`) en la BD. */
  listarParaSitio: async () => {
    const { data, error } = await supabase
      .from('divulgacion_articulos')
      .select('*')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  listarAdmin: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('divulgacion_articulos')
      .select('*')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  crearAdmin: async (row) => {
    await ensureAdmin()
    const insert = {
      titulo: row.titulo,
      tipo: row.tipo || 'Artículo',
      descripcion: row.descripcion != null ? String(row.descripcion).trim() || null : null,
      archivo_url: row.archivo_url,
      archivo_path: row.archivo_path || null,
      orden: Number(row.orden) || 0,
      es_visible: true,
    }
    if (row.id) insert.id = row.id
    const { data, error } = await supabase.from('divulgacion_articulos').insert([insert]).select('*').single()
    if (error) throw error
    return data
  },

  actualizarAdmin: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('divulgacion_articulos')
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('divulgacion_articulos').delete().eq('id', id)
    if (error) throw error
  },
}
