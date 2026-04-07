import { useMemo, useState, useEffect } from 'react'
import { proyectoCoverUrl } from '../utils/proyectoDisplay.js'
import { collectProyectoImagenUrls } from '../utils/proyectoImagenes.js'
import { ProyectoDetalleSecciones } from '../components/ProyectoDetalleBlocks.jsx'
import { fixPublicStorageUrl } from '../services/storageService.js'

function ProyectoInvGaleria({ urls, title }) {
  const [idx, setIdx] = useState(0)
  const n = urls.length
  const safeIdx = n ? Math.min(idx, n - 1) : 0

  useEffect(() => {
    setIdx(0)
  }, [urls.join('|')])

  if (n === 0) {
    return (
      <div className="proyecto-inv-galeria proyecto-inv-galeria--empty" role="img" aria-label={title}>
        <span className="proyecto-inv-galeria-placeholder">Sin imágenes</span>
      </div>
    )
  }

  if (n === 1) {
    return (
      <figure className="proyecto-inv-galeria proyecto-inv-galeria--static proyecto-inv-galeria--hero">
        <img src={urls[0]} alt="" className="proyecto-inv-galeria-img" width="960" height="540" />
      </figure>
    )
  }

  const go = (d) => setIdx((i) => (i + d + n) % n)

  return (
    <div className="proyecto-inv-galeria-wrap">
      <div className="proyecto-inv-galeria proyecto-inv-galeria--carousel proyecto-inv-galeria--hero" aria-roledescription="carrusel">
        <div className="proyecto-inv-galeria-viewport">
          <img
            src={urls[safeIdx]}
            alt=""
            className="proyecto-inv-galeria-img"
            width="960"
            height="540"
          />
          <button
            type="button"
            className="proyecto-inv-galeria-nav proyecto-inv-galeria-nav--prev"
            onClick={() => go(-1)}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="proyecto-inv-galeria-nav proyecto-inv-galeria-nav--next"
            onClick={() => go(1)}
            aria-label="Imagen siguiente"
          >
            ›
          </button>
          <div className="proyecto-inv-galeria-counter" aria-live="polite">
            {safeIdx + 1} / {n}
          </div>
        </div>
        <div className="proyecto-inv-galeria-dots" role="tablist" aria-label="Seleccionar imagen">
          {urls.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === safeIdx}
              className={`proyecto-inv-galeria-dot${i === safeIdx ? ' is-active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Imagen ${i + 1} de ${n}`}
            />
          ))}
        </div>
      </div>
      <div className="proyecto-inv-galeria-filmstrip" aria-label="Miniaturas">
        <div className="proyecto-inv-galeria-filmstrip-inner" role="list">
          {urls.map((u, i) => (
            <button
              key={i}
              type="button"
              role="listitem"
              className={`proyecto-inv-galeria-thumb-btn${i === safeIdx ? ' is-active' : ''}`}
              onClick={() => setIdx(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === safeIdx ? 'true' : undefined}
            >
              <img src={u} alt="" className="proyecto-inv-galeria-thumb" width="120" height="68" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ProyectoInvestigacionDetalle({ item, loading, error, onBack }) {
  const urls = useMemo(() => {
    if (!item?.imagenes) return []
    return collectProyectoImagenUrls(item.imagenes)
  }, [item])

  const displayUrls = useMemo(() => {
    if (urls.length) return urls
    if (!item) return []
    const one = item.imagen && String(item.imagen).trim() ? fixPublicStorageUrl(item.imagen.trim()) : ''
    if (one) return [one]
    return [proyectoCoverUrl(item)]
  }, [urls, item])

  return (
    <div className="page-content page-proyecto-inv-detalle">
      <button type="button" className="proyecto-ficha-back back-home" onClick={onBack}>
        ← Volver al listado
      </button>

      {loading ? <p className="proyecto-inv-detalle-loading">Cargando ficha…</p> : null}

      {error ? (
        <p className="proyecto-inv-detalle-error" role="alert">
          {error}
        </p>
      ) : null}

      {!loading && !error && item ? (
        <article className="proyecto-ficha">
          <div className="proyecto-ficha-hero-fullbleed">
            <ProyectoInvGaleria urls={displayUrls} title={item.title} />
          </div>
          <div className="proyecto-ficha-header-card proyecto-ficha-header-card--below">
            <div className="proyecto-ficha-meta-row">
              <span className="proyecto-ficha-cat">{item.cat}</span>
              {item.status ? (
                <span
                  className={`proyecto-ficha-status admin-badge ${item.status === 'En curso' ? 'en-curso' : 'planificacion'}`}
                >
                  {item.status}
                </span>
              ) : null}
            </div>
            <h1 className="proyecto-ficha-title">{item.title}</h1>
            {item.slug ? (
              <p className="proyecto-ficha-slug">
                <span className="visually-hidden">Referencia </span>
                {item.slug}
              </p>
            ) : null}
            {item.investigador_responsable ? (
              <p className="proyecto-ficha-investigador">
                <span className="proyecto-ficha-investigador-label">Investigador responsable</span>
                <span className="proyecto-ficha-investigador-name">{item.investigador_responsable}</span>
              </p>
            ) : null}
            {item.desc ? <p className="proyecto-ficha-lead">{item.desc}</p> : null}
          </div>

          <div className="proyecto-ficha-body">
            <ProyectoDetalleSecciones item={item} variant="ficha" />
            <p className="proyecto-ficha-footnote">
              Información publicada por la Coordinación de Investigación — CIMOHU / FCCFyD.
            </p>
          </div>
        </article>
      ) : null}
    </div>
  )
}
