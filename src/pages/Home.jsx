import logoFccyd from '../assets/LogoFCCFYD.png'
import SearchBar from '../components/SearchBar.jsx'

export default function Home({ onNavigate, areasRef, onScrollToAreas, onSiteSearch }) {
  return (
    <>
      <section className="home-hero-panel" aria-label="Inicio">
        <div className="home-hero-inner">
          <div className="home-hero-search-row">
            <SearchBar className="site-search--home" />
          </div>
          <div className="home-hero-logo-wrap">
            <img
              src={logoFccyd}
              alt="FCCFyD — Facultad de Ciencias de la Cultura Física y Deporte"
              className="home-logo-fccyd"
            />
          </div>
          <div className="home-hero-foot">
            <h1 className="home-faculty-title">
              Facultad de Ciencias de la Cultura Física y Deporte
            </h1>
            <button type="button" className="home-scroll-areas" onClick={onScrollToAreas}>
              Ver opciones del sitio
              <span className="home-scroll-areas-arrow" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section className="areas-section" ref={areasRef}>
        <div className="areas-grid">
          <article className="area-card" onClick={() => onNavigate('proyectos')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            </div>
            <h3 className="area-card-title">Divulgación científica</h3>
            <p className="area-card-desc">
              Líneas de investigación, proyectos y difusión del quehacer científico de la facultad.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('inscripcion')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="area-card-title">Inscripción de Proyectos de Investigación</h3>
            <p className="area-card-desc">
              Registra tu proyecto de investigación y únete a nuestra comunidad académica.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('proyectosInv')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 3h6v4H9V3z" />
                <path d="M8 7h8v14H8V7z" />
                <path d="M12 11v6M9 14h6" />
              </svg>
            </div>
            <h3 className="area-card-title">Proyectos de Investigación</h3>
            <p className="area-card-desc">
              Fichas completas y galería de imágenes de los proyectos publicados por coordinación.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('grupo')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="area-card-title">Cuerpo Académico</h3>
            <p className="area-card-desc">
              Conoce al cuerpo académico y sus áreas de especialización.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('formularioServicio')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <path d="M22 6l-10 7L2 6" />
              </svg>
            </div>
            <h3 className="area-card-title">Servicio social</h3>
            <p className="area-card-desc">
              Coordinación de investigación. Envía tu solicitud y recibe notificación por correo.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('eventos')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <h3 className="area-card-title">Publicaciones</h3>
            <p className="area-card-desc">
              Noticias y eventos de la coordinación, con opción de ver detalles e interactuar.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('interes')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
            </div>
            <h3 className="area-card-title">De interés</h3>
            <p className="area-card-desc">
              Material audiovisual y recursos útiles para la comunidad FCCFyD.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>

          <article className="area-card" onClick={() => onNavigate('instrumentos')}>
            <div className="area-card-icon" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" />
                <path d="M18 9l-5 5-4-4-3 3" />
              </svg>
            </div>
            <h3 className="area-card-title">Instrumentos de Test</h3>
            <p className="area-card-desc">
              Calculadora IMC y más herramientas de evaluación. Elija la opción que necesite.
            </p>
            <span className="area-card-cta">Ver más</span>
          </article>
        </div>
      </section>
    </>
  )
}
