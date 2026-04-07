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

export const inscripcionProyectosService = {
  /** Pasos y documentos visibles en la página pública (sin sesión admin). */
  listarParaSitio: async () => {
    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .select('*')
      .eq('es_visible', true)
      .order('orden', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  listarAdmin: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .select('*')
      .order('orden', { ascending: true })
    if (error) throw error
    return data ?? []
  },

  crearAdmin: async (row) => {
    await ensureAdmin()
    const { data, error } = await supabase.from('inscripcion_proyectos').insert([row]).select('*').single()
    if (error) throw error
    return data
  },

  actualizarAdmin: async (id, patch) => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('inscripcion_proyectos').delete().eq('id', id)
    if (error) throw error
  },
}
