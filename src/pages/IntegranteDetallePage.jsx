import { useState } from 'react'
import { fixPublicStorageUrl } from '../services/storageService.js'
import { esCorreoDocentePlaceholder, integranteRedesEntries } from '../utils/integrantesMap.js'

/**
 * Ficha completa de un docente (página dedicada, no modal).
 */
export default function IntegranteDetallePage({ integrante, onBack }) {
  const [openImage, setOpenImage] = useState(false)

  if (!integrante) {
    return (
      <div className="page-content page-integrante-detalle">
        <button type="button" className="back-home" onClick={onBack}>
          ← Volver al Cuerpo Académico
        </button>
        <p className="integrante-detalle-vacio">No encontramos a esta persona en el listado.</p>
      </div>
    )
  }

  const redes = integranteRedesEntries(integrante.redes_sociales)
  const fotoUrl = integrante.foto_url ? fixPublicStorageUrl(integrante.foto_url) : ''

  return (
    <div className="page-content page-integrante-detalle">
      <button type="button" className="back-home" onClick={onBack}>
        ← Volver al Cuerpo Académico
      </button>

      <article className="integrante-detalle-card">
        {fotoUrl ? (
          <button
            type="button"
            className="integrante-detalle-photo-wrap integrante-detalle-photo-btn"
            onClick={() => setOpenImage(true)}
            aria-label="Abrir foto completa"
          >
            <img className="integrante-detalle-photo" src={fotoUrl} alt="" width="220" height="220" />
            <span className="integrante-detalle-photo-hint">Abrir imagen</span>
          </button>
        ) : (
          <div className="integrante-detalle-photo-placeholder" aria-hidden />
        )}
        <div className="integrante-detalle-body">
          <h1 className="integrante-detalle-nombre">{integrante.nombre}</h1>
          {integrante.grado_academico ? (
            <p className="integrante-detalle-grado">{integrante.grado_academico}</p>
          ) : null}
          <p className="integrante-detalle-rol">{integrante.rol}</p>
          <p className="integrante-detalle-disciplina">{integrante.disciplina}</p>

          {integrante.descripcion_breve ? <p className="integrante-detalle-text">{integrante.descripcion_breve}</p> : null}

          <div className="integrante-detalle-sections">
            <section className="integrante-detalle-section">
              <h2 className="integrante-detalle-section-title">Contacto</h2>
              <dl className="integrante-detalle-meta">
                {integrante.correo && !esCorreoDocentePlaceholder(integrante.correo) ? (
                  <>
                    <dt>Correo</dt>
                    <dd>
                      <a href={`mailto:${integrante.correo}`} className="integrante-detalle-link">
                        {integrante.correo}
                      </a>
                    </dd>
                  </>
                ) : null}
                {integrante.telefono ? (
                  <>
                    <dt>Teléfono</dt>
                    <dd>{integrante.telefono}</dd>
                  </>
                ) : null}
                {integrante.ubicacion_fisica ? (
                  <>
                    <dt>Ubicación</dt>
                    <dd>{integrante.ubicacion_fisica}</dd>
                  </>
                ) : null}
              </dl>
            </section>

            {integrante.cv_url ? (
              <section className="integrante-detalle-section">
                <h2 className="integrante-detalle-section-title">Documentos</h2>
                <p className="integrante-detalle-text">
                  <a
                    href={fixPublicStorageUrl(integrante.cv_url)}
                    className="integrante-detalle-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver curriculum (CV)
                  </a>
                </p>
              </section>
            ) : null}

            {redes.length > 0 ? (
              <section className="integrante-detalle-section">
                <h2 className="integrante-detalle-section-title">Enlaces</h2>
                <ul className="integrante-detalle-redes-list">
                  {redes.map(({ key, url, label }) => (
                    <li key={key}>
                      <a href={url} className="integrante-detalle-link" target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </article>

      {openImage && fotoUrl ? (
        <div
          className="integrante-image-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpenImage(false)}
        >
          <button
            type="button"
            className="integrante-image-lightbox-close"
            onClick={() => setOpenImage(false)}
            aria-label="Cerrar imagen"
          >
            ×
          </button>
          <img
            className="integrante-image-lightbox-img"
            src={fotoUrl}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  )
}
