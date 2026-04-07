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

export const evaluacionesAdminService = {
  listarConfig: async () => {
    await ensureAdmin()
    const { data, error } = await supabase.from('evaluaciones_config').select('*').order('nombre')
    if (error) throw error
    return data ?? []
  },

  crearConfig: async (row) => {
    await ensureAdmin()
    const { data, error } = await supabase.from('evaluaciones_config').insert([row]).select('*').single()
    if (error) throw error
    return data
  },

  actualizarConfig: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('evaluaciones_config')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  eliminarConfig: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('evaluaciones_config').delete().eq('id', id)
    if (error) throw error
  },

  listarRangos: async (evaluacionId) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('evaluaciones_rangos')
      .select('*')
      .eq('evaluacion_id', evaluacionId)
      .order('puntaje_min')
    if (error) throw error
    return data ?? []
  },

  crearRango: async (row) => {
    await ensureAdmin()
    const { data, error } = await supabase.from('evaluaciones_rangos').insert([row]).select('*').single()
    if (error) throw error
    return data
  },

  actualizarRango: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('evaluaciones_rangos')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  eliminarRango: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('evaluaciones_rangos').delete().eq('id', id)
    if (error) throw error
  },

  listarResultados: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('evaluaciones_resultados')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return data ?? []
  },
}
