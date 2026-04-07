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

export const videosInteresService = {
  listarParaSitio: async () => {
    const { data, error } = await supabase
      .from('videos_interes')
      .select('id, title, description, orden, es_visible')
      .eq('es_visible', true)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  listarAdmin: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('videos_interes')
      .select('id, title, description, orden, es_visible')
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  crearAdmin: async ({ id, title, description }) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('videos_interes')
      .insert([
        {
          id,
          title,
          description: description || '',
          es_visible: true,
        },
      ])
      .select('id, title, description, orden, es_visible')
      .single()
    if (error) throw error
    return data
  },

  actualizarAdmin: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('videos_interes')
      .update(patch)
      .eq('id', id)
      .select('id, title, description, orden, es_visible')
      .single()
    if (error) throw error
    return data
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('videos_interes').delete().eq('id', id)
    if (error) throw error
  },
}

