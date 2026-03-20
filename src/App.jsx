import { useState, useRef, useMemo } from 'react'
import './App.css'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import DetailModal from './components/DetailModal.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Interes from './pages/Interes.jsx'
import AdminPanel from './pages/AdminPanel.jsx'
import { INSTRUMENTOS_LIST as INITIAL_INSTRUMENTOS } from './data/instrumentos.js'
import { VIDEOS_INTERES as INITIAL_VIDEOS } from './data/videosInteres.js'
import { getSearchEntries, resolveSiteSearch } from './data/siteSearch.js'

function parseYoutubeId(raw) {
  const s = String(raw || '').trim()
  const m =
    s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/i) || s.match(/^([\w-]{11})$/)
  return m ? m[1] : ''
}

const ADMIN_EMAIL = 'admin@cimohu.edu.mx'
const ADMIN_PASSWORD = 'cimohu2025'

const ICON_MAP = { flask: '🧪', chip: '⚙️', leaf: '🌿', book: '📚' }

const INITIAL_PROYECTOS = [
  { id: '1', title: 'Innovación en Biotecnología', cat: 'Ciencias de la Salud', status: 'En curso', icon: 'flask', desc: 'Líneas de investigación y proyectos activos en esta área.' },
  { id: '2', title: 'Inteligencia Artificial Aplicada', cat: 'Tecnología', status: 'En curso', icon: 'chip', desc: 'Líneas de investigación y proyectos activos en esta área.' },
  { id: '3', title: 'Sostenibilidad Ambiental', cat: 'Ciencias Ambientales', status: 'En curso', icon: 'leaf', desc: 'Líneas de investigación y proyectos activos en esta área.' },
  { id: '4', title: 'Educación e Innovación Pedagógica', cat: 'Ciencias de la Educación', status: 'Planificación', icon: 'book', desc: 'Líneas de investigación y proyectos activos en esta área.' },
]

const INITIAL_INTEGRANTES = [
  { id: '1', nombre: 'Dr. Mario Villarreal', rol: 'Coordinación de investigación', disciplina: 'FCCFyD' },
  { id: '2', nombre: 'Dr. Jesús Gallegos', rol: 'Cuerpo académico', disciplina: 'FCCFyD' },
  { id: '3', nombre: 'Dra. Brenda Rodríguez', rol: 'Cuerpo académico', disciplina: 'FCCFyD' },
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState('inicio')
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [projects, setProjects] = useState(INITIAL_PROYECTOS)
  const [integrantes, setIntegrantes] = useState(INITIAL_INTEGRANTES)
  const [instrumentos, setInstrumentos] = useState(() => [...INITIAL_INSTRUMENTOS])
  const [videosInteres, setVideosInteres] = useState(() => [...INITIAL_VIDEOS])
  const [formInstrumento, setFormInstrumento] = useState({ key: '', label: '', desc: '' })
  const [editInstrumentKey, setEditInstrumentKey] = useState(null)
  const [formVideo, setFormVideo] = useState({ id: '', title: '', description: '' })
  const [editVideoId, setEditVideoId] = useState(null)
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
  const [imc, setImc] = useState({ peso: '', estatura: '' })
  const areasRef = useRef(null)

  const [adminSection, setAdminSection] = useState('proyectos')
  const [editProyectoId, setEditProyectoId] = useState(null)
  const [editIntegranteId, setEditIntegranteId] = useState(null)
  const [formProyecto, setFormProyecto] = useState({ title: '', cat: '', status: 'En curso', icon: 'flask', desc: '' })
  const [formIntegrante, setFormIntegrante] = useState({ nombre: '', rol: '', disciplina: '' })
  const [detailModal, setDetailModal] = useState({ open: false, type: null, item: null })

  const searchEntries = useMemo(() => getSearchEntries(instrumentos), [instrumentos])

  const scrollToAreas = () => {
    areasRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const goTo = (page) => {
    setCurrentPage(page)
    setSidebarOpen(false)
  }

  const handleSiteSearch = (rawQuery) => {
    const q = (rawQuery || '').trim()
    if (!q) {
      window.alert(
        'Escribe palabras clave (ej.: divulgación, eventos, formulario, IMC, MoCA, senior, video…) y pulsa Enter.',
      )
      return
    }
    const page = resolveSiteSearch(q, searchEntries)
    if (page) {
      goTo(page)
      return
    }
    window.alert(
      'No encontramos una sección con esa búsqueda. Prueba: inicio, divulgación, inscripción, grupo, servicio, instrumentos, video, IMC, sesión…',
    )
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setLoginError('')
    if (loginForm.email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || loginForm.password !== ADMIN_PASSWORD) {
      setLoginError('Solo un correo autorizado puede acceder.')
      return
    }
    setUser({ email: loginForm.email })
    setLoginForm({ email: '', password: '' })
    setCurrentPage('admin')
    setSidebarOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
    setEditProyectoId(null)
    setEditIntegranteId(null)
    goTo('inicio')
  }

  const handleFormServicio = (e) => {
    e.preventDefault()
    setCorreoEnviado(true)
  }

  const addProyecto = () => {
    if (!formProyecto.title.trim()) return
    if (editProyectoId) {
      setProjects((prev) => prev.map((p) => (p.id === editProyectoId ? { ...p, ...formProyecto } : p)))
      setEditProyectoId(null)
    } else {
      setProjects((prev) => [...prev, { id: String(Date.now()), ...formProyecto }])
    }
    setFormProyecto({ title: '', cat: '', status: 'En curso', icon: 'flask', desc: '' })
  }

  const deleteProyecto = (id) => {
    if (window.confirm('¿Eliminar este proyecto?')) setProjects((prev) => prev.filter((p) => p.id !== id))
  }

  const startEditProyecto = (p) => {
    setEditProyectoId(p.id)
    setFormProyecto({ title: p.title, cat: p.cat, status: p.status, icon: p.icon, desc: p.desc })
  }

  const addIntegrante = () => {
    if (!formIntegrante.nombre.trim()) return
    if (editIntegranteId) {
      setIntegrantes((prev) => prev.map((i) => (i.id === editIntegranteId ? { ...i, ...formIntegrante } : i)))
      setEditIntegranteId(null)
    } else {
      setIntegrantes((prev) => [...prev, { id: String(Date.now()), ...formIntegrante }])
    }
    setFormIntegrante({ nombre: '', rol: '', disciplina: '' })
  }

  const deleteIntegrante = (id) => {
    if (window.confirm('¿Eliminar este integrante?')) setIntegrantes((prev) => prev.filter((i) => i.id !== id))
  }

  const startEditIntegrante = (i) => {
    setEditIntegranteId(i.id)
    setFormIntegrante({ nombre: i.nombre, rol: i.rol, disciplina: i.disciplina })
  }

  const cancelEditProyecto = () => {
    setEditProyectoId(null)
    setFormProyecto({ title: '', cat: '', status: 'En curso', icon: 'flask', desc: '' })
  }

  const cancelEditIntegrante = () => {
    setEditIntegranteId(null)
    setFormIntegrante({ nombre: '', rol: '', disciplina: '' })
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

  const addVideo = () => {
    const id = editVideoId || parseYoutubeId(formVideo.id)
    if (!id) {
      window.alert('Pegá un enlace de YouTube válido o el ID de 11 caracteres.')
      return
    }
    if (!formVideo.title.trim()) {
      window.alert('El título es obligatorio.')
      return
    }
    if (editVideoId) {
      setVideosInteres((prev) =>
        prev.map((v) =>
          v.id === editVideoId
            ? { id: editVideoId, title: formVideo.title.trim(), description: formVideo.description.trim() }
            : v,
        ),
      )
      setEditVideoId(null)
    } else {
      if (videosInteres.some((v) => v.id === id)) {
        window.alert('Ese video ya está en la lista.')
        return
      }
      setVideosInteres((prev) => [
        ...prev,
        { id, title: formVideo.title.trim(), description: formVideo.description.trim() },
      ])
    }
    setFormVideo({ id: '', title: '', description: '' })
  }

  const deleteVideo = (id) => {
    if (!window.confirm('¿Quitar este video de «De interés»?')) return
    setVideosInteres((prev) => prev.filter((v) => v.id !== id))
    if (editVideoId === id) {
      setEditVideoId(null)
      setFormVideo({ id: '', title: '', description: '' })
    }
  }

  const startEditVideo = (v) => {
    setEditVideoId(v.id)
    setFormVideo({ id: v.id, title: v.title, description: v.description })
  }

  const cancelEditVideo = () => {
    setEditVideoId(null)
    setFormVideo({ id: '', title: '', description: '' })
  }

  const openProyectoDetalle = (proyecto) => {
    setDetailModal({ open: true, type: 'proyecto', item: proyecto })
  }

  const openIntegranteDetalle = (integrante) => {
    setDetailModal({ open: true, type: 'integrante', item: integrante })
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
        onIntegranteClick={(persona) => {
          goTo('grupo')
          openIntegranteDetalle(persona)
        }}
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
            <p className="page-subtitle">Solo el correo autorizado puede acceder al panel de administración.</p>
            <form className="form-login" onSubmit={handleLogin}>
              <label>
                <span>Correo electrónico</span>
                <input type="email" value={loginForm.email} onChange={(e) => setLoginForm((s) => ({ ...s, email: e.target.value }))} required placeholder="admin@cimohu.edu.mx" />
              </label>
              <label>
                <span>Contraseña</span>
                <input type="password" value={loginForm.password} onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))} required />
              </label>
              {loginError && <p className="form-login-error">{loginError}</p>}
              <button type="submit" className="btn btn-primary btn-block">Entrar</button>
            </form>
          </div>
        )}

        {currentPage === 'admin' && user && (
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
            ICON_MAP={ICON_MAP}
            integrantes={integrantes}
            formIntegrante={formIntegrante}
            setFormIntegrante={setFormIntegrante}
            editIntegranteId={editIntegranteId}
            addIntegrante={addIntegrante}
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
          />
        )}

        {currentPage === 'proyectos' && (
          <div className="page-content page-proyectos">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Divulgación científica</h1>
            <p className="page-subtitle">
              Proyectos y líneas de investigación — difusión del quehacer científico CIMOHU / FCCFyD.
            </p>
            <div className="cards-grid cards-proyectos">
              {projects.map((p) => (
                <article key={p.id} className="card-proyecto">
                  <span className={`card-proyecto-badge ${p.status === 'En curso' ? 'en-curso' : 'planificacion'}`}>{p.status}</span>
                  <div className="card-proyecto-icon">{ICON_MAP[p.icon] || '📄'}</div>
                  <h3 className="card-proyecto-title">{p.title}</h3>
                  <p className="card-proyecto-cat">{p.cat}</p>
                  <p className="card-proyecto-desc">{p.desc}</p>
                  <button type="button" className="card-link" onClick={() => openProyectoDetalle(p)}>
                    Ver más
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'inscripcion' && (
          <div className="page-content page-inscripcion">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Inscripción de Proyectos</h1>
            <p className="page-subtitle">Para la descripción de un proyecto de investigación deberá completar el siguiente trámite.</p>
            <div className="pasos-grid">
              {['Complementar debidamente el formato 1 (Registro de trabajo de investigación y solicitud de asesores).', 'Tener firmado el formato 2 (Carta de aceptación de Asesoría).', 'Protocolo de investigación Anexo 1.', 'Llevarlos físicamente a la coordinación de investigación (cubículo 4 de oficinas de tiempos completos) con el Dr. Mario Villarreal.'].map((texto, i) => (
                <div key={i} className="paso-card">
                  <span className="paso-num">{i + 1}</span>
                  <p className="paso-texto">{texto}</p>
                  <span className="paso-doc" aria-hidden>📄</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPage === 'grupo' && (
          <div className="page-content page-grupo">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Cuerpo Académico</h1>
            <p className="page-subtitle">CIMOHU - Ciencias del Movimiento Humano</p>
            <div className="integrantes-grid">
              {integrantes.map((p) => (
                <article key={p.id} className="card-integrante">
                  <div className="card-integrante-avatar" />
                  <h3 className="card-integrante-nombre">{p.nombre}</h3>
                  <p className="card-integrante-rol">{p.rol}</p>
                  <p className="card-integrante-disciplina">{p.disciplina}</p>
                  <div className="card-integrante-icons"><span aria-label="Correo">✉</span><span aria-label="LinkedIn">in</span></div>
                  <button type="button" className="card-link" onClick={() => openIntegranteDetalle(p)}>
                    Ver más
                  </button>
                </article>
              ))}
            </div>
          </div>
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
                        <span>Comentario o área de interés</span>
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
          instrumentos.some((i) => i.key === currentPage) && (
            <div className="page-content page-instrumento-info">
              <button type="button" className="back-home" onClick={() => goTo('inicio')}>
                ← Volver a inicio
              </button>
              <h1 className="page-title">{instrumentos.find((i) => i.key === currentPage)?.label}</h1>
              <p className="page-subtitle">{instrumentos.find((i) => i.key === currentPage)?.desc}</p>
            </div>
          )}

        {currentPage === 'eventos' && (
          <div className="page-content">
            <button type="button" className="back-home" onClick={() => goTo('inicio')}>
              ← Volver a inicio
            </button>
            <h1 className="page-title">Eventos</h1>
            <p className="page-subtitle">
              Aquí se publicarán congresos, jornadas y actividades de la coordinación de investigación y
              la facultad.
            </p>
          </div>
        )}

        {currentPage === 'interes' && (
          <Interes onBack={() => goTo('inicio')} videos={videosInteres} />
        )}

        <DetailModal detail={detailModal} onClose={closeDetailModal} />
      </main>
      <Footer />
      </div>
    </div>
  )
}

export default App
