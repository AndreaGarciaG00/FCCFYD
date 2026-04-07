import supabase from '../supabase.js'

/**
 * @typedef {Object} AccessCodeFilters
 * @property {'ALUMNOS'|'MAESTROS'|'INVITADO'} [tipo]
 * @property {boolean} [es_activo]
 * @property {string} [email_especifico]
 * @property {string} [descripcion]
 * @property {string|Date} [fecha_expiracion]
 */

const ensureAdmin = async () => {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) throw authError
  if (!user) throw new Error('No hay sesion activa.')

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  if (perfilError) throw perfilError
  if (perfil?.rol !== 'admin') {
    throw new Error('Acceso denegado: solo admin puede filtrar codigos de acceso.')
  }
}

const pickEditableFields = (payload = {}) => {
  const allowedFields = [
    'tipo',
    'descripcion',
    'dominio_permitido',
    'email_especifico',
    'uso_maximo',
    'fecha_expiracion',
    'rol_a_asignar',
    'es_activo'
  ]

  const updates = {}
  for (const key of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      updates[key] = payload[key]
    }
  }

  return updates
}

export const accessCodeService = {
  // Funcion para crear un nuevo codigo de acceso (solo admin; misma política que listar)
  crearCodigoAcceso: async (formDatos) => {
    await ensureAdmin()

    const emailInvitado =
      formDatos.tipo === 'INVITADO' && formDatos.email?.trim()
        ? formDatos.email.trim()
        : null

    const { data, error } = await supabase
      .from('codigo_acceso')
      .insert([
        {
          codigo: formDatos.codigo,
          tipo: formDatos.tipo,
          rol_a_asignar: formDatos.rol,
          dominio_permitido: formDatos.dominioPermitido?.trim() || null,
          email_especifico: emailInvitado,
          descripcion: formDatos.descripcion || null,
          uso_maximo: formDatos.usoMaximo ?? -1,
          fecha_expiracion: formDatos.fechaExp || '2026-12-31T23:59:59+00:00',
        },
      ])
      .select()

    if (error) throw error
    return data
  },

  // Funcion para ver todos los codigos de acceso (solo admin)
  verCodigos: async () => {
    await ensureAdmin()

    const { data, error } = await supabase
      .from('codigo_acceso')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Funcion TypeScript-style (via JSDoc) para filtrar codigos de acceso.
   * Solo admin puede ejecutar este filtro.
   * @param {AccessCodeFilters} filtros
   */
  filtrarCodigosAdmin: async (filtros = {}) => {
    await ensureAdmin()

    let query = supabase
      .from('codigo_acceso')
      .select('*')
      .order('created_at', { ascending: false })

    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo)
    }

    if (typeof filtros.es_activo === 'boolean') {
      query = query.eq('es_activo', filtros.es_activo)
    }

    if (filtros.email_especifico) {
      query = query.ilike('email_especifico', `%${filtros.email_especifico}%`)
    }

    if (filtros.descripcion) {
      query = query.ilike('descripcion', `%${filtros.descripcion}%`)
    }

    if (filtros.fecha_expiracion) {
      const fechaIso = new Date(filtros.fecha_expiracion).toISOString()
      query = query.lte('fecha_expiracion', fechaIso)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * Desactiva un codigo de acceso (es_activo = false).
   * Solo admin puede ejecutar esta accion.
   * @param {{ id?: string, codigo?: string }} params
   */
  desactivarCodigoAdmin: async ({ id, codigo }) => {
    await ensureAdmin()

    if (!id && !codigo) {
      throw new Error('Debes enviar id o codigo para desactivar.')
    }

    let query = supabase
      .from('codigo_acceso')
      .update({ es_activo: false })
      .select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('codigo', codigo)
    }

    const { data, error } = await query.limit(1)
    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('No se encontro el codigo de acceso a desactivar.')
    }

    return data[0]
  },

  /**
   * Activa un codigo de acceso previamente desactivado (es_activo = true).
   * Solo admin puede ejecutar esta accion.
   * @param {{ id?: string, codigo?: string }} params
   */
  activarCodigoAdmin: async ({ id, codigo }) => {
    await ensureAdmin()

    if (!id && !codigo) {
      throw new Error('Debes enviar id o codigo para activar.')
    }

    let query = supabase
      .from('codigo_acceso')
      .update({ es_activo: true })
      .eq('es_activo', false)
      .select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('codigo', codigo)
    }

    const { data, error } = await query.limit(1)
    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('No se encontro un codigo desactivado para activar.')
    }

    return data[0]
  },

  /**
   * Borra un codigo de acceso solo si ya esta desactivado.
   * Solo admin puede ejecutar esta accion.
   * @param {{ id?: string, codigo?: string }} params
   */
  borrarCodigoDesactivadoAdmin: async ({ id, codigo }) => {
    await ensureAdmin()

    if (!id && !codigo) {
      throw new Error('Debes enviar id o codigo para borrar.')
    }

    let query = supabase
      .from('codigo_acceso')
      .delete()
      .eq('es_activo', false)
      .select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('codigo', codigo)
    }

    const { data, error } = await query.limit(1)
    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('No se pudo borrar: el codigo no existe o aun esta activo.')
    }

    return data[0]
  },

  /**
   * Edita un codigo de acceso (solo admin).
   * Permite editar por id o por codigo.
   * @param {{ id?: string, codigo?: string, updates: Record<string, any> }} params
   */
  editarCodigoAdmin: async ({ id, codigo, updates }) => {
    await ensureAdmin()

    if (!id && !codigo) {
      throw new Error('Debes enviar id o codigo para editar.')
    }

    const sanitizedUpdates = pickEditableFields(updates)
    if (Object.keys(sanitizedUpdates).length === 0) {
      throw new Error('No hay campos editables para actualizar.')
    }

    let query = supabase
      .from('codigo_acceso')
      .update(sanitizedUpdates)
      .select('*')

    if (id) {
      query = query.eq('id', id)
    } else {
      query = query.eq('codigo', codigo)
    }

    const { data, error } = await query.limit(1)
    if (error) throw error

    if (!data || data.length === 0) {
      throw new Error('No se encontro el codigo de acceso para editar.')
    }

    return data[0]
  }
}