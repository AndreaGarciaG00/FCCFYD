import { useState, useEffect } from 'react'
import logoUjed from '../assets/UJEDLOGO-removebg-preview.png'
const NAV_TOP = [
  { key: 'inicio', label: 'Página principal' },
  { key: 'inscripcion', label: 'Inscripción de Proyectos de Investigación' },
  { key: 'proyectosInv', label: 'Proyectos de Investigación' },
  { key: 'eventos', label: 'Publicaciones' },
]

function navTopIsActive(currentPage, key) {
  if (key === 'proyectosInv') {
    return currentPage === 'proyectosInv' || currentPage === 'proyectosInvDetalle'
  }
  return currentPage === key
}

const NAV_AFTER_ACADEMICO = [
  { key: 'proyectos', label: 'Divulgación científica' },
  { key: 'interes', label: 'De interés' },
]

export default function Sidebar({
  open,
  currentPage,
  user,
  integrantes = [],
  instrumentos = [],
  onNavigate,
  onIntegranteClick,
  onLogout,
  onClose,
}) {
  const [academicoOpen, setAcademicoOpen] = useState(false)
  const [instrumentosOpen, setInstrumentosOpen] = useState(false)

  const grupoActivo = currentPage === 'grupo' || currentPage === 'grupoDetalle'
  const instrumentoActivo = instrumentos.some((i) => i.key === currentPage)

  useEffect(() => {
    if (grupoActivo) setAcademicoOpen(true)
  }, [grupoActivo])

  useEffect(() => {
    if (instrumentoActivo) setInstrumentosOpen(true)
  }, [instrumentoActivo])

  const toggleAcademico = () => setAcademicoOpen((v) => !v)
  const toggleInstrumentos = () => setInstrumentosOpen((v) => !v)

  return (
    <>
      <aside className={`sidebar sidebar--dark ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header sidebar-header--brand">
          <a
            href="#inicio"
            className="sidebar-brand"
            onClick={(e) => {
              e.preventDefault()
              onNavigate('inicio')
            }}
          >
            <img src={logoUjed} alt="Universidad Juárez del Estado de Durango" className="sidebar-logo-ujed" />
          </a>
          <button
            type="button"
            className="sidebar-close sidebar-close--mobile-only"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            ×
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_TOP.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`sidebar-link ${navTopIsActive(currentPage, key) ? 'active' : ''}`}
              onClick={() => onNavigate(key)}
            >
              {label}
            </button>
          ))}

          <div className="sidebar-accordion">
            <div
              className={`sidebar-accordion-row ${grupoActivo ? 'active' : ''} ${academicoOpen ? 'is-open' : ''}`}
              id="sidebar-academico-btn"
            >
              <button
                type="button"
                className={`sidebar-accordion-main ${grupoActivo ? 'active' : ''}`}
                onClick={() => onNavigate('grupo')}
              >
                Cuerpo Académico
              </button>
              <button
                type="button"
                className="sidebar-accordion-chevron"
                onClick={toggleAcademico}
                aria-expanded={academicoOpen}
                aria-label={academicoOpen ? 'Ocultar nombres' : 'Mostrar nombres'}
              >
                <span className="sidebar-chevron" aria-hidden>
                  ▼
                </span>
              </button>
            </div>
            {academicoOpen && (
              <div className="sidebar-accordion-panel" role="region" aria-labelledby="sidebar-academico-btn">
                {integrantes.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
                    className="sidebar-sublink"
                    onClick={() => {
                      if (onIntegranteClick) onIntegranteClick(persona)
                      else onNavigate('grupo')
                    }}
                  >
                    {persona.nombre}
                  </button>
                ))}
              </div>
            )}
          </div>

          {NAV_AFTER_ACADEMICO.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`sidebar-link ${currentPage === key ? 'active' : ''}`}
              onClick={() => onNavigate(key)}
            >
              {label}
            </button>
          ))}

          <div className="sidebar-section-label">Coordinación</div>
          <button
            type="button"
            className={`sidebar-link ${currentPage === 'formularioServicio' ? 'active' : ''}`}
            onClick={() => onNavigate('formularioServicio')}
          >
            Formulario Servicio (investigación)
          </button>

          <div className="sidebar-accordion sidebar-accordion--instruments">
            <button
              type="button"
              className={`sidebar-accordion-toggle ${instrumentoActivo ? 'active' : ''} ${instrumentosOpen ? 'is-open' : ''}`}
              onClick={toggleInstrumentos}
              aria-expanded={instrumentosOpen}
              id="sidebar-instrumentos-btn"
            >
              <span className="sidebar-chevron" aria-hidden>
                ▼
              </span>
              <span className="sidebar-accordion-label">Instrumentos de test</span>
            </button>
            {instrumentosOpen && (
              <div className="sidebar-accordion-panel" role="region" aria-labelledby="sidebar-instrumentos-btn">
                {instrumentos.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    title={item.desc}
                    className={`sidebar-sublink ${currentPage === item.key ? 'active' : ''}`}
                    onClick={() => onNavigate(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            {user ? (
              <>
                {user.isAdmin ? (
                  <button
                    type="button"
                    className="sidebar-link sidebar-admin"
                    onClick={() => onNavigate('admin')}
                  >
                    Panel Admin
                  </button>
                ) : null}
                <button type="button" className="sidebar-link sidebar-logout" onClick={onLogout}>
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button type="button" className="sidebar-link sidebar-login" onClick={() => onNavigate('login')}>
                Ingresar
              </button>
            )}
          </div>
        </nav>
      </aside>
      <div
        className={`sidebar-backdrop ${open ? 'visible' : ''}`}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Cerrar menú"
      />
    </>
  )
}
