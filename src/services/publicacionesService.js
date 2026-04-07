import supabase from '../supabase.js'

const PAGE = 1000

async function listarPublicacionesPaginado(build) {
  const all = []
  let from = 0
  while (true) {
    const to = from + PAGE - 1
    const { data, error } = await build(from, to)
    if (error) throw error
    const chunk = data ?? []
    all.push(...chunk)
    if (chunk.length < PAGE) break
    from += PAGE
  }
  return all
}

/** Listado público: solo filas publicadas (RLS). Trae todas las páginas. */
export const publicacionesService = {
  listarPublicas: async () =>
    listarPublicacionesPaginado((from, to) =>
      supabase
        .from('publicaciones')
        .select('*')
        .eq('es_publicado', true)
        .order('fecha_publicacion', { ascending: false })
        .range(from, to),
    ),
}
