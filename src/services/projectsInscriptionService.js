import supabase from '../supabase.js'

/**
 * @typedef {Object} FormatoInscripcionNuevo
 * @property {string} titulo
 * @property {string} [descripcion]
 * @property {string} [categoria]
 * @property {string|null} [file_url]
 * @property {string|null} [file_size]
 * @property {string|null} [file_path]
 * @property {number} [orden]
 * @property {boolean} [es_descargable]
 * @property {boolean} [es_visible]
 * @property {Record<string, any>} [datos_adicionales]
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
    throw new Error('Acceso denegado: solo admin puede crear formatos de inscripcion.')
  }
}

const INSCRIPCION_PDF_MAX_BYTES = 10 * 1024 * 1024
const INSCRIPCION_PDF_MIME = 'application/pdf'

export const projectsInscriptionService = {
  /**
   * Lista formatos visibles de inscripcion de proyectos.
   * Disponible para admin, usuarios autenticados y no autenticados.
   * @returns {Promise<object[]>}
   */
  verFormatosInscripcionVisibles: async () => {
    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .select('*')
      .eq('es_visible', true)
      .order('orden', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  },

  /**
   * Crea un formato de inscripcion de proyectos. Solo admin.
   * @param {FormatoInscripcionNuevo} payload
   * @returns {Promise<object>}
   */
  crearFormatoInscripcionAdmin: async (payload) => {
    await ensureAdmin()

    if (!payload?.titulo || !payload.titulo.trim()) {
      throw new Error('El campo titulo es obligatorio.')
    }

    const row = {
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion ?? null,
      categoria: payload.categoria ?? 'General',
      file_url: payload.file_url ?? null,
      file_size: payload.file_size ?? null,
      file_path: payload.file_path ?? null,
      orden: payload.orden ?? 0,
      es_descargable: payload.es_descargable ?? false,
      es_visible: payload.es_visible ?? true,
      datos_adicionales: payload.datos_adicionales ?? {}
    }

    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .insert([row])
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Edita un formato de inscripcion de proyectos. Solo admin.
   * @param {{ id: string, updates: Partial<FormatoInscripcionNuevo> }} params
   * @returns {Promise<object>}
   */
  editarFormatoInscripcionAdmin: async ({ id, updates }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del formato a editar.')
    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('Debes enviar al menos un campo para actualizar.')
    }

    const allowedKeys = [
      'titulo',
      'descripcion',
      'categoria',
      'file_url',
      'file_size',
      'file_path',
      'orden',
      'es_descargable',
      'es_visible',
      'datos_adicionales'
    ]

    const sanitized = {}
    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(updates, key)) {
        sanitized[key] = updates[key]
      }
    }

    if (Object.keys(sanitized).length === 0) {
      throw new Error('No hay campos validos para actualizar.')
    }

    if (
      Object.prototype.hasOwnProperty.call(sanitized, 'titulo') &&
      (!sanitized.titulo || !String(sanitized.titulo).trim())
    ) {
      throw new Error('El campo titulo no puede quedar vacio.')
    }

    if (Object.prototype.hasOwnProperty.call(sanitized, 'titulo')) {
      sanitized.titulo = String(sanitized.titulo).trim()
    }

    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .update(sanitized)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  /**
   * Borra un formato de inscripcion solo si no es visible (es_visible = false). Solo admin.
   * @param {{ id: string }} params
   * @returns {Promise<object>}
   */
  borrarFormatoInscripcionNoVisibleAdmin: async ({ id }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del formato a borrar.')

    const { data, error } = await supabase
      .from('inscripcion_proyectos')
      .delete()
      .eq('id', id)
      .eq('es_visible', false)
      .select('*')
      .limit(1)

    if (error) throw error
    if (!data || data.length === 0) {
      throw new Error(
        'No se pudo borrar: el formato no existe o sigue marcado como visible.'
      )
    }

    return data[0]
  },

  /**
   * Sube/reemplaza el PDF del formato en bucket "inscripcion_proyectos"
   * y guarda file_path + file_url en la tabla.
   * @param {{ id: string, file: File }} params
   * @returns {Promise<object>}
   */
  subirPdfFormatoAdmin: async ({ id, file }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del formato.')
    if (!file) throw new Error('Debes enviar un archivo PDF.')
    if (file.type !== INSCRIPCION_PDF_MIME) {
      throw new Error('Tipo no permitido. Solo application/pdf.')
    }
    if (file.size > INSCRIPCION_PDF_MAX_BYTES) {
      throw new Error('El archivo excede el limite de 10 MB.')
    }

    const { data: formato, error: formatoError } = await supabase
      .from('inscripcion_proyectos')
      .select('id, file_path')
      .eq('id', id)
      .single()

    if (formatoError) throw formatoError

    const oldPath = formato?.file_path ?? null
    const newPath = `pdf/${id}/formato-${Date.now()}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('inscripcion_proyectos')
      .upload(newPath, file, {
        contentType: INSCRIPCION_PDF_MIME,
        cacheControl: '3600',
        upsert: false
      })
    if (uploadError) throw uploadError

    const {
      data: { publicUrl }
    } = supabase.storage.from('inscripcion_proyectos').getPublicUrl(newPath)

    const { data: updated, error: updateError } = await supabase
      .from('inscripcion_proyectos')
      .update({
        file_path: newPath,
        file_url: publicUrl,
        file_size: `${Math.ceil(file.size / 1024)} KB`,
        es_descargable: true
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) {
      await supabase.storage.from('inscripcion_proyectos').remove([newPath])
      throw updateError
    }

    if (oldPath && oldPath !== newPath) {
      await supabase.storage.from('inscripcion_proyectos').remove([oldPath])
    }

    return updated
  },

  /**
   * Alias semantico para reemplazar PDF de formato.
   * @param {{ id: string, file: File }} params
   * @returns {Promise<object>}
   */
  actualizarPdfFormatoAdmin: async ({ id, file }) => {
    return projectsInscriptionService.subirPdfFormatoAdmin({ id, file })
  },

  /**
   * Borra el PDF del formato: elimina objeto en storage y limpia file_path/file_url/file_size.
   * @param {{ id: string }} params
   * @returns {Promise<object>}
   */
  borrarPdfFormatoAdmin: async ({ id }) => {
    await ensureAdmin()

    if (!id) throw new Error('Debes enviar el id del formato.')

    const { data: formato, error: formatoError } = await supabase
      .from('inscripcion_proyectos')
      .select('id, file_path')
      .eq('id', id)
      .single()

    if (formatoError) throw formatoError

    const oldPath = formato?.file_path ?? null
    if (oldPath) {
      const { error: removeError } = await supabase.storage
        .from('inscripcion_proyectos')
        .remove([oldPath])
      if (removeError) throw removeError
    }

    const { data: updated, error: updateError } = await supabase
      .from('inscripcion_proyectos')
      .update({
        file_path: null,
        file_url: null,
        file_size: null,
        es_descargable: false
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return updated
  }
}
