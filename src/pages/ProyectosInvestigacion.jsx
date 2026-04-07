import { useMemo, useState } from 'react'
import { proyectoCoverUrl } from '../utils/proyectoDisplay.js'

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function proyectoMatches(p, qRaw) {
  const q = norm(qRaw.trim())
  if (!q) return true
  const blob = norm([p.title, p.cat, p.desc, p.status].join(' '))
  return blob.includes(q)
}

export default function ProyectosInvestigacion({ projects, heroSrc, onBackHome, onOpenProject }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(
    () => projects.filter((p) => proyectoMatches(p, busqueda)),
    [projects, busqueda],
  )

  return (
    <div className="page-content page-proyectos-inv-root">
      <section className="inscripcion-hero" aria-label="Cabecera de proyectos de investigación">
        <img src={heroSrc} alt="" className="inscripcion-hero-photo" />
        <div className="inscripcion-hero-scrim" aria-hidden />
        <div className="inscripcion-hero-inner">
          <button type="button" className="inscripcion-hero-back" onClick={onBackHome}>
            ← Inicio
          </button>
          <h1 className="inscripcion-hero-title">Proyectos de Investigación</h1>
          <div className="inscripcion-hero-search">
            <label htmlFor="proyectos-inv-filter" className="visually-hidden">
              Buscar proyectos
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
              id="proyectos-inv-filter"
              type="search"
              className="inscripcion-hero-search-input"
              placeholder="Buscar por título, categoría o responsable…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>
      <div className="inscripcion-hero-rule" aria-hidden />

      {filtrados.length === 0 ? (
        <p className="divulgacion-vacio proyecto-inv-vacio">
          {busqueda.trim()
            ? `No hay resultados para «${busqueda.trim()}».`
            : 'No hay proyectos para mostrar.'}
        </p>
      ) : (
        <div className="proyecto-inv-cards-wrap">
          <div className="divulgacion-grid proyecto-inv-grid">
            {filtrados.map((p) => (
              <button
                key={p.id}
                type="button"
                className="divulgacion-card"
                onClick={() => onOpenProject(p)}
                aria-label={`Ver ficha: ${p.title}`}
              >
                <div className="divulgacion-card-media">
                  <img
                    className="divulgacion-card-img"
                    src={proyectoCoverUrl(p)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    width="480"
                    height="320"
                  />
                  <span
                    className={`divulgacion-card-chip ${p.status === 'En curso' ? 'divulgacion-card-chip--activo' : ''}`}
                  >
                    {p.status === 'En curso' ? 'En curso' : 'Planificación'}
                  </span>
                </div>
                <div className="divulgacion-card-body">
                  <p className="divulgacion-card-eyebrow">{p.cat}</p>
                  <h3 className="divulgacion-card-title">{p.title}</h3>
                  <p className="divulgacion-card-desc">{p.desc || p.investigador_responsable || '—'}</p>
                  <span className="divulgacion-card-cta">Ver ficha</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
