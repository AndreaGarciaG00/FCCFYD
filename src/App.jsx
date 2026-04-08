import { useState, useRef, useMemo, useEffect, useCallback, memo } from 'react'
import { createPortal } from 'react-dom'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import DetailModal from './components/DetailModal.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Interes from './pages/Interes.jsx'
import Eventos from './pages/Eventos.jsx'
import PublicacionDetallePage from './pages/PublicacionDetallePage.jsx'
import CuerpoAcademico from './pages/CuerpoAcademico.jsx'
import IntegranteDetallePage from './pages/IntegranteDetallePage.jsx'
import DivulgacionCientifica from './pages/DivulgacionCientifica.jsx'
import ProyectosInvestigacion from './pages/ProyectosInvestigacion.jsx'
import ProyectoInvestigacionDetalle from './pages/ProyectoInvestigacionDetalle.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import InstrumentoDetail from './components/InstrumentoDetail.jsx'
import { INSTRUMENTOS_LIST as INITIAL_INSTRUMENTOS } from './data/instrumentos.js'
import { getSearchEntries, resolveSiteSearch } from './data/siteSearch.js'
import { EVENTOS_STATIC } from './data/eventosStatic.js'
import supabase from './supabase.js'
import { authService } from './services/authServives.js'
import { profileService, rolEsAdmin } from './services/profileService.js'
import { docentesService } from './services/docentesService.js'
import {
  proyectosInvestigacionService,
  emptyProyectoAdminForm,
  proyectoRowToAdminForm,
  mapProyectoDetalleUi,
} from './services/proyectosInvestigacionService.js'
import { accessCodeService } from './services/accessCodeService.js'
import { uploadPublicFile, removePublicFile, fixPublicStorageUrl } from './services/storageService.js'
import { inscripcionProyectosService } from './services/inscripcionProyectosService.js'
import { servicioSocialAdminService } from './services/servicioSocialAdminService.js'
import { evaluacionesAdminService } from './services/evaluacionesAdminService.js'
import { comentariosAdminService } from './services/comentariosAdminService.js'
import { publicacionesAdminService } from './services/publicacionesAdminService.js'
import { publicacionesService } from './services/publicacionesService.js'
import { reaccionesAdminService } from './services/reaccionesAdminService.js'
import { servicioSocialService } from './services/servicioSocialService.js'
import { videosInteresService } from './services/videosInteresService.js'
import { divulgacionArticulosService } from './services/divulgacionArticulosService.js'
import {
  emptyFormDocente,
  docenteRowToForm,
  emptyFormInscripcion,
  inscripcionRowToForm,
  emptyFormPerfil,
  perfilRowToForm,
  emptyFormPublicacion,
  publicacionRowToForm,
} from './utils/adminForms.js'
import { docenteRowToIntegranteUi } from './utils/integrantesMap.js'

import {
  HERO_CUERPO_ACADEMICO,
  HERO_DIVULGACION,
  HERO_INSCRIPCION,
  HERO_INTERES,
  HERO_PROYECTOS_INV,
  HERO_PUBLICACION_DETALLE,
  HERO_PUBLICACIONES,
} from './data/pageHeroImages.js'

function parseYoutubeId(raw) {
  const s = String(raw || '').trim()
  const m =
    s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i) || s.match(/^([\w-]{11})$/)
  return m ? m[1] : ''
}

const COVER = (seed) => `https://picsum.photos/seed/fccfyd-div-${seed}/480/320`
const INITIAL_PROYECTOS = [
  {
    id: '1',
    title: 'Innovación en Biotecnología',
    cat: 'Ciencias de la Salud',
    status: 'En curso',
    icon: 'flask',
    desc: 'Líneas de investigación y proyectos activos en esta área.',
    imagen: COVER('bio'),
  },
  {
    id: '2',
    title: 'Inteligencia Artificial Aplicada',
    cat: 'Tecnología',
    status: 'En curso',
    icon: 'chip',
    desc: 'Líneas de investigación y proyectos activos en esta área.',
    imagen: COVER('ia'),
  },
  {
    id: '3',
    title: 'Sostenibilidad Ambiental',
    cat: 'Ciencias Ambientales',
    status: 'En curso',
    icon: 'leaf',
    desc: 'Líneas de investigación y proyectos activos en esta área.',
    imagen: COVER('eco'),
  },
  {
    id: '4',
    title: 'Educación e Innovación Pedagógica',
    cat: 'Ciencias de la Educación',
    status: 'Planificación',
    icon: 'book',
    desc: 'Líneas de investigación y proyectos activos en esta área.',
    imagen: COVER('edu'),
  },
]

const INITIAL_INTEGRANTES = [
  { id: '1', nombre: 'Dr. Mario Villarreal', rol: 'Coordinación de investigación', disciplina: 'FCCFyD' },
  { id: '2', nombre: 'Dr. Jesús Gallegos', rol: 'Cuerpo académico', disciplina: 'FCCFyD' },
  { id: '3', nombre: 'Dra. Brenda Rodríguez', rol: 'Cuerpo académico', disciplina: 'FCCFyD' },
]

const OFFICE_ONLINE_EMBED = 'https://view.officeapps.live.com/op/embed.aspx?src='

function inscripcionPdfViewerUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    u.hash = 'toolbar=0&navpanes=0&view=FitH'
    return u.toString()
  } catch {
    return url.includes('#') ? url : `${url}#toolbar=0&navpanes=0`
  }
}

function inscripcionFilePreviewKind(fileUrl) {
  if (!fileUrl) return 'other'
  let path = ''
  try {
    path = new URL(fileUrl).pathname
  } catch {
    path = String(fileUrl)
  }
  const last = path.split('/').pop() || path
  const base = last.split('?')[0].toLowerCase()
  if (base.endsWith('.pdf')) return 'pdf'
  if (/\.(png|jpe?g|gif|webp)$/i.test(base)) return 'image'
  if (base.endsWith('.docx') || base.endsWith('.doc')) return 'word'
  return 'other'
}

function publicacionToEventoUi(row) {
  const extra = row?.datos_adicionales && typeof row.datos_adicionales === 'object' ? row.datos_adicionales : {}
  const links = row?.links && typeof row.links === 'object' ? row.links : {}
  const galeria = Array.isArray(row?.galeria) ? row.galeria : []
  const galeriaClean = galeria.map((u) => String(u).trim()).filter(Boolean)
  const fechaBase = row?.fecha_publicacion ? new Date(row.fecha_publicacion) : null
  const fechaISO =
    fechaBase && !Number.isNaN(fechaBase.getTime())
      ? fechaBase.toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  return {
    id: row?.id || row?.slug || `${fechaISO}-${String(row?.titulo || '').slice(0, 12)}`,
    titulo: String(row?.titulo || '').trim() || 'Publicación',
    fechaISO,
    hora: String(extra?.hora || row?.config_ui?.hora || '').trim() || '',
    lugar: String(extra?.lugar || row?.config_ui?.lugar || '').trim() || '',
    badge: String(extra?.badge || row?.tipo || 'Publicación').trim() || 'Publicación',
    imagen: galeriaClean[0] || null,
    galeria: galeriaClean,
    resumen: String(extra?.resumen || row?.cuerpo_texto || '').trim(),
    linkLabel: String(links?.label || '').trim() || null,
    linkUrl: String(links?.url || '').trim() || null,
  }
}

function inscripcionDownloadFilename(fileUrl, titulo, kind) {
  try {
    const seg = decodeURIComponent(new URL(fileUrl).pathname.split('/').pop() || '')
    const clean = seg.split('?')[0]
    if (clean && /\.[a-z0-9]{2,5}$/i.test(clean)) return clean
  } catch {
    /* ignore */
  }
  const base =
    String(titulo || 'documento')
      .replace(/[<>:"/\\|?*\u0000-\u001f]+/g, '')
      .trim() || 'documento'
  if (kind === 'pdf') return `${base}.pdf`
  if (kind === 'word') return `${base}.docx`
  if (kind === 'image') return `${base}.jpg`
  return base
}

function emptyFormArticulo() {
  return {
    titulo: '',
    descripcion: '',
    archivo_url: '',
    archivo_path: '',
    orden: '0',
  }
}

async function inscripcionFetchAndSave(url, filename) {
  const res = await fetch(url, { mode: 'cors', credentials: 'omit' })
  if (!res.ok) throw new Error('fetch failed')
  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  try {
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

function InscripcionDocDownloadIcon() {
  return (
    <svg
      className="inscripcion-doc-download-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m8 11 4 4 4-4" />
      <path d="M4 21h16" />
    </svg>
  )
}

function InscripcionPublicDocCard({ row, index, fileUrlFixed }) {
  const hasFile = Boolean(row.file_url && fileUrlFixed)
  const kind = hasFile ? inscripcionFilePreviewKind(fileUrlFixed) : 'other'
  const descargable = row.es_descargable !== false
  const labelAction = descargable ? 'Descargar' : 'Abrir'
  const [dlBusy, setDlBusy] = useState(false)
  const [dlHint, setDlHint] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const [modalShowFrame, setModalShowFrame] = useState(false)
  const [modalFrameLoaded, setModalFrameLoaded] = useState(false)

  const officeEmbedSrc =
    kind === 'word' && fileUrlFixed ? `${OFFICE_ONLINE_EMBED}${encodeURIComponent(fileUrlFixed)}` : ''

  useEffect(() => {
    if (!dlHint) return
    const t = window.setTimeout(() => setDlHint(''), 9000)
    return () => window.clearTimeout(t)
  }, [dlHint])

  useEffect(() => {
    if (!previewOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [previewOpen])

  useEffect(() => {
    if (!previewOpen) {
      setModalShowFrame(false)
      setModalFrameLoaded(false)
      return
    }
    if (kind === 'other') {
      setModalShowFrame(true)
      setModalFrameLoaded(true)
      return
    }
    setModalFrameLoaded(false)
    const t = window.setTimeout(() => setModalShowFrame(true), 100)
    return () => window.clearTimeout(t)
  }, [previewOpen, kind])

  const handleAction = useCallback(async () => {
    if (!fileUrlFixed) return
    setDlHint('')
    if (!descargable) {
      window.open(fileUrlFixed, '_blank', 'noopener,noreferrer')
      return
    }
    setDlBusy(true)
    try {
      const filename = inscripcionDownloadFilename(fileUrlFixed, row.titulo, kind)
      await inscripcionFetchAndSave(fileUrlFixed, filename)
    } catch {
      setDlHint('No se pudo abrir el cuadro de guardado. Se abrió el archivo en una pestaña; usá “Guardar como” del navegador.')
      window.open(fileUrlFixed, '_blank', 'noopener,noreferrer')
    } finally {
      setDlBusy(false)
    }
  }, [descargable, fileUrlFixed, row.titulo, kind])

  const openPreview = useCallback(() => {
    if (hasFile) setPreviewOpen(true)
  }, [hasFile])

  return (
    <>
      <div className={`paso-card paso-card--inscripcion${hasFile ? ' paso-card--inscripcion-con-archivo' : ''}`}>
        <div className="paso-card-info">
          <span className="paso-num">{index + 1}</span>
          <div className="paso-body">
            <p className="paso-texto">{row.titulo}</p>
            {row.descripcion ? <p className="paso-desc">{row.descripcion}</p> : null}
          </div>
        </div>
        {hasFile ? (
          <div className="paso-card-doc">
            <div
              role="button"
              tabIndex={0}
              className={`paso-doc-preview paso-doc-preview--openable${kind === 'image' ? ' paso-doc-preview--has-image' : ''}`}
              onClick={openPreview}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  openPreview()
                }
              }}
              aria-label={`Ver vista previa: ${row.titulo}`}
            >
              {kind === 'image' ? (
                <>
                  <img
                    src={fileUrlFixed}
                    alt=""
                    className="inscripcion-doc-preview-img inscripcion-doc-preview-img--card"
                    loading="lazy"
                  />
                  <span className="paso-doc-preview-ribbon">Ampliar</span>
                </>
              ) : null}
              {kind === 'pdf' ? (
                <>
                  <div className="paso-doc-preview-frame">
                    <iframe
                      title={`Vista previa breve: ${row.titulo}`}
                      src={inscripcionPdfViewerUrl(fileUrlFixed)}
                      className="inscripcion-doc-preview-iframe inscripcion-doc-preview-iframe--card"
                      loading="lazy"
                      tabIndex={-1}
                    />
                  </div>
                  <span className="paso-doc-preview-ribbon">Ampliar</span>
                </>
              ) : null}
              {kind === 'word' ? (
                <>
                  <div className="paso-doc-preview-frame">
                    <iframe
                      title={`Vista previa breve: ${row.titulo}`}
                      src={officeEmbedSrc}
                      className="inscripcion-doc-preview-iframe inscripcion-doc-preview-iframe--card inscripcion-doc-preview-iframe--office"
                      loading="lazy"
                      tabIndex={-1}
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <span className="paso-doc-preview-ribbon">Ampliar</span>
                </>
              ) : null}
              {kind === 'other' ? (
                <div className="inscripcion-doc-preview-poster inscripcion-doc-preview-poster--muted">
                  <span className="inscripcion-doc-preview-poster-icon" aria-hidden>
                    📎
                  </span>
                  <span className="inscripcion-doc-preview-poster-hint">Clic para abrir vista</span>
                </div>
              ) : null}
            </div>
            <div className="inscripcion-doc-actions">
              <button
                type="button"
                className="inscripcion-doc-download"
                onClick={handleAction}
                disabled={dlBusy}
              >
                <InscripcionDocDownloadIcon />
                <span>{dlBusy ? 'Preparando…' : labelAction}</span>
              </button>
              {dlHint ? <p className="inscripcion-doc-hint">{dlHint}</p> : null}
            </div>
          </div>
        ) : null}
      </div>
      {previewOpen && hasFile
        ? createPortal(
            <div
              className="inscripcion-preview-backdrop"
              role="presentation"
              onClick={() => setPreviewOpen(false)}
            >
              <div
                className="inscripcion-preview-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby={`inscripcion-preview-h-${row.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                <header className="inscripcion-preview-modal-head">
                  <h3 id={`inscripcion-preview-h-${row.id}`} className="inscripcion-preview-modal-title">
                    {row.titulo}
                  </h3>
                  <button
                    type="button"
                    className="inscripcion-preview-modal-close"
                    onClick={() => setPreviewOpen(false)}
                    aria-label="Cerrar vista previa"
                  >
                    ×
                  </button>
                </header>
                <div className="inscripcion-preview-modal-body">
                  {previewOpen && (!modalShowFrame || !modalFrameLoaded) && kind !== 'other' ? (
                    <div className="inscripcion-preview-modal-loading" aria-live="polite">
                      Cargando vista previa…
                    </div>
                  ) : null}
                  {modalShowFrame && kind === 'pdf' ? (
                    <iframe
                      title={row.titulo}
                      src={inscripcionPdfViewerUrl(fileUrlFixed)}
                      className="inscripcion-preview-modal-frame"
                      onLoad={() => setModalFrameLoaded(true)}
                    />
                  ) : null}
                  {modalShowFrame && kind === 'word' ? (
                    <iframe
                      title={row.titulo}
                      src={officeEmbedSrc}
                      className="inscripcion-preview-modal-frame inscripcion-preview-modal-frame--office"
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() => setModalFrameLoaded(true)}
                    />
                  ) : null}
                  {modalShowFrame && kind === 'image' ? (
                    <img
                      src={fileUrlFixed}
                      alt=""
                      className="inscripcion-preview-modal-img"
                      onLoad={() => setModalFrameLoaded(true)}
                    />
                  ) : null}
                  {modalShowFrame && kind === 'other' ? (
                    <div className="inscripcion-preview-modal-fallback">
                      <p>No hay vista previa integrada para este tipo de archivo.</p>
                      <a
                        href={fileUrlFixed}
                        className="inscripcion-preview-modal-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir en pestaña nueva
                      </a>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}

const InscripcionHelpAside = memo(function InscripcionHelpAside() {
  return (
    <aside className="inscripcion-help" aria-label="Contacto para dudas sobre inscripción">
      <div className="inscripcion-help-banner">
        <p className="inscripcion-help-banner-title">¿Aún necesitas ayuda?</p>
        <p className="inscripcion-help-banner-text">
          Para aclarar dudas puedes escribir a{' '}
          <a href="mailto:mario.villarreal@ujed.mx">mario.villarreal@ujed.mx</a>
        </p>
      </div>
      <div className="inscripcion-help-bar">
        <div className="inscripcion-help-bar-row">
          <span className="inscripcion-help-bar-icon" aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
            </svg>
          </span>
          <a href="mailto:mario.villarreal@ujed.mx" className="inscripcion-help-chip">
            Correo: mario.villarreal@ujed.mx
          </a>
        </div>
        <div className="inscripcion-help-phone">
          <span className="inscripcion-help-phone-label">Tel. oficina</span>
          <a href="tel:+526181301162" className="inscripcion-help-phone-num">
            618 130 11 62
          </a>
        </div>
      </div>
    </aside>
  )
})

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('inicio')
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    password2: '',
    nombres: '',
    apellidos: '',
    matricula: '',
    codigo: '',
  })
  const [registerError, setRegisterError] = useState('')
  const [registerOk, setRegisterOk] = useState(false)
  const [projects, setProjects] = useState(INITIAL_PROYECTOS)
  const [integrantes, setIntegrantes] = useState(INITIAL_INTEGRANTES)
  const [instrumentos, setInstrumentos] = useState(() => [...INITIAL_INSTRUMENTOS])
  const [videosInteres, setVideosInteres] = useState([])
  const [formInstrumento, setFormInstrumento] = useState({ key: '', label: '', desc: '' })
  const [editInstrumentKey, setEditInstrumentKey] = useState(null)
  const [formVideo, setFormVideo] = useState({ id: '', title: '', description: '' })
  const [editVideoId, setEditVideoId] = useState(null)
  const [articulosDivulgacion, setArticulosDivulgacion] = useState([])
  const [formArticulo, setFormArticulo] = useState(() => emptyFormArticulo())
  const [editArticuloId, setEditArticuloId] = useState(null)
  const [articuloArchivos, setArticuloArchivos] = useState({ pdf: null })
  const [formServicio, setFormServicio] = useState({
    nombre: '',
    matricula: '',
    semestre: '',
    grupo: '',
    correo: '',
    celular: '',
    comentario: '',
  })
  const [correoEnviado, setCorreoEnviado] = useState(false)
  const [servicioTerminosOpen, setServicioTerminosOpen] = useState(false)
  const [servicioTerminosAceptados, setServicioTerminosAceptados] = useState(false)
  const [servicioSubmitBusy, setServicioSubmitBusy] = useState(false)
  const [servicioSubmitError, setServicioSubmitError] = useState('')
  const [imc, setImc] = useState({ peso: '', estatura: '' })
  const areasRef = useRef(null)

  const [adminSection, setAdminSection] = useState('proyectos')
  const [editProyectoId, setEditProyectoId] = useState(null)
  const [editIntegranteId, setEditIntegranteId] = useState(null)
  const [formProyecto, setFormProyecto] = useState(() => emptyProyectoAdminForm())
  const [docentesFull, setDocentesFull] = useState([])
  const [formDocente, setFormDocente] = useState(() => emptyFormDocente())
  const [docenteArchivos, setDocenteArchivos] = useState({ foto: null, cv: null })
  const [codigosAcceso, setCodigosAcceso] = useState([])
  const [codigosAccesoLoading, setCodigosAccesoLoading] = useState(false)
  const [codigoAccesoError, setCodigoAccesoError] = useState('')
  const [formCodigoAcceso, setFormCodigoAcceso] = useState({
    codigo: '',
    tipo: 'ALUMNOS',
    rol: 'alumno',
    email: '',
    dominioPermitido: '',
    descripcion: '',
    usoMaximo: -1,
    fechaExp: '2026-12-31T23:59',
  })
  const [inscripcionRows, setInscripcionRows] = useState([])
  const [inscripcionPublicRows, setInscripcionPublicRows] = useState([])
  const [inscripcionPublicLoading, setInscripcionPublicLoading] = useState(false)
  const [formInscripcion, setFormInscripcion] = useState(() => emptyFormInscripcion())
  const [editInscripcionId, setEditInscripcionId] = useState(null)
  const [inscripcionArchivo, setInscripcionArchivo] = useState(null)
  const [inscripcionAdminNotice, setInscripcionAdminNotice] = useState(null)
  const [inscripcionDocsFilter, setInscripcionDocsFilter] = useState('')
  const [perfilesRows, setPerfilesRows] = useState([])
  const [editPerfilId, setEditPerfilId] = useState(null)
  const [formPerfil, setFormPerfil] = useState(() => emptyFormPerfil())
  const [perfilArchivo, setPerfilArchivo] = useState(null)
  const [servicioConfigRows, setServicioConfigRows] = useState([])
  const [servicioRegistrosRows, setServicioRegistrosRows] = useState([])
  const [evalConfigRows, setEvalConfigRows] = useState([])
  const [evalSelectedId, setEvalSelectedId] = useState(null)
  const [evalRangosRows, setEvalRangosRows] = useState([])
  const [evalResultadosRows, setEvalResultadosRows] = useState([])
  const [comentariosRows, setComentariosRows] = useState([])
  const [publicacionesRows, setPublicacionesRows] = useState([])
  const [publicacionesFeed, setPublicacionesFeed] = useState([])
  const [reaccionesRows, setReaccionesRows] = useState([])
  const [formPublicacion, setFormPublicacion] = useState(() => emptyFormPublicacion())
  const [editPublicacionId, setEditPublicacionId] = useState(null)
  const [detailModal, setDetailModal] = useState({ open: false, type: null, item: null })
  const [grupoDetalleId, setGrupoDetalleId] = useState(null)
  const [publicacionDetalleId, setPublicacionDetalleId] = useState(null)
  const [proyectoInvDetalleId, setProyectoInvDetalleId] = useState(null)
  const [proyectoInvDetalle, setProyectoInvDetalle] = useState({
    loading: false,
    item: null,
    error: null,
  })

  const inscripcionFilteredDocs = useMemo(() => {
    const q = inscripcionDocsFilter.trim()
    if (!q) return inscripcionPublicRows
    const normalize = (s) =>
      String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
    const nq = normalize(q)
    return inscripcionPublicRows.filter((row) => {
      const t = normalize(row.titulo)
      const d = normalize(row.descripcion)
      return t.includes(nq) || d.includes(nq)
    })
  }, [inscripcionPublicRows, inscripcionDocsFilter])

  const eventosPublicados = useMemo(() => {
    const mapped = (publicacionesFeed || []).map(publicacionToEventoUi)
    return mapped.length ? mapped : undefined
  }, [publicacionesFeed])

  const publicacionDetalleItem = useMemo(() => {
    if (!publicacionDetalleId) return null
    const list =
      eventosPublicados && eventosPublicados.length > 0 ? eventosPublicados : EVENTOS_STATIC
    return list.find((e) => e.id === publicacionDetalleId) ?? null
  }, [eventosPublicados, publicacionDetalleId])

  useEffect(() => {
    if (currentPage !== 'inscripcion') setInscripcionDocsFilter('')
  }, [currentPage])

  useEffect(() => {
    let cancelled = false
    const loadPublicacionesFeed = async () => {
      try {
        const rows = user?.isAdmin
          ? await publicacionesAdminService.listarAdmin()
          : await publicacionesService.listarPublicas()
        if (!cancelled) setPublicacionesFeed(Array.isArray(rows) ? rows : [])
      } catch {
        if (!cancelled) setPublicacionesFeed([])
      }
    }
    loadPublicacionesFeed()
    return () => {
      cancelled = true
    }
  }, [user?.isAdmin])

  useEffect(() => {
    const syncUser = async (session) => {
      if (session?.user) {
        try {
          const perfil = await profileService.verMiPerfil()
          const rol = String(perfil?.rol || '').trim().toLowerCase()
          setUser({
            email: session.user.email ?? '',
            id: session.user.id,
            isAdmin: rolEsAdmin(rol),
            rol: rol || 'invitado',
          })
          return
        } catch (e) {
          const msg = String(e?.message || e || '')
          const missingSession =
            e?.name === 'AuthSessionMissingError' ||
            msg.includes('Auth session missing') ||
            msg.includes('session missing')
          if (missingSession) {
            try {
              await supabase.auth.signOut()
            } catch {
              /* ignore */
            }
          } else {
            setUser({
              email: session.user.email ?? '',
              id: session.user.id,
              isAdmin: false,
              rol: 'invitado',
            })
            return
          }
        }
      }

      setUser(null)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncUser(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const syncDocentes = useCallback(async () => {
    try {
      const docs = await docentesService.listarDocentes()
      setDocentesFull(Array.isArray(docs) ? docs : [])
      const activos = (Array.isArray(docs) ? docs : []).filter((d) => d.es_activo !== false)
      setIntegrantes(activos.map(docenteRowToIntegranteUi))
    } catch (e) {
      console.error(e)
      setDocentesFull([])
      setIntegrantes(INITIAL_INTEGRANTES)
    }
  }, [])

  useEffect(() => {
    void syncDocentes()
  }, [syncDocentes, user?.id])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = user?.isAdmin
          ? await proyectosInvestigacionService.listarTodosAdmin()
          : await proyectosInvestigacionService.listarParaSitio()
        if (!cancelled) setProjects(list)
      } catch (e) {
        console.error(e)
        if (!cancelled && !user?.isAdmin) setProjects(INITIAL_PROYECTOS)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.isAdmin])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const rows = user?.isAdmin
          ? await videosInteresService.listarAdmin()
          : await videosInteresService.listarParaSitio()
        if (!cancelled) setVideosInteres(Array.isArray(rows) ? rows : [])
      } catch (e) {
        console.error(e)
        if (!cancelled) setVideosInteres([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user?.isAdmin])

  const syncArticulosDivulgacion = useCallback(async () => {
    try {
      const rows = user?.isAdmin
        ? await divulgacionArticulosService.listarAdmin()
        : await divulgacionArticulosService.listarParaSitio()
      setArticulosDivulgacion(Array.isArray(rows) ? rows : [])
    } catch (e) {
      const msg = String(e?.message ?? e ?? '')
      const quiet =
        /404|42P01|not found|does not exist|schema cache|divulgacion_articulos/i.test(msg) ||
        e?.code === 'PGRST205'
      if (!quiet) console.error(e)
      setArticulosDivulgacion([])
    }
  }, [user?.isAdmin])

  useEffect(() => {
    void syncArticulosDivulgacion()
  }, [syncArticulosDivulgacion])

  useEffect(() => {
    if (currentPage === 'admin' && user && !user.isAdmin) {
      setCurrentPage('inicio')
    }
  }, [currentPage, user])

  useEffect(() => {
    if (currentPage !== 'admin' || adminSection !== 'codigos' || !user?.isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        setCodigosAccesoLoading(true)
        setCodigoAccesoError('')
        const rows = await accessCodeService.verCodigos()
        if (!cancelled) setCodigosAcceso(Array.isArray(rows) ? rows : [])
      } catch (e) {
        if (!cancelled) {
          setCodigoAccesoError(e.message || 'No se pudieron cargar los códigos.')
          setCodigosAcceso([])
        }
      } finally {
        if (!cancelled) setCodigosAccesoLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentPage, adminSection, user?.isAdmin])

  useEffect(() => {
    if (currentPage !== 'inscripcion') return
    let cancelled = false
    setInscripcionPublicLoading(true)
    inscripcionProyectosService
      .listarParaSitio()
      .then((rows) => {
        if (!cancelled) setInscripcionPublicRows(Array.isArray(rows) ? rows : [])
      })
      .catch((e) => {
        console.error(e)
        if (!cancelled) setInscripcionPublicRows([])
      })
      .finally(() => {
        if (!cancelled) setInscripcionPublicLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [currentPage])

  useEffect(() => {
    if (currentPage !== 'proyectosInvDetalle' || proyectoInvDetalleId == null) return
    let cancelled = false
    setProyectoInvDetalle((prev) => ({ ...prev, loading: true, error: null }))
    proyectosInvestigacionService
      .obtenerPublicoPorId(proyectoInvDetalleId)
      .then((row) => {
        if (!cancelled) {
          setProyectoInvDetalle({
            loading: false,
            item: mapProyectoDetalleUi(row),
            error: null,
          })
        }
      })
      .catch((e) => {
        console.error(e)
        if (!cancelled) {
          setProyectoInvDetalle({
            loading: false,
            item: null,
            error: e.message || 'No se pudo cargar el proyecto.',
          })
        }
      })
    return () => {
      cancelled = true
    }
  }, [currentPage, proyectoInvDetalleId])

  useEffect(() => {
    if (!inscripcionAdminNotice) return
    const t = window.setTimeout(() => setInscripcionAdminNotice(null), 6500)
    return () => window.clearTimeout(t)
  }, [inscripcionAdminNotice])

  useEffect(() => {
    if (currentPage !== 'admin' || !user?.isAdmin) return
    let cancelled = false
    const tabs = [
      'publicaciones',
      'inscripcion',
      'perfiles',
      'servicioSocial',
      'evaluaciones',
      'comentarios',
    ]
    if (!tabs.includes(adminSection)) return
    ;(async () => {
      try {
        if (adminSection === 'publicaciones') {
          const [pubs, reacts] = await Promise.all([
            publicacionesAdminService.listarAdmin(),
            reaccionesAdminService.listarAdmin(),
          ])
          if (!cancelled) {
            setPublicacionesRows(pubs)
            setReaccionesRows(reacts)
          }
        } else if (adminSection === 'inscripcion') {
          const rows = await inscripcionProyectosService.listarAdmin()
          if (!cancelled) setInscripcionRows(rows)
        } else if (adminSection === 'perfiles') {
          const rows = await profileService.verTodosLosPerfilesAdmin()
          if (!cancelled) setPerfilesRows(rows)
        } else if (adminSection === 'servicioSocial') {
          const [cfg, reg] = await Promise.all([
            servicioSocialAdminService.listarConfig(),
            servicioSocialAdminService.listarRegistros(),
          ])
          if (!cancelled) {
            setServicioConfigRows(cfg)
            setServicioRegistrosRows(reg)
          }
        } else if (adminSection === 'evaluaciones') {
          const [cfg, res] = await Promise.all([
            evaluacionesAdminService.listarConfig(),
            evaluacionesAdminService.listarResultados(),
          ])
          if (!cancelled) {
            setEvalConfigRows(cfg)
            setEvalResultadosRows(res)
            setEvalSelectedId((prev) => prev || cfg[0]?.id || null)
          }
        } else if (adminSection === 'comentarios') {
          const rows = await comentariosAdminService.listarAdmin()
          if (!cancelled) setComentariosRows(rows)
        }
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentPage, adminSection, user?.isAdmin])

  useEffect(() => {
    if (currentPage !== 'admin' || adminSection !== 'evaluaciones' || !evalSelectedId || !user?.isAdmin) return
    let cancelled = false
    ;(async () => {
      try {
        const rangos = await evaluacionesAdminService.listarRangos(evalSelectedId)
        if (!cancelled) setEvalRangosRows(rangos)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [currentPage, adminSection, evalSelectedId, user?.isAdmin])

  const searchEntries = useMemo(() => getSearchEntries(instrumentos), [instrumentos])

  const scrollToAreas = () => {
    areasRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const goTo = (page) => {
    setCurrentPage(page)
    setSidebarOpen(false)
    if (page !== 'proyectosInvDetalle') {
      setProyectoInvDetalleId(null)
      setProyectoInvDetalle({ loading: false, item: null, error: null })
    }
    if (page !== 'grupoDetalle') {
      setGrupoDetalleId(null)
    }
    if (page !== 'publicacionDetalle') {
      setPublicacionDetalleId(null)
    }
  }

  const openPublicacionDetalle = (ev) => {
    if (!ev?.id) return
    setPublicacionDetalleId(ev.id)
    setCurrentPage('publicacionDetalle')
    setSidebarOpen(false)
  }

  const navigateToIntegranteDetalle = (persona) => {
    if (!persona?.id) return
    setGrupoDetalleId(persona.id)
    setCurrentPage('grupoDetalle')
    setSidebarOpen(false)
  }

  const handleSiteSearch = (rawQuery) => {
    const q = (rawQuery || '').trim()
    if (!q) {
      window.alert(
        'Escribe palabras clave (ej.: divulgación, publicaciones, formulario, IMC, MoCA, senior, video…) y pulsa Enter.',
      )
      return
    }
    const page = resolveSiteSearch(q, searchEntries)
    if (page) {
      goTo(page)
      return
    }
    window.alert(
      'No encontramos una sección con esa búsqueda. Prueba: inicio, divulgación, proyectos de investigación, inscripción, grupo, servicio, instrumentos, video, IMC, sesión…',
    )
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    const emailTrim = loginForm.email.trim()
    const emailAuth = emailTrim.toLowerCase()
    const password = loginForm.password

    try {
      const data = await authService.login(emailAuth, password)
      const uid = data?.user?.id
      if (!uid) {
        setLoginError('La sesión no devolvió un usuario. Revisa la consola del navegador y las variables VITE_SUPABASE_* en .env.')
        return
      }
      const perfil = await profileService.verPerfilTrasLogin(uid)
      const rol = String(perfil?.rol || '').trim().toLowerCase()
      const isAdmin = rolEsAdmin(rol)
      setUser({
        email: data.user?.email ?? emailTrim,
        id: data.user?.id,
        isAdmin,
        rol: rol || 'invitado',
      })
      setLoginForm({ email: '', password: '' })
      setCurrentPage(isAdmin ? 'admin' : 'inicio')
      setSidebarOpen(false)
    } catch (err) {
      const raw = (err && err.message) || String(err)
      const lower = raw.toLowerCase()
      const expectedAuthFail =
        lower.includes('invalid login') ||
        lower.includes('invalid_credentials') ||
        lower.includes('email not confirmed')
      if (!expectedAuthFail) console.error(err)
      if (lower.includes('invalid login') || lower.includes('invalid_credentials')) {
        setLoginError('Correo o contraseña incorrectos.')
        return
      }
      if (lower.includes('email not confirmed')) {
        setLoginError(
          'Aún debes confirmar el correo: abre el enlace que envió Supabase al registrarte (o desactiva «Confirm email» en Authentication del proyecto si es entorno de prueba).',
        )
        return
      }
      if (raw.includes('PGRST116') || lower.includes('0 rows') || lower.includes('json object requested')) {
        try {
          await authService.logout()
        } catch {
          /* ignore */
        }
        setLoginError(
          'No se encontró tu fila en la tabla perfiles (o RLS la bloqueó). Revisa en Supabase que exista un registro en perfiles con el mismo id que auth.users y políticas que permitan leer tu propia fila.',
        )
        return
      }
      if (lower.includes('permission denied') || lower.includes('row-level security') || lower.includes('rls')) {
        try {
          await authService.logout()
        } catch {
          /* ignore */
        }
        setLoginError(
          'Supabase bloqueó la lectura de perfiles (RLS). La política SELECT debe permitir al dueño: auth.uid() = id. Revisa en SQL las políticas de public.perfiles.',
        )
        return
      }
      setLoginError(raw || 'No se pudo iniciar sesión.')
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setRegisterError('')
    setRegisterOk(false)
    if (registerForm.password !== registerForm.password2) {
      setRegisterError('Las contraseñas no coinciden.')
      return
    }
    try {
      await authService.signUp(
        registerForm.email.trim(),
        registerForm.password,
        registerForm.nombres.trim(),
        registerForm.apellidos.trim(),
        registerForm.matricula.trim(),
        registerForm.codigo.trim(),
      )
      setRegisterOk(true)
      setRegisterForm({
        email: '',
        password: '',
        password2: '',
        nombres: '',
        apellidos: '',
        matricula: '',
        codigo: '',
      })
    } catch (err) {
      setRegisterError(err.message || 'No se pudo completar el registro.')
    }
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      /* ignore */
    }
    setUser(null)
    setEditProyectoId(null)
    setEditIntegranteId(null)
    goTo('inicio')
  }

  const handleFormServicio = (e) => {
    e.preventDefault()
    setServicioSubmitError('')
    setServicioTerminosAceptados(false)
    setServicioTerminosOpen(true)
  }

  const confirmarTerminosServicio = async () => {
    if (servicioSubmitBusy) return
    if (!servicioTerminosAceptados) {
      setServicioSubmitError('Debes aceptar el término de uso de datos para continuar.')
      return
    }
    if (!user?.id) {
      setServicioSubmitError('Inicia sesión para enviar tu registro de servicio social.')
      return
    }
    const semestreN = Number(formServicio.semestre)
    if (!Number.isFinite(semestreN) || semestreN < 1 || semestreN > 12) {
      setServicioSubmitError('El semestre debe ser un número entre 1 y 12.')
      return
    }
    setServicioSubmitBusy(true)
    setServicioSubmitError('')
    try {
      await servicioSocialService.enviarRegistro({
        perfilId: user.id,
        semestre: semestreN,
        grupo: String(formServicio.grupo || '').trim(),
        datosExtra: {
          nombre: String(formServicio.nombre || '').trim(),
          matricula: String(formServicio.matricula || '').trim(),
          correo: String(formServicio.correo || '').trim(),
          celular: String(formServicio.celular || '').trim(),
          comentario: String(formServicio.comentario || '').trim(),
          terminos_aceptados: true,
          terminos_aceptados_at: new Date().toISOString(),
          finalidad_datos: 'uso_educativo',
        },
      })
      setCorreoEnviado(true)
      setServicioTerminosOpen(false)
    } catch (e) {
      setServicioSubmitError(e.message || 'No se pudo enviar el registro.')
    } finally {
      setServicioSubmitBusy(false)
    }
  }

  const addProyecto = async () => {
    if (!formProyecto.title.trim()) return
    try {
      if (editProyectoId) {
        await proyectosInvestigacionService.actualizarAdmin(editProyectoId, formProyecto)
        setEditProyectoId(null)
      } else {
        await proyectosInvestigacionService.crearAdmin(formProyecto)
      }
      setFormProyecto(emptyProyectoAdminForm())
      const list = await proyectosInvestigacionService.listarTodosAdmin()
      setProjects(list)
    } catch (err) {
      window.alert(err.message || 'No se pudo guardar el proyecto.')
    }
  }

  const subirImagenesGaleriaProyecto = async (files) => {
    const list = Array.isArray(files) ? files : []
    if (!list.length) return
    if (!editProyectoId) {
      window.alert('Elegí «Editar» en un proyecto existente para añadir imágenes a la galería.')
      return
    }
    try {
      for (const file of list) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `proyectos/${editProyectoId}/${crypto.randomUUID?.() || Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { path: storagePath, publicUrl } = await uploadPublicFile({ path, file })
        await proyectosInvestigacionService.agregarImagenDesdeStorage(editProyectoId, publicUrl, storagePath)
      }
      const row = await proyectosInvestigacionService.obtenerFilaAdmin(editProyectoId)
      setFormProyecto(proyectoRowToAdminForm(row))
      setProjects(await proyectosInvestigacionService.listarTodosAdmin())
    } catch (e) {
      window.alert(e.message || 'No se pudieron subir las imágenes.')
    }
  }

  const subirPortadaProyecto = async (file) => {
    if (!file || !editProyectoId) {
      window.alert('Elegí «Editar» en un proyecto existente para reemplazar la portada.')
      return
    }
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `proyectos/${editProyectoId}/portada-${crypto.randomUUID?.() || Date.now()}.${ext}`
      const { path: storagePath, publicUrl } = await uploadPublicFile({ path, file })
      await proyectosInvestigacionService.setPortadaDesdeStorage(editProyectoId, publicUrl, storagePath)
      const row = await proyectosInvestigacionService.obtenerFilaAdmin(editProyectoId)
      setFormProyecto(proyectoRowToAdminForm(row))
      setProjects(await proyectosInvestigacionService.listarTodosAdmin())
    } catch (e) {
      window.alert(e.message || 'No se pudo subir la imagen.')
    }
  }

  const subirImagenesProyectoNuevo = async (files) => {
    const list = Array.isArray(files) ? files : files ? [files] : []
    if (!list.length) return
    try {
      const urls = []
      for (const file of list) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `proyectos/staging/${crypto.randomUUID?.() || Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { publicUrl } = await uploadPublicFile({ path, file })
        urls.push(publicUrl)
      }
      setFormProyecto((s) => {
        const next = [...(s.imagenesPendientes || []), ...urls]
        return {
          ...s,
          imagenesPendientes: next,
          imagen: next[0] || '',
          imagenGaleria: next,
        }
      })
    } catch (e) {
      window.alert(e.message || 'No se pudieron subir las imágenes.')
    }
  }

  const deleteProyecto = async (id) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return
    try {
      await proyectosInvestigacionService.eliminarAdmin(id)
      const list = await proyectosInvestigacionService.listarTodosAdmin()
      setProjects(list)
    } catch (err) {
      window.alert(err.message || 'No se pudo eliminar el proyecto.')
    }
  }

  const startEditProyecto = async (p) => {
    try {
      const row = await proyectosInvestigacionService.obtenerFilaAdmin(p.id)
      setEditProyectoId(p.id)
      setFormProyecto(proyectoRowToAdminForm(row))
    } catch (e) {
      window.alert(e.message || 'No se pudo cargar el proyecto.')
    }
  }

  const addDocente = async () => {
    if (!formDocente.nombres.trim() || !formDocente.apellidos.trim()) {
      window.alert('Nombres y apellidos son obligatorios.')
      return
    }
    if (!formDocente.slug.trim() || !formDocente.correo.trim()) {
      window.alert('Slug y correo electrónico son obligatorios.')
      return
    }
    let redes
    let datosAdic
    try {
      redes = JSON.parse(formDocente.redes_sociales_json || '{}')
      datosAdic = JSON.parse(formDocente.datos_adicionales_json || '{}')
    } catch {
      window.alert('Revisa el JSON de redes sociales o datos adicionales.')
      return
    }
    try {
      let docenteId = editIntegranteId
      const baseUpdates = {
        nombres: formDocente.nombres.trim(),
        apellidos: formDocente.apellidos.trim(),
        grado_academico: formDocente.grado_academico.trim() || '—',
        slug: formDocente.slug.trim(),
        correo: formDocente.correo.trim(),
        cargo: formDocente.cargo?.trim() || null,
        area_trabajo: formDocente.area_trabajo?.trim() || null,
        descripcion_breve: formDocente.descripcion_breve?.trim() || null,
        telefono: formDocente.telefono?.trim() || null,
        ubicacion_fisica: formDocente.ubicacion_fisica?.trim() || null,
        orden: Number(formDocente.orden) || 0,
        redes_sociales: redes,
        datos_adicionales: datosAdic,
        foto_url: formDocente.foto_url?.trim() || null,
        foto_path: formDocente.foto_path?.trim() || null,
        cv_url: formDocente.cv_url?.trim() || null,
        cv_path: formDocente.cv_path?.trim() || null,
      }
      if (editIntegranteId) {
        await docentesService.editarDocenteAdmin({
          id: editIntegranteId,
          updates: baseUpdates,
        })
      } else {
        const created = await docentesService.agregarDocenteAdmin({
          grado_academico: baseUpdates.grado_academico,
          nombres: baseUpdates.nombres,
          apellidos: baseUpdates.apellidos,
          slug: baseUpdates.slug,
          correo: baseUpdates.correo,
          cargo: baseUpdates.cargo ?? undefined,
          area_trabajo: baseUpdates.area_trabajo ?? undefined,
          descripcion_breve: baseUpdates.descripcion_breve ?? undefined,
          telefono: baseUpdates.telefono ?? undefined,
          ubicacion_fisica: baseUpdates.ubicacion_fisica ?? undefined,
          orden: baseUpdates.orden,
          redes_sociales: redes,
          datos_adicionales: datosAdic,
          foto_url: baseUpdates.foto_url,
          foto_path: baseUpdates.foto_path,
          cv_url: baseUpdates.cv_url,
          cv_path: baseUpdates.cv_path,
        })
        docenteId = created.id
      }

      const fileUpdates = {}
      if (docenteArchivos.foto && docenteId) {
        const ext = docenteArchivos.foto.name.split('.').pop() || 'jpg'
        const { path: p, publicUrl } = await uploadPublicFile({
          path: `docentes/${docenteId}/foto.${ext}`,
          file: docenteArchivos.foto,
        })
        fileUpdates.foto_path = p
        fileUpdates.foto_url = publicUrl
      }
      if (docenteArchivos.cv && docenteId) {
        const ext = docenteArchivos.cv.name.split('.').pop() || 'pdf'
        const { path: p, publicUrl } = await uploadPublicFile({
          path: `docentes/${docenteId}/cv.${ext}`,
          file: docenteArchivos.cv,
        })
        fileUpdates.cv_path = p
        fileUpdates.cv_url = publicUrl
      }
      if (Object.keys(fileUpdates).length && docenteId) {
        await docentesService.editarDocenteAdmin({ id: docenteId, updates: fileUpdates })
      }

      setEditIntegranteId(null)
      setFormDocente(emptyFormDocente())
      setDocenteArchivos({ foto: null, cv: null })
      await syncDocentes()
    } catch (err) {
      window.alert(err.message || 'No se pudo guardar el docente.')
    }
  }

  const deleteIntegrante = async (id) => {
    if (!window.confirm('¿Eliminar este integrante?')) return
    try {
      await docentesService.editarDocenteAdmin({ id, updates: { es_activo: false } })
      await docentesService.borrarDocenteDesactivadoAdmin({ id })
      await syncDocentes()
    } catch (err) {
      window.alert(err.message || 'No se pudo eliminar el integrante.')
    }
  }

  const startEditIntegrante = (id) => {
    const d = docentesFull.find((x) => x.id === id)
    if (!d) return
    setEditIntegranteId(id)
    setFormDocente(docenteRowToForm(d))
    setDocenteArchivos({ foto: null, cv: null })
  }

  const cancelEditProyecto = () => {
    setEditProyectoId(null)
    setFormProyecto(emptyProyectoAdminForm())
  }

  const cancelEditIntegrante = () => {
    setEditIntegranteId(null)
    setFormDocente(emptyFormDocente())
    setDocenteArchivos({ foto: null, cv: null })
  }

  const saveInscripcion = async () => {
    if (!formInscripcion.titulo.trim()) {
      setInscripcionAdminNotice({ kind: 'error', message: 'El título es obligatorio.' })
      return
    }
    let datos_adicionales
    try {
      datos_adicionales = JSON.parse(formInscripcion.datos_adicionales_json || '{}')
    } catch {
      setInscripcionAdminNotice({ kind: 'error', message: 'JSON inválido en datos adicionales.' })
      return
    }
    try {
      const hadPendingFile = !!inscripcionArchivo
      const payload = {
        titulo: formInscripcion.titulo.trim(),
        descripcion: formInscripcion.descripcion?.trim() || null,
        categoria: 'General',
        file_url: formInscripcion.file_url?.trim()
          ? fixPublicStorageUrl(formInscripcion.file_url.trim())
          : null,
        file_path: formInscripcion.file_path?.trim() || null,
        file_size: formInscripcion.file_size?.trim() || null,
        orden: Number(formInscripcion.orden) || 0,
        es_descargable: formInscripcion.es_descargable !== false,
        es_visible: formInscripcion.es_visible !== false,
        datos_adicionales,
      }
      let id = editInscripcionId
      if (editInscripcionId) {
        await inscripcionProyectosService.actualizarAdmin(editInscripcionId, payload)
      } else {
        const created = await inscripcionProyectosService.crearAdmin(payload)
        id = created.id
      }
      if (inscripcionArchivo && id) {
        const ext = inscripcionArchivo.name.split('.').pop() || 'pdf'
        if (formInscripcion.file_path) await removePublicFile(formInscripcion.file_path)
        const { path: storagePath, publicUrl } = await uploadPublicFile({
          path: `inscripcion/${id}/documento.${ext}`,
          file: inscripcionArchivo,
        })
        await inscripcionProyectosService.actualizarAdmin(id, {
          file_path: storagePath,
          file_url: publicUrl,
          file_size: String(inscripcionArchivo.size),
        })
      }
      setEditInscripcionId(null)
      setFormInscripcion(emptyFormInscripcion())
      setInscripcionArchivo(null)
      setInscripcionRows(await inscripcionProyectosService.listarAdmin())
      setInscripcionAdminNotice({
        kind: 'success',
        message: hadPendingFile
          ? 'Listo: documento guardado y archivo subido.'
          : 'Documento guardado correctamente.',
      })
    } catch (e) {
      setInscripcionAdminNotice({
        kind: 'error',
        message: e.message || 'No se pudo guardar.',
      })
    }
  }

  const deleteInscripcion = async (id) => {
    if (!window.confirm('¿Eliminar este documento de inscripción?')) return
    try {
      await inscripcionProyectosService.eliminarAdmin(id)
      setInscripcionRows(await inscripcionProyectosService.listarAdmin())
      setInscripcionAdminNotice({ kind: 'success', message: 'Documento eliminado.' })
    } catch (e) {
      setInscripcionAdminNotice({
        kind: 'error',
        message: e.message || 'No se pudo eliminar.',
      })
    }
  }

  const startEditInscripcion = (row) => {
    setEditInscripcionId(row.id)
    setFormInscripcion(inscripcionRowToForm(row))
    setInscripcionArchivo(null)
  }

  const cancelEditInscripcion = () => {
    setEditInscripcionId(null)
    setFormInscripcion(emptyFormInscripcion())
    setInscripcionArchivo(null)
  }

  const savePerfilAdmin = async () => {
    if (!editPerfilId) return
    let datos_adicionales
    try {
      datos_adicionales = JSON.parse(formPerfil.datos_adicionales_json || '{}')
    } catch {
      window.alert('JSON inválido en datos adicionales del perfil.')
      return
    }
    try {
      await profileService.editarPerfilAdmin(editPerfilId, {
        nombres: formPerfil.nombres.trim(),
        apellidos: formPerfil.apellidos.trim(),
        matricula: formPerfil.matricula?.trim() || null,
        rol: formPerfil.rol,
        email_capsula: formPerfil.email_capsula?.trim() || null,
        datos_adicionales,
        avatar_url: formPerfil.avatar_url?.trim() || null,
        avatar_path: formPerfil.avatar_path?.trim() || null,
      })
      if (perfilArchivo) {
        const ext = perfilArchivo.name.split('.').pop() || 'jpg'
        if (formPerfil.avatar_path) await removePublicFile(formPerfil.avatar_path)
        const { path: p, publicUrl } = await uploadPublicFile({
          path: `avatars/${editPerfilId}/avatar.${ext}`,
          file: perfilArchivo,
        })
        await profileService.editarPerfilAdmin(editPerfilId, { avatar_path: p, avatar_url: publicUrl })
      }
      setEditPerfilId(null)
      setFormPerfil(emptyFormPerfil())
      setPerfilArchivo(null)
      setPerfilesRows(await profileService.verTodosLosPerfilesAdmin())
    } catch (e) {
      window.alert(e.message || 'No se pudo guardar el perfil.')
    }
  }

  const startEditPerfil = (row) => {
    setEditPerfilId(row.id)
    setFormPerfil(perfilRowToForm(row))
    setPerfilArchivo(null)
  }

  const cancelEditPerfil = () => {
    setEditPerfilId(null)
    setFormPerfil(emptyFormPerfil())
    setPerfilArchivo(null)
  }

  const patchServicioConfig = async (id, patch) => {
    try {
      await servicioSocialAdminService.actualizarConfig(id, patch)
      setServicioConfigRows(await servicioSocialAdminService.listarConfig())
    } catch (e) {
      window.alert(e.message || 'No se pudo actualizar.')
    }
  }

  const patchServicioRegistro = async (id, patch) => {
    try {
      await servicioSocialAdminService.actualizarRegistro(id, patch)
      setServicioRegistrosRows(await servicioSocialAdminService.listarRegistros())
    } catch (e) {
      window.alert(e.message || 'No se pudo actualizar el registro.')
    }
  }

  const crearEvaluacionConfig = async ({ slug, nombre, descripcion }) => {
    if (!slug?.trim() || !nombre?.trim()) {
      window.alert('Slug y nombre son obligatorios.')
      return
    }
    try {
      await evaluacionesAdminService.crearConfig({
        slug: slug.trim(),
        nombre: nombre.trim(),
        descripcion: descripcion?.trim() || null,
      })
      const cfg = await evaluacionesAdminService.listarConfig()
      setEvalConfigRows(cfg)
      if (cfg.length) setEvalSelectedId(cfg[cfg.length - 1].id)
    } catch (e) {
      window.alert(e.message || 'No se pudo crear.')
    }
  }

  const eliminarEvaluacionConfig = async (id) => {
    if (!window.confirm('¿Eliminar esta evaluación y sus rangos asociados en cascada (si aplica en BD)?')) return
    try {
      await evaluacionesAdminService.eliminarConfig(id)
      const cfg = await evaluacionesAdminService.listarConfig()
      setEvalConfigRows(cfg)
      setEvalSelectedId(cfg[0]?.id || null)
    } catch (e) {
      window.alert(e.message || 'No se pudo eliminar.')
    }
  }

  const crearEvalRango = async (payload) => {
    if (!evalSelectedId) return
    try {
      await evaluacionesAdminService.crearRango({
        evaluacion_id: evalSelectedId,
        puntaje_min: Number(payload.puntaje_min),
        puntaje_max: Number(payload.puntaje_max),
        titulo_resultado: payload.titulo_resultado?.trim() || '',
        descripcion_resultado: payload.descripcion_resultado?.trim() || null,
        color_alerta: payload.color_alerta?.trim() || null,
      })
      setEvalRangosRows(await evaluacionesAdminService.listarRangos(evalSelectedId))
    } catch (e) {
      window.alert(e.message || 'No se pudo crear el rango.')
    }
  }

  const eliminarEvalRango = async (id) => {
    if (!window.confirm('¿Eliminar este rango?')) return
    try {
      await evaluacionesAdminService.eliminarRango(id)
      if (evalSelectedId) {
        setEvalRangosRows(await evaluacionesAdminService.listarRangos(evalSelectedId))
      }
    } catch (e) {
      window.alert(e.message || 'No se pudo eliminar.')
    }
  }

  const eliminarComentarioAdmin = async (id) => {
    if (!window.confirm('¿Eliminar comentario?')) return
    try {
      await comentariosAdminService.eliminarAdmin(id)
      setComentariosRows(await comentariosAdminService.listarAdmin())
    } catch (e) {
      window.alert(e.message || 'No se pudo eliminar.')
    }
  }

  const refreshPublicacionesTab = async () => {
    const [pubs, reacts] = await Promise.all([
      publicacionesAdminService.listarAdmin(),
      reaccionesAdminService.listarAdmin(),
    ])
    setPublicacionesRows(pubs)
    setPublicacionesFeed(Array.isArray(pubs) ? pubs : [])
    setReaccionesRows(reacts)
  }

  const savePublicacionAdmin = async () => {
    if (!formPublicacion.slug?.trim() || !formPublicacion.titulo?.trim()) {
      window.alert('Slug y título son obligatorios.')
      return
    }
    if (!formPublicacion.cuerpo_texto?.trim()) {
      window.alert('El cuerpo de texto es obligatorio.')
      return
    }
    let galeria
    let adjuntos
    let links
    let datos_adicionales
    let config_ui
    try {
      galeria = JSON.parse(formPublicacion.galeria_json || '[]')
      adjuntos = JSON.parse(formPublicacion.adjuntos_json || '[]')
      links = JSON.parse(formPublicacion.links_json || '{}')
      datos_adicionales = JSON.parse(formPublicacion.datos_adicionales_json || '{}')
      config_ui = JSON.parse(formPublicacion.config_ui_json || '{}')
    } catch {
      window.alert('Revisá el JSON de galería, adjuntos, links, datos adicionales o config_ui.')
      return
    }
    const fechaIso = (() => {
      const raw = formPublicacion.fecha_publicacion
      if (!raw) return new Date().toISOString()
      const d = new Date(raw)
      return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
    })()
    const payload = {
      tipo: formPublicacion.tipo === 'Evento' ? 'Evento' : 'Noticia',
      slug: formPublicacion.slug.trim(),
      titulo: formPublicacion.titulo.trim(),
      cuerpo_texto: formPublicacion.cuerpo_texto.trim(),
      galeria: Array.isArray(galeria) ? galeria : [],
      adjuntos: Array.isArray(adjuntos) ? adjuntos : [],
      links: links && typeof links === 'object' ? links : {},
      datos_adicionales: datos_adicionales && typeof datos_adicionales === 'object' ? datos_adicionales : {},
      config_ui: config_ui && typeof config_ui === 'object' ? config_ui : {},
      es_publicado: true,
      fecha_publicacion: fechaIso,
    }
    try {
      if (editPublicacionId) {
        await publicacionesAdminService.actualizarAdmin(editPublicacionId, payload)
      } else {
        await publicacionesAdminService.crearAdmin(payload)
      }
      setEditPublicacionId(null)
      setFormPublicacion(emptyFormPublicacion())
      await refreshPublicacionesTab()
    } catch (e) {
      window.alert(e.message || 'No se pudo guardar la publicación.')
    }
  }

  const deletePublicacionAdmin = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación? Se borrarán comentarios y reacciones vinculados.')) return
    try {
      await publicacionesAdminService.eliminarAdmin(id)
      if (editPublicacionId === id) {
        setEditPublicacionId(null)
        setFormPublicacion(emptyFormPublicacion())
      }
      await refreshPublicacionesTab()
    } catch (e) {
      window.alert(e.message || 'No se pudo eliminar.')
    }
  }

  const startEditPublicacion = async (row) => {
    try {
      const full = await publicacionesAdminService.obtenerAdmin(row.id)
      setEditPublicacionId(row.id)
      setFormPublicacion(publicacionRowToForm(full))
    } catch (e) {
      window.alert(e.message || 'No se pudo cargar la publicación.')
    }
  }

  const cancelEditPublicacion = () => {
    setEditPublicacionId(null)
    setFormPublicacion(emptyFormPublicacion())
  }

  const subirImagenesPublicacion = async (files) => {
    const list = Array.isArray(files) ? files : []
    if (!list.length) return
    const slugPart = String(formPublicacion.slug || '')
      .trim()
      .replace(/[^a-zA-Z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
    const folder = editPublicacionId || slugPart || `borrador-${Date.now()}`
    try {
      const newUrls = []
      for (const file of list) {
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `publicaciones/${folder}/${crypto.randomUUID?.() || Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { publicUrl } = await uploadPublicFile({ path, file })
        newUrls.push(publicUrl)
      }
      setFormPublicacion((s) => {
        let galeria
        try {
          galeria = JSON.parse(s.galeria_json || '[]')
        } catch {
          return s
        }
        if (!Array.isArray(galeria)) galeria = []
        return { ...s, galeria_json: JSON.stringify([...galeria, ...newUrls], null, 2) }
      })
    } catch (e) {
      window.alert(e.message || 'No se pudieron subir las imágenes.')
    }
  }

  const quitarImagenPublicacion = (index) => {
    setFormPublicacion((s) => {
      try {
        const galeria = JSON.parse(s.galeria_json || '[]')
        if (!Array.isArray(galeria) || index < 0 || index >= galeria.length) return s
        const next = galeria.filter((_, i) => i !== index)
        return { ...s, galeria_json: JSON.stringify(next, null, 2) }
      } catch {
        return s
      }
    })
  }

  const eliminarReaccionAdmin = async (publicacionId, perfilId) => {
    if (!window.confirm('¿Quitar esta reacción?')) return
    try {
      await reaccionesAdminService.eliminarAdmin(publicacionId, perfilId)
      setReaccionesRows(await reaccionesAdminService.listarAdmin())
    } catch (e) {
      window.alert(e.message || 'No se pudo quitar la reacción.')
    }
  }

  const addCodigoAcceso = async () => {
    if (!formCodigoAcceso.codigo.trim()) {
      window.alert('El código es obligatorio.')
      return
    }
    if (formCodigoAcceso.tipo === 'INVITADO' && !formCodigoAcceso.email.trim()) {
      window.alert('Para tipo INVITADO indica el correo específico.')
      return
    }
    try {
      setCodigoAccesoError('')
      await accessCodeService.crearCodigoAcceso({
        codigo: formCodigoAcceso.codigo.trim(),
        tipo: formCodigoAcceso.tipo,
        rol: formCodigoAcceso.rol,
        email: formCodigoAcceso.email,
        dominioPermitido: formCodigoAcceso.dominioPermitido,
        descripcion: formCodigoAcceso.descripcion,
        usoMaximo: Number(formCodigoAcceso.usoMaximo),
        fechaExp: new Date(formCodigoAcceso.fechaExp).toISOString(),
      })
      setFormCodigoAcceso({
        codigo: '',
        tipo: 'ALUMNOS',
        rol: 'alumno',
        email: '',
        dominioPermitido: '',
        descripcion: '',
        usoMaximo: -1,
        fechaExp: '2026-12-31T23:59',
      })
      const rows = await accessCodeService.verCodigos()
      setCodigosAcceso(Array.isArray(rows) ? rows : [])
    } catch (e) {
      const msg = e.message || 'No se pudo crear el código.'
      setCodigoAccesoError(msg)
      window.alert(msg)
    }
  }

  const desactivarCodigoAcceso = async (id) => {
    if (!id || !window.confirm('¿Desactivar este código de acceso?')) return
    try {
      await accessCodeService.desactivarCodigoAdmin({ id })
      const rows = await accessCodeService.verCodigos()
      setCodigosAcceso(Array.isArray(rows) ? rows : [])
    } catch (e) {
      window.alert(e.message || 'No se pudo desactivar.')
    }
  }

  const addInstrument = () => {
    const slug = formInstrumento.key.replace(/[^a-zA-Z0-9]/g, '')
    if (!slug) {
      window.alert('Indicá una clave válida (solo letras y números, ej. miTest).')
      return
    }
    if (!formInstrumento.label.trim()) {
      window.alert('El título es obligatorio.')
      return
    }
    if (editInstrumentKey) {
      setInstrumentos((prev) =>
        prev.map((i) =>
          i.key === editInstrumentKey
            ? { key: editInstrumentKey, label: formInstrumento.label.trim(), desc: formInstrumento.desc.trim() }
            : i,
        ),
      )
      setEditInstrumentKey(null)
    } else {
      if (instrumentos.some((i) => i.key === slug)) {
        window.alert('Ya existe un instrumento con esa clave.')
        return
      }
      setInstrumentos((prev) => [
        ...prev,
        { key: slug, label: formInstrumento.label.trim(), desc: formInstrumento.desc.trim() },
      ])
    }
    setFormInstrumento({ key: '', label: '', desc: '' })
  }

  const deleteInstrument = (key) => {
    if (!window.confirm('¿Eliminar este instrumento del sitio?')) return
    setInstrumentos((prev) => prev.filter((i) => i.key !== key))
    if (editInstrumentKey === key) {
      setEditInstrumentKey(null)
      setFormInstrumento({ key: '', label: '', desc: '' })
    }
  }

  const startEditInstrument = (row) => {
    setEditInstrumentKey(row.key)
    setFormInstrumento({ key: row.key, label: row.label, desc: row.desc })
  }

  const cancelEditInstrument = () => {
    setEditInstrumentKey(null)
    setFormInstrumento({ key: '', label: '', desc: '' })
  }

  const addVideo = async () => {
    if (!formVideo.title.trim()) {
      window.alert('El título es obligatorio.')
      return
    }
    try {
      if (editVideoId) {
        await videosInteresService.actualizarAdmin(editVideoId, {
          title: formVideo.title.trim(),
          description: formVideo.description.trim(),
        })
        setEditVideoId(null)
      } else {
        const ytId = parseYoutubeId(formVideo.id)
        if (!ytId) {
          window.alert('Pegá un enlace de YouTube válido o el ID de 11 caracteres.')
          return
        }
        const rowYoutubeId = (v) =>
          String(v.youtube_id || '').trim() ||
          (/^[\w-]{11}$/.test(String(v.id)) ? String(v.id) : '')
        if (videosInteres.some((v) => rowYoutubeId(v) === ytId)) {
          window.alert('Ese video ya está en la lista.')
          return
        }
        await videosInteresService.crearAdmin({
          youtube_id: ytId,
          title: formVideo.title.trim(),
          description: formVideo.description.trim(),
        })
      }
      const rows = await videosInteresService.listarAdmin()
      setVideosInteres(Array.isArray(rows) ? rows : [])
      setFormVideo({ id: '', title: '', description: '' })
    } catch (e) {
      window.alert(e.message || 'No se pudo guardar el video.')
    }
  }

  const deleteVideo = async (id) => {
    if (!window.confirm('¿Quitar este video de «De interés»?')) return
    try {
      await videosInteresService.eliminarAdmin(id)
      const rows = await videosInteresService.listarAdmin()
      setVideosInteres(Array.isArray(rows) ? rows : [])
      if (editVideoId === id) {
        setEditVideoId(null)
        setFormVideo({ id: '', title: '', description: '' })
      }
    } catch (e) {
      window.alert(e.message || 'No se pudo eliminar el video.')
    }
  }

  const startEditVideo = (v) => {
    setEditVideoId(v.id)
    setFormVideo({
      id: String(v.youtube_id || '').trim(),
      title: v.title || '',
      description: v.description || '',
    })
  }

  const cancelEditVideo = () => {
    setEditVideoId(null)
    setFormVideo({ id: '', title: '', description: '' })
  }

  const saveArticuloAdmin = async () => {
    if (!formArticulo.titulo?.trim()) {
      window.alert('El título es obligatorio.')
      return
    }
    try {
      let archivoUrl = String(formArticulo.archivo_url || '').trim()
      let archivoPath = String(formArticulo.archivo_path || '').trim() || null

      const id = editArticuloId || crypto.randomUUID()

      if (articuloArchivos.pdf) {
        const f = articuloArchivos.pdf
        const lower = (f.name || '').toLowerCase()
        if (!lower.endsWith('.pdf') && f.type !== 'application/pdf') {
          window.alert('El documento debe ser un PDF.')
          return
        }
        if (archivoPath) await removePublicFile(archivoPath)
        const { path: p, publicUrl } = await uploadPublicFile({
          path: `divulgacion/${id}/documento.pdf`,
          file: articuloArchivos.pdf,
        })
        archivoPath = p
        archivoUrl = publicUrl
      }

      if (!archivoUrl) {
        window.alert('Subí un archivo PDF para el artículo.')
        return
      }

      const payloadBase = {
        titulo: formArticulo.titulo.trim(),
        descripcion: String(formArticulo.descripcion || '').trim() || null,
        archivo_url: archivoUrl,
        archivo_path: archivoPath,
        orden: Number(formArticulo.orden) || 0,
        es_visible: true,
      }

      if (editArticuloId) {
        await divulgacionArticulosService.actualizarAdmin(editArticuloId, payloadBase)
      } else {
        await divulgacionArticulosService.crearAdmin({ id, ...payloadBase, tipo: 'Artículo' })
      }

      await syncArticulosDivulgacion()
      setEditArticuloId(null)
      setFormArticulo(emptyFormArticulo())
      setArticuloArchivos({ pdf: null })
    } catch (e) {
      window.alert(
        e.message ||
          'No se pudo guardar. Si la tabla no existe, ejecutá la migración SQL en Supabase (divulgacion_articulos).',
      )
    }
  }

  const deleteArticuloAdmin = async (id) => {
    if (!window.confirm('¿Eliminar este artículo y sus archivos asociados?')) return
    try {
      const row = articulosDivulgacion.find((a) => a.id === id)
      if (row?.archivo_path) await removePublicFile(row.archivo_path)
      if (row?.portada_path) await removePublicFile(row.portada_path)
      await divulgacionArticulosService.eliminarAdmin(id)
      await syncArticulosDivulgacion()
      if (editArticuloId === id) {
        setEditArticuloId(null)
        setFormArticulo(emptyFormArticulo())
        setArticuloArchivos({ pdf: null })
      }
    } catch (e) {
      window.alert(e.message || 'No se pudo eliminar.')
    }
  }

  const startEditArticulo = (row) => {
    setEditArticuloId(row.id)
    setFormArticulo({
      titulo: row.titulo || '',
      descripcion: row.descripcion || '',
      archivo_url: row.archivo_url || '',
      archivo_path: row.archivo_path || '',
      orden: String(row.orden ?? 0),
    })
    setArticuloArchivos({ pdf: null })
  }

  const cancelEditArticulo = () => {
    setEditArticuloId(null)
    setFormArticulo(emptyFormArticulo())
    setArticuloArchivos({ pdf: null })
  }

  const openProyectoInvPagina = (proyecto) => {
    setProyectoInvDetalleId(proyecto.id)
    setProyectoInvDetalle({ loading: true, item: null, error: null })
    setCurrentPage('proyectosInvDetalle')
    setSidebarOpen(false)
  }

  const backFromProyectoInvDetalle = () => {
    setProyectoInvDetalleId(null)
    setProyectoInvDetalle({ loading: false, item: null, error: null })
    setCurrentPage('proyectosInv')
    setSidebarOpen(false)
  }

  const closeDetailModal = () => {
    setDetailModal({ open: false, type: null, item: null })
  }

  const peso = parseFloat(imc.peso)
  const estaturaM = parseFloat(imc.estatura) / 100
  const imcValor = peso && estaturaM > 0 ? (peso / (estaturaM * estaturaM)).toFixed(1) : null
  const imcCategoria = imcValor
    ? (imcValor < 18.5 ? 'Bajo peso' : imcValor < 25 ? 'Normal' : imcValor < 30 ? 'Sobrepeso' : 'Obesidad')
    : null

  return (
    <div className="dashboard">
      <Navbar onOpenMenu={() => setSidebarOpen(true)} onSiteSearch={handleSiteSearch} />

      <Sidebar
        open={sidebarOpen}
        currentPage={currentPage}
        user={user}
        integrantes={integrantes}
        instrumentos={instrumentos}
        onNavigate={goTo}
        onIntegranteClick={(persona) => navigateToIntegranteDetalle(persona)}
        onLogout={handleLogout}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="dashboard-body">
      <main className="main-content">
        {currentPage === 'inicio' && (
          <Home
            onNavigate={goTo}
            areasRef={areasRef}
            onScrollToAreas={scrollToAreas}
            onSiteSearch={handleSiteSearch}
          />
        )}

        {currentPage === 'instrumentos' && (
          <div className="page-content page-instrumentos">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Instrumentos de Test</h1>
            <p className="page-subtitle">Seleccione el instrumento que desea utilizar.</p>
            <div className="instrumentos-grid">
              {instrumentos.map((item) => (
                <article key={item.key} className="instrumento-card" onClick={() => goTo(item.key)}>
                  <h3 className="instrumento-card-title">{item.label}</h3>
                  <p className="instrumento-card-desc">{item.desc}</p>
                  <span className="area-card-cta">Abrir</span>
                </article>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'login' && (
          <div className="page-content page-login">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Inicio de sesión</h1>
            <p className="page-subtitle">
              Acceso al panel de administración: solo cuentas con rol <strong>admin</strong> en la tabla{' '}
              <code>perfiles</code> de Supabase.
            </p>
            <form className="form-login" onSubmit={handleLogin}>
              <label>
                <span>Correo electrónico</span>
                <input type="email" value={loginForm.email} onChange={(e) => setLoginForm((s) => ({ ...s, email: e.target.value }))} required placeholder="tu@correo.com" />
              </label>
              <label>
                <span>Contraseña</span>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))} required />
              </label>
              {loginError && <p className="form-login-error">{loginError}</p>}
              <button type="submit" className="btn btn-primary btn-block">Entrar</button>
              <p className="form-login-register-hint">
                ¿No tienes cuenta?{' '}
                <button type="button" className="form-login-register-link" onClick={() => goTo('registro')}>
                  Registrar
                </button>
              </p>
            </form>
          </div>
        )}

        {currentPage === 'registro' && (
          <div className="page-content page-login">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Registrar</h1>
            <p className="page-subtitle">
              Crea tu cuenta con el código de acceso que te proporcionó la facultad. Si debes confirmar el correo,
              revisa tu bandeja de entrada.
            </p>
            {registerOk ? (
              <div className="form-login">
                <p className="form-login-success">Registro enviado. Si hay confirmación por correo, ábrela y luego puedes ingresar.</p>
                <button type="button" className="btn btn-primary btn-block" onClick={() => goTo('login')}>
                  Ir a inicio de sesión
                </button>
              </div>
            ) : (
              <form className="form-login" onSubmit={handleRegister}>
                <label>
                  <span>Nombres</span>
                  <input
                    type="text"
                    value={registerForm.nombres}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, nombres: e.target.value }))}
                    required
                    autoComplete="given-name"
                  />
                </label>
                <label>
                  <span>Apellidos</span>
                  <input
                    type="text"
                    value={registerForm.apellidos}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, apellidos: e.target.value }))}
                    required
                    autoComplete="family-name"
                  />
                </label>
                <label>
                  <span>Matrícula (si aplica)</span>
                  <input
                    type="text"
                    value={registerForm.matricula}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, matricula: e.target.value }))}
                    placeholder="Opcional según tu tipo de acceso"
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </label>
                <label>
                  <span>Código de acceso</span>
                  <input
                    type="text"
                    value={registerForm.codigo}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, codigo: e.target.value }))}
                    required
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>Contraseña</span>
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, password: e.target.value }))}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </label>
                <label>
                  <span>Confirmar contraseña</span>
                  <input
                    type="password"
                    value={registerForm.password2}
                    onChange={(e) => setRegisterForm((s) => ({ ...s, password2: e.target.value }))}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </label>
                {registerError && <p className="form-login-error">{registerError}</p>}
                <button type="submit" className="btn btn-primary btn-block">Crear cuenta</button>
                <p className="form-login-register-hint">
                  ¿Ya tienes cuenta?{' '}
                  <button type="button" className="form-login-register-link" onClick={() => goTo('login')}>
                    Ingresar
                  </button>
                </p>
              </form>
            )}
          </div>
        )}

        {currentPage === 'admin' && user?.isAdmin && (
          <AdminPanel
            onBackHome={() => goTo('inicio')}
            onLogout={handleLogout}
            adminSection={adminSection}
            setAdminSection={setAdminSection}
            projects={projects}
            formProyecto={formProyecto}
            setFormProyecto={setFormProyecto}
            editProyectoId={editProyectoId}
            addProyecto={addProyecto}
            deleteProyecto={deleteProyecto}
            startEditProyecto={startEditProyecto}
            cancelEditProyecto={cancelEditProyecto}
            integrantes={integrantes}
            editIntegranteId={editIntegranteId}
            deleteIntegrante={deleteIntegrante}
            startEditIntegrante={startEditIntegrante}
            cancelEditIntegrante={cancelEditIntegrante}
            instrumentos={instrumentos}
            formInstrumento={formInstrumento}
            setFormInstrumento={setFormInstrumento}
            editInstrumentKey={editInstrumentKey}
            addInstrument={addInstrument}
            deleteInstrument={deleteInstrument}
            startEditInstrument={startEditInstrument}
            cancelEditInstrument={cancelEditInstrument}
            videosInteres={videosInteres}
            formVideo={formVideo}
            setFormVideo={setFormVideo}
            editVideoId={editVideoId}
            addVideo={addVideo}
            deleteVideo={deleteVideo}
            startEditVideo={startEditVideo}
            cancelEditVideo={cancelEditVideo}
            codigosAcceso={codigosAcceso}
            codigosAccesoLoading={codigosAccesoLoading}
            codigoAccesoError={codigoAccesoError}
            formCodigoAcceso={formCodigoAcceso}
            setFormCodigoAcceso={setFormCodigoAcceso}
            addCodigoAcceso={addCodigoAcceso}
            desactivarCodigoAcceso={desactivarCodigoAcceso}
            docentesFull={docentesFull}
            formDocente={formDocente}
            docenteArchivos={docenteArchivos}
            setFormDocente={setFormDocente}
            setDocenteArchivos={setDocenteArchivos}
            addDocente={addDocente}
            subirImagenesGaleriaProyecto={subirImagenesGaleriaProyecto}
            subirPortadaProyecto={subirPortadaProyecto}
            subirImagenesProyectoNuevo={subirImagenesProyectoNuevo}
            inscripcionRows={inscripcionRows}
            formInscripcion={formInscripcion}
            setFormInscripcion={setFormInscripcion}
            editInscripcionId={editInscripcionId}
            setInscripcionArchivo={setInscripcionArchivo}
            inscripcionArchivo={inscripcionArchivo}
            inscripcionAdminNotice={inscripcionAdminNotice}
            dismissInscripcionNotice={() => setInscripcionAdminNotice(null)}
            saveInscripcion={saveInscripcion}
            deleteInscripcion={deleteInscripcion}
            startEditInscripcion={startEditInscripcion}
            cancelEditInscripcion={cancelEditInscripcion}
            perfilesRows={perfilesRows}
            editPerfilId={editPerfilId}
            formPerfil={formPerfil}
            setFormPerfil={setFormPerfil}
            setPerfilArchivo={setPerfilArchivo}
            savePerfilAdmin={savePerfilAdmin}
            startEditPerfil={startEditPerfil}
            cancelEditPerfil={cancelEditPerfil}
            servicioConfigRows={servicioConfigRows}
            servicioRegistrosRows={servicioRegistrosRows}
            patchServicioConfig={patchServicioConfig}
            patchServicioRegistro={patchServicioRegistro}
            evalConfigRows={evalConfigRows}
            evalSelectedId={evalSelectedId}
            setEvalSelectedId={setEvalSelectedId}
            evalRangosRows={evalRangosRows}
            evalResultadosRows={evalResultadosRows}
            crearEvaluacionConfig={crearEvaluacionConfig}
            eliminarEvaluacionConfig={eliminarEvaluacionConfig}
            crearEvalRango={crearEvalRango}
            eliminarEvalRango={eliminarEvalRango}
            comentariosRows={comentariosRows}
            eliminarComentarioAdmin={eliminarComentarioAdmin}
            publicacionesRows={publicacionesRows}
            reaccionesRows={reaccionesRows}
            formPublicacion={formPublicacion}
            setFormPublicacion={setFormPublicacion}
            editPublicacionId={editPublicacionId}
            savePublicacionAdmin={savePublicacionAdmin}
            deletePublicacionAdmin={deletePublicacionAdmin}
            startEditPublicacion={startEditPublicacion}
            cancelEditPublicacion={cancelEditPublicacion}
            eliminarReaccionAdmin={eliminarReaccionAdmin}
            subirImagenesPublicacion={subirImagenesPublicacion}
            quitarImagenPublicacion={quitarImagenPublicacion}
            articulosDivulgacion={articulosDivulgacion}
            formArticulo={formArticulo}
            setFormArticulo={setFormArticulo}
            editArticuloId={editArticuloId}
            articuloArchivos={articuloArchivos}
            setArticuloArchivos={setArticuloArchivos}
            saveArticuloAdmin={saveArticuloAdmin}
            deleteArticuloAdmin={deleteArticuloAdmin}
            startEditArticulo={startEditArticulo}
            cancelEditArticulo={cancelEditArticulo}
          />
        )}

        {currentPage === 'proyectos' && (
          <DivulgacionCientifica
            articulos={articulosDivulgacion}
            heroSrc={HERO_DIVULGACION}
            onBack={() => goTo('inicio')}
          />
        )}

        {currentPage === 'proyectosInv' && (
          <ProyectosInvestigacion
            projects={projects}
            heroSrc={HERO_PROYECTOS_INV}
            onBackHome={() => goTo('inicio')}
            onOpenProject={openProyectoInvPagina}
          />
        )}

        {currentPage === 'proyectosInvDetalle' && (
          <ProyectoInvestigacionDetalle
            item={proyectoInvDetalle.item}
            loading={proyectoInvDetalle.loading}
            error={proyectoInvDetalle.error}
            onBack={backFromProyectoInvDetalle}
          />
        )}

        {currentPage === 'inscripcion' && (
          <div className="page-content page-inscripcion page-inscripcion-root">
            <section className="inscripcion-hero" aria-label="Cabecera de inscripción">
              <img
                src={HERO_INSCRIPCION}
                alt=""
                className="inscripcion-hero-photo"
              />
              <div className="inscripcion-hero-scrim" aria-hidden />
              <div className="inscripcion-hero-inner">
                <button type="button" className="inscripcion-hero-back" onClick={() => goTo('inicio')}>
                  ← Volver a inicio
                </button>
                <h1 className="inscripcion-hero-title">Inscripción de Proyectos de Investigación</h1>
                <div className="inscripcion-hero-search">
                  <label htmlFor="inscripcion-docs-filter" className="visually-hidden">
                    Buscar formatos o anexos
                  </label>
                  <svg
                    className="inscripcion-hero-search-icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                  <input
                    id="inscripcion-docs-filter"
                    type="search"
                    className="inscripcion-hero-search-input"
                    placeholder="Buscar formatos o anexos…"
                    value={inscripcionDocsFilter}
                    onChange={(e) => setInscripcionDocsFilter(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
            </section>
            <div className="inscripcion-hero-rule" aria-hidden />
            <div className="inscripcion-layout">
              <section className="inscripcion-tramite" aria-labelledby="inscripcion-tramite-title">
                <h2 id="inscripcion-tramite-title" className="inscripcion-tramite-title">
                  Trámite para inscripción de Proyectos en la Facultad
                </h2>
                <p className="inscripcion-tramite-intro">
                  Para la inscripción de un proyecto de investigación deberá completar el trámite correspondiente:
                </p>
                <ol className="inscripcion-tramite-list">
                  <li>
                    Complementar debidamente el <strong>Formato 1</strong> (Registro de Trabajo de Investigación y
                    solicitud de Asesores).
                  </li>
                  <li>
                    Tener firmado el <strong>Formato 2</strong> (Carta de Aceptación de Asesoría).
                  </li>
                  <li>
                    Protocolo de Investigación <strong>Anexo 1</strong>.
                  </li>
                  <li>
                    Llevarlos físicamente a la coordinación de investigación (cubículo 4 de oficinas de tiempos
                    completos) con el Dr. Mario Villarreal.
                  </li>
                  <li>
                    Una vez entregados dichos documentos se valorará el protocolo para su posible aceptación y registro
                    en un tiempo máximo de 10 días. Siendo este aceptado se procederá a la entrega del{' '}
                    <strong>Formato 3</strong> (Carta de Aceptación); en caso contrario se pedirá corregir el protocolo
                    en relación con los comentarios del revisor; una vez corregido se podrá solicitar la inscripción del
                    proyecto.
                  </li>
                  <li>
                    Una vez concluido el estudio se deberá entregar el <strong>Formato 4</strong> (Carta de Investigación
                    Concluida).
                  </li>
                  <li>
                    Por último, la coordinación le entregará el <strong>Formato 5</strong> (Autorización de Trámites de
                    Titulación).
                  </li>
                </ol>
              </section>
              <section className="inscripcion-docs-wrap" aria-labelledby="inscripcion-formatos-title">
                <h2 id="inscripcion-formatos-title" className="inscripcion-docs-title">
                  Formatos y documentos
                </h2>
                {inscripcionPublicLoading ? (
                  <p className="inscripcion-docs-loading">Cargando documentos…</p>
                ) : inscripcionPublicRows.length === 0 ? (
                  <p className="inscripcion-docs-empty">Aún no hay documentos publicados en esta sección.</p>
                ) : inscripcionFilteredDocs.length === 0 ? (
                  <p className="inscripcion-docs-empty">
                    No hay formatos que coincidan con «{inscripcionDocsFilter.trim()}». Prueba otra palabra o borra el
                    filtro.
                  </p>
                ) : (
                  <div className="inscripcion-docs-grid">
                    {inscripcionFilteredDocs.map((row, i) => (
                      <InscripcionPublicDocCard
                        key={row.id}
                        row={row}
                        index={i}
                        fileUrlFixed={row.file_url ? fixPublicStorageUrl(row.file_url) : ''}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>
            <InscripcionHelpAside />
          </div>
        )}

        {currentPage === 'grupo' && (
          <CuerpoAcademico
            integrantes={integrantes}
            heroSrc={HERO_CUERPO_ACADEMICO}
            onBackHome={() => goTo('inicio')}
            onOpenIntegrante={navigateToIntegranteDetalle}
          />
        )}

        {currentPage === 'grupoDetalle' && (
          <IntegranteDetallePage
            integrante={integrantes.find((i) => i.id === grupoDetalleId) ?? null}
            onBack={() => goTo('grupo')}
          />
        )}

        {currentPage === 'formularioServicio' && (
          <div className="page-content page-formulario page-formulario-v2">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <header className="form-servicio-page-head">
              <p className="form-servicio-page-eyebrow">Coordinación de investigación</p>
              <h1 className="form-servicio-page-title">Registro para servicio en laboratorio</h1>
              <p className="form-servicio-page-lead">
                FCCFyD · Completa tus datos y la coordinación te contactará por correo.
              </p>
            </header>
            <div className="form-servicio-layout form-servicio-layout-v2">
              <aside className="form-servicio-info form-servicio-info-v2">
                <div className="form-servicio-info-card">
                  <h2 className="form-servicio-info-v2-title">¿Qué harás en tu servicio?</h2>
                  <ul className="form-servicio-info-list">
                    <li>Evaluación del movimiento humano y apoyo en recolección de datos.</li>
                    <li>Uso de instrumentos de test y actividades de divulgación científica.</li>
                    <li>Apoyo en eventos, talleres y asesorías con el cuerpo académico.</li>
                  </ul>
                  <div className="form-servicio-info-badge">
                    <span className="form-servicio-info-badge-icon" aria-hidden>
                      ✉
                    </span>
                    <p>
                      Al enviar el formulario recibirás notificación en el correo que indiques con los
                      siguientes pasos.
                    </p>
                  </div>
                </div>
              </aside>
              <div className="form-servicio-wrap form-servicio-wrap-v2">
                {correoEnviado ? (
                  <div className="form-servicio-ok form-servicio-ok-v2">
                    <span className="form-servicio-ok-icon form-servicio-ok-icon-v2" aria-hidden>
                      ✓
                    </span>
                    <h2>Registro enviado</h2>
                    <p>
                      Tu información fue recibida. Revisa tu bandeja de entrada para la confirmación y
                      las indicaciones de la coordinación.
                    </p>
                  </div>
                ) : (
                  <form className="form-servicio form-servicio-v2" onSubmit={handleFormServicio}>
                    <div className="form-servicio-v2-header">
                      <h3 className="form-servicio-v2-form-title">Datos del solicitante</h3>
                      <p className="form-servicio-v2-form-hint">Los campos marcados son obligatorios.</p>
                    </div>
                    <div className="form-servicio-v2-grid">
                      <label className="form-servicio-field">
                        <span>Nombre completo</span>
                        <input
                          type="text"
                          value={formServicio.nombre}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, nombre: e.target.value }))
                          }
                          required
                          placeholder="Ej. Juan Pérez García"
                        />
                      </label>
                      <label className="form-servicio-field">
                        <span>Matrícula</span>
                        <input
                          type="text"
                          value={formServicio.matricula}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, matricula: e.target.value }))
                          }
                          required
                          placeholder="Número de matrícula"
                        />
                      </label>
                      <label className="form-servicio-field">
                        <span>Semestre</span>
                        <input
                          type="text"
                          value={formServicio.semestre}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, semestre: e.target.value }))
                          }
                          required
                          placeholder="Ej. 8"
                        />
                      </label>
                      <label className="form-servicio-field">
                        <span>Grupo</span>
                        <input
                          type="text"
                          value={formServicio.grupo}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, grupo: e.target.value }))
                          }
                          required
                          placeholder="Ej. A"
                        />
                      </label>
                      <label className="form-servicio-field form-servicio-field-span">
                        <span>Correo electrónico</span>
                        <input
                          type="email"
                          value={formServicio.correo}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, correo: e.target.value }))
                          }
                          required
                          placeholder="correo@ejemplo.com"
                        />
                      </label>
                      <label className="form-servicio-field form-servicio-field-span">
                        <span>Celular</span>
                        <input
                          type="tel"
                          value={formServicio.celular}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, celular: e.target.value }))
                          }
                          required
                          placeholder="10 dígitos"
                        />
                      </label>
                      <label className="form-servicio-field form-servicio-field-full">
                        <span>Cuéntanos sobre ti y tus áreas de interés</span>
                        <textarea
                          rows={4}
                          value={formServicio.comentario}
                          onChange={(e) =>
                            setFormServicio((s) => ({ ...s, comentario: e.target.value }))
                          }
                          required
                          placeholder="Describe brevemente tu interés o disponibilidad…"
                        />
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block form-servicio-submit">
                      Enviar registro
                    </button>
                  </form>
                )}
                {servicioTerminosOpen ? (
                  <div className="form-servicio-terms-backdrop" role="dialog" aria-modal="true">
                    <div className="form-servicio-terms-modal">
                      <h3>Términos y condiciones</h3>
                      <p>
                        Al continuar, autorizas que tus datos sean utilizados únicamente para fines educativos y
                        administrativos relacionados con el programa de servicio social.
                      </p>
                      <label className="form-servicio-terms-check">
                        <input
                          type="checkbox"
                          checked={servicioTerminosAceptados}
                          onChange={(e) => setServicioTerminosAceptados(e.target.checked)}
                        />
                        <span>Acepto el uso educativo de mis datos personales.</span>
                      </label>
                      {servicioSubmitError ? <p className="form-login-error">{servicioSubmitError}</p> : null}
                      <div className="form-servicio-terms-actions">
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => {
                            setServicioTerminosOpen(false)
                            setServicioSubmitError('')
                          }}
                          disabled={servicioSubmitBusy}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={confirmarTerminosServicio}
                          disabled={servicioSubmitBusy}
                        >
                          {servicioSubmitBusy ? 'Enviando…' : 'Aceptar y enviar'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'calculadoraIMC' && (
          <div className="page-content page-imc">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Calculadora IMC</h1>
            <p className="page-subtitle">Instrumentos de Test — Índice de Masa Corporal (kg/m²)</p>
            <div className="imc-calculadora">
              <div className="imc-inputs">
                <label><span>Peso (kg)</span><input type="number" min="20" max="300" step="0.1" placeholder="Ej. 70" value={imc.peso} onChange={(e) => setImc((s) => ({ ...s, peso: e.target.value }))} /></label>
                <label><span>Estatura (cm)</span><input type="number" min="100" max="250" step="1" placeholder="Ej. 170" value={imc.estatura} onChange={(e) => setImc((s) => ({ ...s, estatura: e.target.value }))} /></label>
              </div>
              {imcValor && (
                <div className="imc-resultado">
                  <p className="imc-valor">IMC: <strong>{imcValor}</strong></p>
                  <p className={`imc-categoria imc-${imcCategoria.toLowerCase().replace(' ', '')}`}>{imcCategoria}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage !== 'calculadoraIMC' &&
          instrumentos.some((i) => i.key === currentPage) && (() => {
            const inst = instrumentos.find((i) => i.key === currentPage)
            const detail = inst?.detail
            return (
              <div className="page-content page-instrumento-info">
                <button type="button" className="back-home" onClick={() => goTo('inicio')}>
                  ← Volver a inicio
                </button>
                <h1 className="page-title">{inst?.label}</h1>
                <p className="page-subtitle">{inst?.desc}</p>
                {detail && <InstrumentoDetail detail={detail} />}
              </div>
            )
          })()}

        {currentPage === 'eventos' && (
          <Eventos
            onBack={() => goTo('inicio')}
            onOpenPost={openPublicacionDetalle}
            events={eventosPublicados}
            user={user}
            heroSrc={HERO_PUBLICACIONES}
          />
        )}

        {currentPage === 'publicacionDetalle' && (
          <PublicacionDetallePage
            item={publicacionDetalleItem}
            user={user}
            onBack={() => goTo('eventos')}
            heroSrc={HERO_PUBLICACION_DETALLE}
          />
        )}

        {currentPage === 'interes' && (
          <Interes onBack={() => goTo('inicio')} videos={videosInteres} heroSrc={HERO_INTERES} />
        )}

        <DetailModal detail={detailModal} onClose={closeDetailModal} />
      </main>
      <Footer />
      </div>
    </div>
  )
}

export default App
