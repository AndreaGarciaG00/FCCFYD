import supabase from '../supabase.js'

export const servicioSocialService = {
  enviarRegistro: async ({ perfilId, semestre, grupo, datosExtra }) => {
    const payload = {
      perfil_id: perfilId,
      semestre,
      grupo,
      datos_extra: datosExtra || {},
    }
    const { data, error } = await supabase
      .from('servicio_social_registros')
      .insert([payload])
      .select('*')
      .single()
    if (error) throw error
    return data
  },
}

