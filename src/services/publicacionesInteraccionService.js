import supabase from '../supabase.js'

export const publicacionesInteraccionService = {
  listarReacciones: async (publicacionId) => {
    if (!publicacionId) return []
    const { data, error } = await supabase
      .from('reacciones')
      .select('publicacion_id, perfil_id, created_at')
      .eq('publicacion_id', publicacionId)
      .order('created_at', { ascending: false })
      .limit(2000)
    if (error) throw error
    return data ?? []
  },

  darLike: async (publicacionId, perfilId) => {
    const { error } = await supabase.from('reacciones').insert([{ publicacion_id: publicacionId, perfil_id: perfilId }])
    if (error) throw error
  },

  quitarLike: async (publicacionId, perfilId) => {
    const { error } = await supabase
      .from('reacciones')
      .delete()
      .eq('publicacion_id', publicacionId)
      .eq('perfil_id', perfilId)
    if (error) throw error
  },

  listarComentarios: async (publicacionId) => {
    if (!publicacionId) return []
    const { data, error } = await supabase
      .from('comentarios')
      .select('id, publicacion_id, perfil_id, contenido, created_at')
      .eq('publicacion_id', publicacionId)
      .eq('es_visible', true)
      .order('created_at', { ascending: true })
      .limit(500)
    if (error) throw error
    return data ?? []
  },

  crearComentario: async (publicacionId, perfilId, contenido) => {
    const { data, error } = await supabase
      .from('comentarios')
      .insert([{ publicacion_id: publicacionId, perfil_id: perfilId, contenido }])
      .select('id, publicacion_id, perfil_id, contenido, created_at')
      .single()
    if (error) throw error
    return data
  },
}

