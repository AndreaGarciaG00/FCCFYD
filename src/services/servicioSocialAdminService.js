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
  if (perfil?.rol !== 'admin') throw new Error('Acceso denegado: solo admin.')
}

export const servicioSocialAdminService = {
  listarConfig: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('servicio_social_config')
      .select('*')
      .order('orden', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  actualizarConfig: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('servicio_social_config')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  crearConfig: async (row) => {
    await ensureAdmin()
    const { data, error } = await supabase.from('servicio_social_config').insert([row]).select('*').single()
    if (error) throw error
    return data
  },

  listarRegistros: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('servicio_social_registros')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  actualizarRegistro: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('servicio_social_registros')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },
}
