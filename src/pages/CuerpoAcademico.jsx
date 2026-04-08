import { useMemo, useState } from 'react'
import { fixPublicStorageUrl } from '../services/storageService.js'
import { esCorreoDocentePlaceholder, integranteRedesEntries } from '../utils/integrantesMap.js'

/* @refresh reset */

function stopCardNavigate(e) {
  e.stopPropagation()
}

function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  )
}

function IconCv() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

const RED_MOD_KEYS = new Set(['linkedin', 'twitter', 'facebook', 'instagram', 'github'])

function redSocialGlyph(networkKey) {
  switch (networkKey) {
    case 'linkedin':
      return (
        <span className="card-integrante-in" aria-hidden>
          in
        </span>
      )
    case 'twitter':
      return (
        <span className="card-integrante-network-letter" aria-hidden>
          𝕏
        </span>
      )
    case 'facebook':
      return (
        <span className="card-integrante-network-letter card-integrante-network-letter--fb" aria-hidden>
          f
        </span>
      )
    case 'instagram':
      return (
        <span className="card-integrante-network-letter card-integrante-network-letter--ig" aria-hidden>
          IG
        </span>
      )
    case 'github':
      return (
        <span className="card-integrante-network-letter" aria-hidden>
          G
        </span>
      )
    default:
      return <IconGlobe />
  }
}

function IntegranteCardLinks({ integrante }) {
  const mailOk = integrante.correo && !esCorreoDocentePlaceholder(integrante.correo)
  const redes = integranteRedesEntries(integrante.redes_sociales)
  const cvUrl = integrante.cv_url ? fixPublicStorageUrl(integrante.cv_url) : ''

  if (!mailOk && !redes.length && !cvUrl) return null

  return (
    <>
      <div className="card-integrante-spacer" aria-hidden />
      <div className="card-integrante-icons">
      {mailOk ? (
        <a
          href={`mailto:${integrante.correo}`}
          className="card-integrante-icon-link card-integrante-icon-link--mail"
          aria-label={`Correo: ${integrante.correo}`}
          title="Correo"
          onClick={stopCardNavigate}
        >
          <IconMail />
        </a>
      ) : null}
      {cvUrl ? (
        <a
          href={cvUrl}
          className="card-integrante-icon-link card-integrante-icon-link--cv"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ver CV"
          title="CV"
          onClick={stopCardNavigate}
        >
          <IconCv />
        </a>
      ) : null}
      {redes.map(({ key, url, label }) => {
        const mod = RED_MOD_KEYS.has(key) ? ` card-integrante-icon-link--${key}` : ''
        return (
          <a
            key={key}
            href={url}
            className={`card-integrante-icon-link${mod}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            onClick={stopCardNavigate}
          >
            {redSocialGlyph(key)}
          </a>
        )
      })}
      </div>
    </>
  )
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function integranteMatches(p, qRaw) {
  const q = norm(qRaw.trim())
  if (!q) return true
  const blob = norm(
    [p.nombre, p.rol, p.disciplina, p.correo, p.grado_academico, p.descripcion_breve].join(' '),
  )
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
              placeholder="Buscar por nombre o cargo…"
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
                {p.rol ? <p className="card-integrante-rol">{p.rol}</p> : null}
                <IntegranteCardLinks integrante={p} />
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
