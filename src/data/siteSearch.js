function normalize(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const BASE_ENTRIES = [
  { page: 'inicio', terms: ['inicio', 'principal', 'portada', 'home', 'fccfyd', 'ujed', 'facultad'] },
  {
    page: 'proyectosInv',
    terms: [
      'proyectos de investigacion',
      'proyectos de investigación',
      'ficha proyecto',
      'catalogo investigacion',
      'catálogo investigación',
      'galeria proyecto',
      'galería proyecto',
    ],
  },
  {
    page: 'proyectos',
    terms: [
      'divulgacion',
      'divulgación',
      'cientifica',
      'científica',
      'proyectos',
      'investigacion',
      'investigación',
      'lineas',
      'líneas',
      'cimohu',
    ],
  },
  {
    page: 'inscripcion',
    terms: ['inscripcion', 'inscripción', 'registro', 'tramite', 'trámite', 'formato', 'asesor'],
  },
  { page: 'eventos', terms: ['publicaciones', 'publicacion', 'eventos', 'congreso', 'jornada', 'actividades'] },
  { page: 'grupo', terms: ['grupo', 'cuerpo', 'academico', 'académico', 'integrantes', 'profesores'] },
  {
    page: 'formularioServicio',
    terms: ['servicio', 'formulario', 'laboratorio', 'coordinacion', 'coordinación', 'social', 'voluntariado'],
  },
  { page: 'instrumentos', terms: ['instrumentos', 'test', 'herramientas', 'opciones'] },
  { page: 'interes', terms: ['interes', 'interés', 'enlaces', 'recursos', 'video', 'videos', 'youtube'] },
  { page: 'login', terms: ['login', 'sesion', 'sesión', 'admin', 'entrar', 'acceso', 'ingresar'] },
  { page: 'registro', terms: ['registrar', 'registrate', 'regístrate', 'crear cuenta', 'signup', 'alta'] },
]

function extraTermsForInstrument(key) {
  switch (key) {
    case 'calculadoraIMC':
      return ['imc', 'masa', 'corporal', 'indice', 'kg']
    case 'moca':
      return ['moca', 'montreal', 'cognitivo', 'cognitiva', 'cognitive', 'demencia', 'memoria']
    case 'seniorFitness':
      return ['senior', 'fitness', 'mayores', 'adulto mayor', 'aptitud fisica', 'física', 'ancianos']
    default:
      return []
  }
}

/**
 * @param {Array<{ key: string, label: string, desc: string }>} instrumentosList
 */
export function getSearchEntries(instrumentosList = []) {
  const instrumentEntries = instrumentosList.map((item) => ({
    page: item.key,
    terms: [
      item.label.toLowerCase(),
      item.desc.toLowerCase(),
      ...extraTermsForInstrument(item.key),
    ],
  }))
  return [...BASE_ENTRIES, ...instrumentEntries]
}

export function resolveSiteSearch(query, entries) {
  const q = normalize(query)
  if (!q.length) return null

  const words = q.split(/\s+/).filter(Boolean)
  let bestPage = null
  let bestScore = 0

  for (const { page, terms } of entries) {
    let score = 0
    for (const t of terms) {
      const tn = normalize(t)
      if (!tn) continue
      if (q === tn) score += 12
      else if (q.includes(tn) || tn.includes(q)) score += 8
      else {
        for (const w of words) {
          if (w.length < 2) continue
          if (tn.includes(w) || w.includes(tn)) score += 3
        }
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestPage = page
    }
  }

  return bestScore >= 3 ? bestPage : null
}
