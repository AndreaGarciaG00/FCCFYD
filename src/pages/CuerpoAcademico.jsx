import { useMemo, useState } from 'react'
import { esCorreoDocentePlaceholder } from '../utils/integrantesMap.js'
import { fixPublicStorageUrl } from '../services/storageService.js'

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function integranteMatches(p, qRaw) {
  const q = norm(qRaw.trim())
  if (!q) return true
  const blob = norm([p.nombre, p.rol, p.disciplina, p.correo].join(' '))
  return blob.includes(q)
}

/**
 * Listado Cuerpo Académico: hero como inscripción/proyectos + tarjetas de docentes.
 */
export default function CuerpoAcademico({ integrantes = [], heroSrc, onBackHome, onOpenIntegrante }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(
    () => integrantes.filter((p) => integranteMatches(p, busqueda)),
    [integrantes, busqueda],
  )

  return (
    <div className="page-content page-grupo-root">
      <section className="inscripcion-hero" aria-label="Cabecera Cuerpo Académico">
        <img src={heroSrc} alt="" className="inscripcion-hero-photo" />
        <div className="inscripcion-hero-scrim" aria-hidden />
        <div className="inscripcion-hero-inner inscripcion-hero-inner--cuerpo-academico">
          <button type="button" className="inscripcion-hero-back" onClick={onBackHome}>
            ← Inicio
          </button>
          <div className="cuerpo-academico-hero-titles">
            <h1 className="inscripcion-hero-title inscripcion-hero-title--stacked">
              Cuerpo Académico
            </h1>
            <p className="cuerpo-academico-hero-code">UJED-CA-138 · CIMOHU · FCCFyD</p>
          </div>
          <div className="inscripcion-hero-search">
            <label htmlFor="cuerpo-academico-filter" className="visually-hidden">
              Buscar docentes
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
              id="cuerpo-academico-filter"
              type="search"
              className="inscripcion-hero-search-input"
              placeholder="Buscar por nombre, cargo o área…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>
      <div className="inscripcion-hero-rule" aria-hidden />

      <div className="integrantes-cards-wrap">
        {filtrados.length === 0 ? (
          <p className="integrantes-vacio">
            {busqueda.trim()
              ? `No hay resultados para «${busqueda.trim()}».`
              : 'Aún no hay docentes registrados o visibles. Si sos admin, cargalos en el panel (Docentes).'}
          </p>
        ) : (
          <div className="integrantes-grid integrantes-grid--cuerpo">
            {filtrados.map((p) => (
              <article
                key={p.id}
                className="card-integrante card-integrante--clickable"
                role="button"
                tabIndex={0}
                aria-label={`Ver ficha: ${p.nombre}`}
                onClick={() => onOpenIntegrante?.(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpenIntegrante?.(p)
                  }
                }}
              >
                {p.foto_url ? (
                  <div className="card-integrante-avatar card-integrante-avatar--photo">
                    <img src={fixPublicStorageUrl(p.foto_url)} alt="" />
                  </div>
                ) : (
                  <div className="card-integrante-avatar" aria-hidden />
                )}
                <h3 className="card-integrante-nombre">{p.nombre}</h3>
                <p className="card-integrante-rol">{p.rol}</p>
                <p className="card-integrante-disciplina">{p.disciplina}</p>
                <div className="card-integrante-icons">
                  {p.correo && !esCorreoDocentePlaceholder(p.correo) ? (
                    <a
                      href={`mailto:${p.correo}`}
                      className="card-integrante-icon-link"
                      aria-label={`Correo: ${p.correo}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✉
                    </a>
                  ) : (
                    <span className="card-integrante-icon-link card-integrante-icon-link--disabled" aria-hidden>
                      ✉
                    </span>
                  )}
                  {p.redes_sociales?.linkedin && String(p.redes_sociales.linkedin).trim().startsWith('http') ? (
                    <a
                      href={String(p.redes_sociales.linkedin).trim()}
                      className="card-integrante-icon-link"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      in
                    </a>
                  ) : (
                    <span className="card-integrante-icon-link card-integrante-icon-link--disabled" aria-hidden>
                      in
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
