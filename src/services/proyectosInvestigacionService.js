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
  if (perfil?.rol !== 'admin') {
    throw new Error('Acceso denegado: solo admin puede gestionar proyectos de investigacion.')
  }
}

function slugify(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'proyecto'
}

export function mapProyectoRowToUi(row) {
  const da = row.datos_adicionales && typeof row.datos_adicionales === 'object' ? row.datos_adicionales : {}
  return {
    id: row.id,
    title: row.titulo,
    cat: da.cat || 'General',
    status: row.estado === 'Vigente' ? 'En curso' : 'Planificación',
    icon: da.icon && ['flask', 'chip', 'leaf', 'book'].includes(da.icon) ? da.icon : 'flask',
    desc: da.desc || row.investigador_responsable || '',
    imagen: typeof da.imagen === 'string' && da.imagen.trim() ? da.imagen.trim() : '',
  }
}

function uiToDbInsert(ui) {
  const slug = `${slugify(ui.title)}-${Date.now().toString(36)}`
  return {
    slug,
    titulo: ui.title.trim(),
    investigador_responsable: ui.desc?.trim() || 'Coordinación de investigación',
    estado: ui.status === 'En curso' ? 'Vigente' : 'Concluido',
    fechas: {},
    informacion_institucional: {},
    financiamiento: {},
    colaboradores: [],
    contenido_dinamico: [],
    config_visibilidad: {},
    datos_adicionales: {
      cat: ui.cat?.trim() || 'General',
      icon: ui.icon || 'flask',
      desc: ui.desc?.trim() || '',
      ...(ui.imagen?.trim() ? { imagen: ui.imagen.trim() } : {}),
    },
    es_publicado: true,
    orden: 0,
  }
}

function uiToDbUpdate(ui, prevRow) {
  const prevDa =
    prevRow?.datos_adicionales && typeof prevRow.datos_adicionales === 'object'
      ? prevRow.datos_adicionales
      : {}
  return {
    titulo: ui.title.trim(),
    investigador_responsable:
      ui.desc?.trim() || prevRow?.investigador_responsable || 'Coordinación de investigación',
    estado: ui.status === 'En curso' ? 'Vigente' : 'Concluido',
    datos_adicionales: {
      ...prevDa,
      cat: ui.cat?.trim() || 'General',
      icon: ui.icon || 'flask',
      desc: ui.desc?.trim() || '',
      ...(ui.imagen !== undefined
        ? { imagen: ui.imagen?.trim() || '' }
        : {}),
    },
    es_publicado: true,
  }
}

export const proyectosInvestigacionService = {
  listarParaSitio: async () => {
    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .select('*')
      .eq('es_publicado', true)
      .order('orden', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapProyectoRowToUi)
  },

  listarTodosAdmin: async () => {
    await ensureAdmin()
    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .select('*')
      .order('orden', { ascending: true })

    if (error) throw error
    return (data ?? []).map(mapProyectoRowToUi)
  },

  /** @param {{ title: string, cat?: string, status: string, icon: string, desc?: string }} ui */
  crearAdmin: async (ui) => {
    await ensureAdmin()
    const row = uiToDbInsert(ui)
    const { data, error } = await supabase.from('proyectos_investigacion').insert([row]).select('*').single()

    if (error) throw error
    return mapProyectoRowToUi(data)
  },

  /** @param {string} id uuid */
  actualizarAdmin: async (id, ui) => {
    await ensureAdmin()
    const { data: prev, error: prevErr } = await supabase
      .from('proyectos_investigacion')
      .select('*')
      .eq('id', id)
      .single()

    if (prevErr) throw prevErr

    const patch = uiToDbUpdate(ui, prev)
    const { data, error } = await supabase
      .from('proyectos_investigacion')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return mapProyectoRowToUi(data)
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('proyectos_investigacion').delete().eq('id', id)
    if (error) throw error
  },
}
