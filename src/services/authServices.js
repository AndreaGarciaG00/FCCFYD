import supabase from '../supabase.js'

export const authService = {
  // Función para Iniciar Sesión
  login: async (/*Datos que vienen del frontend*/email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data // Aquí viene el user y la session (el token)
  },

  // Función para Cerrar Sesión
  logout: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Función para obtener el usuario actual
  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  //Funcion para registrarse
  signUp: async (email, password, nombres, apellidos, matricula, codigo) => {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
        // Todo lo que pongas aquí dentro llega al Trigger 
        // como NEW.raw_user_meta_data
        data: {
            nombres: nombres,
            apellidos: apellidos,
            matricula: matricula, // Si es invitado o maestro, puedes mandar string vacío o null
            codigo: codigo        // ¡El código de acceso es vital!
        }
        }
    })
    
    if (error) throw error
    return data
  }
}