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

export const comentariosAdminService = {
  listarAdmin: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('comentarios')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(300)
    if (error) throw error
    return data ?? []
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('comentarios').delete().eq('id', id)
    if (error) throw error
  },
}
