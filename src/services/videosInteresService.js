import supabase from '../supabase.js'

const ensureAdmin = async () => {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!session?.user) throw new Error('No hay sesion activa.')
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
  if (String(perfil?.rol || '').trim().toLowerCase() !== 'admin') {
    throw new Error('Acceso denegado: solo admin.')
  }
}

function extractYoutubeId(raw) {
  const s = String(raw || '').trim()
  const m =
    s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i) || s.match(/^([\w-]{11})$/)
  return m ? m[1] : ''
}

/** Unifica filas con columnas en inglés o español (y enlaces en URL). */
export function mapVideoRow(row) {
  if (!row) return row
  const title = row.title ?? row.titulo ?? ''
  const description = row.description ?? row.descripcion ?? ''
  let yt = row.youtube_id || row.id_video || row.video_id || ''
  for (const k of ['link_youtube', 'url_video', 'enlace', 'url']) {
    if (!yt && row[k]) yt = extractYoutubeId(row[k])
  }
  if (!yt && /^[\w-]{11}$/.test(String(row.id ?? ''))) yt = String(row.id)
  return { ...row, title, description, youtube_id: String(yt || '').trim() }
}

const orderVideos = (q) =>
  q.order('orden', { ascending: true }).order('created_at', { ascending: false })

function isRlsBlock(err) {
  const st = err?.status ?? err?.statusCode
  if (st === 403 || err?.code === '42501') return true
  const m = String(err?.message || err?.details || '').toLowerCase()
  return (
    m.includes('row-level security') ||
    m.includes('violates row-level') ||
    m.includes('permission denied') ||
    m.includes('rls')
  )
}

function isSchemaMismatch(err) {
  const m = String(err?.message || err?.details || '').toLowerCase()
  return (
    m.includes('column') ||
    m.includes('schema cache') ||
    m.includes('could not find') ||
    String(err?.code || '') === 'PGRST204' ||
    m.includes('invalid input syntax') ||
    m.includes('invalid uuid')
  )
}

function rlsHint() {
  return ' En Supabase → SQL: función public.fccfyd_is_admin() (SECURITY DEFINER) + políticas RLS en videos_interes, y rol admin en public.perfiles.'
}

export const videosInteresService = {
  /**
   * Listado público: no filtrar es_visible en el cliente (NULL debe verse como visible).
   * Quién filtra es RLS (política videos_interes_select_public).
   */
  listarParaSitio: async () => {
    let { data, error } = await orderVideos(supabase.from('videos_interes').select('*'))
    if (error) {
      const plain = await supabase.from('videos_interes').select('*')
      if (plain.error) throw plain.error
      data = plain.data
    }
    return (data ?? []).map(mapVideoRow)
  },

  listarAdmin: async () => {
    await ensureAdmin()
    let { data, error } = await orderVideos(supabase.from('videos_interes').select('*'))
    if (error) {
      const plain = await supabase.from('videos_interes').select('*')
      if (plain.error) throw plain.error
      data = plain.data
    }
    return (data ?? []).map(mapVideoRow)
  },

  crearAdmin: async ({ youtube_id, title, description, orden }) => {
    await ensureAdmin()
    const yt = String(youtube_id || '').trim()
    const t = String(title || '').trim()
    const d = String(description || '').trim()
    const o = Number(orden) || 0
    const watchUrl = `https://www.youtube.com/watch?v=${yt}`
    const shortUrl = `https://youtu.be/${yt}`

    /**
     * Orden: primero filas mínimas (sin es_visible/orden) para tablas manuales sin esas columnas;
     * luego UUID+youtube_id; al final variantes con flags.
     */
    const candidates = [
      { id: yt, title: t, description: d },
      { id: yt, titulo: t, descripcion: d },
      { youtube_id: yt, title: t, description: d },
      { youtube_id: yt, titulo: t, descripcion: d },
      { id_video: yt, titulo: t, descripcion: d },
      { video_id: yt, title: t, description: d },
      { titulo: t, descripcion: d, enlace: shortUrl },
      { titulo: t, descripcion: d, url: shortUrl },
      { titulo: t, descripcion: d, link_youtube: watchUrl },
      { title: t, description: d, url_video: watchUrl },
      { id: yt, title: t, description: d, es_visible: true },
      { id: yt, titulo: t, descripcion: d, es_visible: true },
      { youtube_id: yt, title: t, description: d, es_visible: true },
      { youtube_id: yt, titulo: t, descripcion: d, es_visible: true },
      { id: yt, title: t, description: d, es_visible: true, orden: o },
      { id: yt, titulo: t, descripcion: d, es_visible: true, orden: o },
      { youtube_id: yt, title: t, description: d, es_visible: true, orden: o },
      { youtube_id: yt, titulo: t, descripcion: d, es_visible: true, orden: o },
      { id_video: yt, titulo: t, descripcion: d, es_visible: true, orden: o },
      { video_id: yt, title: t, description: d, es_visible: true, orden: o },
    ]

    let lastErr = null
    for (const payload of candidates) {
      const res = await supabase.from('videos_interes').insert([payload]).select('*').single()
      if (!res.error) return mapVideoRow(res.data)
      lastErr = res.error
      if (isRlsBlock(res.error)) {
        throw new Error(`${res.error.message || res.error}${rlsHint()}`)
      }
      if (String(res.error.code) === '23505') {
        throw new Error('Ese video ya está en la lista (índice único).')
      }
      if (!isSchemaMismatch(res.error)) {
        throw new Error(res.error.message || String(res.error))
      }
    }
    throw new Error(`${lastErr?.message || lastErr || 'No se pudo insertar'}${rlsHint()}`)
  },

  actualizarAdmin: async (id, patch) => {
    await ensureAdmin()
    const withTs = (p) => ({ ...p, updated_at: new Date().toISOString() })

    let { data, error } = await supabase
      .from('videos_interes')
      .update(withTs(patch))
      .eq('id', id)
      .select('*')
      .single()

    if (error && isSchemaMismatch(error) && (patch.title != null || patch.description != null)) {
      const alt = { ...patch }
      if (patch.title != null) {
        alt.titulo = patch.title
        delete alt.title
      }
      if (patch.description != null) {
        alt.descripcion = patch.description
        delete alt.description
      }
      const r2 = await supabase
        .from('videos_interes')
        .update(withTs(alt))
        .eq('id', id)
        .select('*')
        .single()
      data = r2.data
      error = r2.error
    }

    if (error) {
      const r3 = await supabase.from('videos_interes').update(patch).eq('id', id).select('*').single()
      data = r3.data
      error = r3.error
    }

    if (error) throw error
    return mapVideoRow(data)
  },

  eliminarAdmin: async (id) => {
    await ensureAdmin()
    const { error } = await supabase.from('videos_interes').delete().eq('id', id)
    if (error) throw error
  },
}
