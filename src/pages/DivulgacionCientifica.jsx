import { useMemo, useState } from 'react'
import { HERO_DIVULGACION } from '../data/pageHeroImages.js'
import { fixPublicStorageUrl } from '../services/storageService.js'
import { pdfEmbedViewerUrl } from '../utils/pdfEmbedUrl.js'

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function articuloMatches(a, qRaw) {
  const q = norm(qRaw.trim())
  if (!q) return true
  const blob = norm([a.titulo, a.descripcion].join(' '))
  return blob.includes(q)
}

export default function DivulgacionCientifica({ articulos = [], heroSrc, onBack }) {
  const [busqueda, setBusqueda] = useState('')
  const hero = heroSrc || HERO_DIVULGACION

  const filtrados = useMemo(
    () => articulos.filter((a) => articuloMatches(a, busqueda)),
    [articulos, busqueda],
  )

  const openPdf = (url) => {
    const fixed = fixPublicStorageUrl(url)
    if (fixed) window.open(fixed, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="page-content page-divulgacion-root">
      <section className="inscripcion-hero" aria-label="Cabecera Divulgación científica">
        <img src={hero} alt="" className="inscripcion-hero-photo" />
        <div className="inscripcion-hero-scrim" aria-hidden />
        <div className="inscripcion-hero-inner">
          <button type="button" className="inscripcion-hero-back" onClick={onBack}>
            ← Inicio
          </button>
          <h1 className="inscripcion-hero-title divulgacion-hero-title-serif">Divulgación científica</h1>
          <p className="divulgacion-hero-tagline">Artículos y documentos · CIMOHU / FCCFyD</p>
          <div className="inscripcion-hero-search">
            <label htmlFor="divulgacion-filter" className="visually-hidden">
              Buscar artículos
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
              id="divulgacion-filter"
              type="search"
              className="inscripcion-hero-search-input"
              placeholder="Buscar por título…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>
      <div className="inscripcion-hero-rule" aria-hidden />

      <div className="divulgacion-articulos-wrap">
        {filtrados.length === 0 ? (
          <p className="divulgacion-vacio divulgacion-articulos-vacio">
            {busqueda.trim()
              ? `No hay resultados para «${busqueda.trim()}».`
              : 'Aún no hay artículos publicados. Pronto sumaremos documentos de divulgación.'}
          </p>
        ) : (
          <div className="divulgacion-articulos-grid">
            {filtrados.map((raw) => {
              const pdfUrl = fixPublicStorageUrl(raw.archivo_url)
              const desc = String(raw.descripcion || '').trim()
              return (
                <article key={raw.id} className="divulgacion-art-card">
                  <button
                    type="button"
                    className="divulgacion-art-card-hit"
                    onClick={() => openPdf(raw.archivo_url)}
                    aria-label={`Abrir PDF: ${raw.titulo}`}
                  >
                    <div className="divulgacion-art-preview">
                      <div className="divulgacion-art-preview-pdf">
                        {pdfUrl ? (
                          <iframe
                            title=""
                            src={pdfEmbedViewerUrl(pdfUrl)}
                            className="divulgacion-art-preview-iframe"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <span className="divulgacion-art-preview-badge">Abrir documento</span>
                    </div>
                    <h2 className="divulgacion-art-title">{raw.titulo}</h2>
                    {desc ? <p className="divulgacion-art-desc">{desc}</p> : null}
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
