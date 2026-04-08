import { proyectoCoverUrl } from '../utils/proyectoDisplay.js'
import { fixPublicStorageUrl } from '../services/storageService.js'
import { esCorreoDocentePlaceholder, integranteRedesEntries } from '../utils/integrantesMap.js'
import { ProyectoDetalleSecciones } from './ProyectoDetalleBlocks.jsx'

function fechaEventoLarga(fechaISO) {
  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const DEFAULT_EVENTO_IMG = 'https://picsum.photos/seed/fccfyd-default/560/315'

function eventoModalImageUrls(item) {
  const fromGaleria = Array.isArray(item?.galeria)
    ? item.galeria.map((u) => String(u).trim()).filter(Boolean)
    : []
  if (fromGaleria.length) return fromGaleria
  if (item?.imagen) return [String(item.imagen).trim()]
  return [DEFAULT_EVENTO_IMG]
}

export default function DetailModal({
  detail,
  onClose,
  eventoSocial = null,
  onToggleEventoLike,
  onChangeEventoComment,
  onSubmitEventoComment,
}) {
  if (!detail.open || !detail.item) return null

  const { type, item } = detail
  const isEvento = type === 'evento'
  const isProyecto = type === 'proyecto'
  const useCoverLayout = isEvento || isProyecto

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`modal-dialog${useCoverLayout ? ' modal-dialog--evento' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        {isProyecto && (
          <>
            <img
              className="modal-evento-cover"
              src={proyectoCoverUrl(item)}
              alt=""
              width="448"
              height="252"
            />
            <div className="modal-body modal-body--evento">
              <p className="modal-evento-badge">{item.cat}</p>
              <h2 className="modal-title">{item.title}</h2>
              {item.status ? (
                <p className="modal-proyecto-status-row">
                  <span
                    className={`admin-badge ${
                      item.status === 'En curso' ? 'en-curso' : 'planificacion'
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
              ) : null}
              {item.investigador_responsable ? (
                <p className="modal-text">
                  <strong>Investigador responsable:</strong> {item.investigador_responsable}
                </p>
              ) : null}
              <p className="modal-text">{item.desc}</p>
              <ProyectoDetalleSecciones item={item} />
              <p className="modal-text-muted">
                Información para la comunidad universitaria y divulgación del trabajo en CIMOHU / FCCFyD.
              </p>
            </div>
          </>
        )}

        {type === 'integrante' && (
          <>
            {item.foto_url ? (
              <div className="modal-integrante-photo-wrap">
                <img
                  className="modal-integrante-photo"
                  src={fixPublicStorageUrl(item.foto_url)}
                  alt=""
                  width="160"
                  height="160"
                />
              </div>
            ) : null}
            <div className={`modal-body${item.foto_url ? ' modal-body--integrante' : ''}`}>
              <h2 className="modal-title">{item.nombre}</h2>
              {item.grado_academico ? <p className="modal-text modal-text--grado">{item.grado_academico}</p> : null}
              <p className="modal-subtitle">{item.rol}</p>
              {item.descripcion_breve ? <p className="modal-text">{item.descripcion_breve}</p> : null}
              {!item.descripcion_breve && item.disciplina ? (
                <p className="modal-text">{item.disciplina}</p>
              ) : null}
              {item.correo && !esCorreoDocentePlaceholder(item.correo) ? (
                <p className="modal-text">
                  <strong>Correo:</strong>{' '}
                  <a href={`mailto:${item.correo}`} className="modal-evento-link">
                    {item.correo}
                  </a>
                </p>
              ) : null}
              {item.telefono ? (
                <p className="modal-text">
                  <strong>Teléfono:</strong> {item.telefono}
                </p>
              ) : null}
              {item.ubicacion_fisica ? (
                <p className="modal-text">
                  <strong>Ubicación:</strong> {item.ubicacion_fisica}
                </p>
              ) : null}
              {item.cv_url ? (
                <p className="modal-text">
                  <a
                    href={fixPublicStorageUrl(item.cv_url)}
                    className="modal-evento-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver curriculum (CV)
                  </a>
                </p>
              ) : null}
              {integranteRedesEntries(item.redes_sociales).length ? (
                <p className="modal-text">
                  <strong>Enlaces:</strong>{' '}
                  {integranteRedesEntries(item.redes_sociales).map(({ key, url, label }, i) => (
                    <span key={key}>
                      {i > 0 ? ' · ' : ''}
                      <a href={url} className="modal-evento-link" target="_blank" rel="noopener noreferrer">
                        {label}
                      </a>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          </>
        )}

        {isEvento && (
          <>
            <div className="modal-evento-media">
              {eventoModalImageUrls(item).map((src, i) => (
                <img
                  key={`${i}-${src.slice(0, 64)}`}
                  className="modal-evento-cover"
                  src={src}
                  alt=""
                  width="448"
                  height="252"
                />
              ))}
            </div>
            <div className="modal-body modal-body--evento">
              <p className="modal-evento-badge">{item.badge}</p>
              <h2 className="modal-title">{item.titulo}</h2>
              <p className="modal-subtitle">
                <time dateTime={item.fechaISO}>{fechaEventoLarga(item.fechaISO)}</time>
              </p>
              {(item.hora || item.lugar) ? (
                <p className="modal-text">
                  {item.hora ? (
                    <>
                      <strong>Hora:</strong> {item.hora}
                      {item.lugar ? <br /> : null}
                    </>
                  ) : null}
                  {item.lugar ? (
                    <>
                      <strong>Lugar:</strong> {item.lugar}
                    </>
                  ) : null}
                </p>
              ) : null}
              <p className="modal-text">{item.resumen}</p>
              {item.linkUrl ? (
                <p className="modal-text">
                  <a href={item.linkUrl} className="modal-evento-link" target="_blank" rel="noopener noreferrer">
                    {item.linkLabel || 'Enlace relacionado'}
                  </a>
                </p>
              ) : null}
              {eventoSocial ? (
                <div className="modal-evento-social">
                  <div className="modal-evento-social-row">
                    <button
                      type="button"
                      className={`modal-evento-like-btn${eventoSocial.likedByMe ? ' is-liked' : ''}`}
                      onClick={onToggleEventoLike}
                      disabled={eventoSocial.likeBusy}
                    >
                      {eventoSocial.likedByMe ? '❤️ Te gusta' : '🤍 Me gusta'}
                    </button>
                    <span className="modal-evento-like-count">{eventoSocial.likesCount} likes</span>
                  </div>
                  <div className="modal-evento-comments">
                    <h3 className="modal-evento-comments-title">Comentarios</h3>
                    {eventoSocial.socialLoading ? <p className="modal-text-muted">Cargando…</p> : null}
                    {eventoSocial.socialError ? <p className="form-login-error">{eventoSocial.socialError}</p> : null}
                    {!eventoSocial.socialLoading && eventoSocial.comentarios.length === 0 ? (
                      <p className="modal-text-muted">Todavía no hay comentarios.</p>
                    ) : (
                      <ul className="modal-evento-comments-list">
                        {eventoSocial.comentarios.map((c) => (
                          <li key={c.id} className="modal-evento-comment-item">
                            <p className="modal-evento-comment-text">{c.contenido}</p>
                            <time className="modal-evento-comment-date">
                              {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                            </time>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="modal-evento-comment-form">
                      <textarea
                        rows={3}
                        placeholder={
                          eventoSocial.isAuthenticated
                            ? 'Escribe un comentario…'
                            : 'Inicia sesión para comentar'
                        }
                        value={eventoSocial.nuevoComentario}
                        onChange={(e) => onChangeEventoComment?.(e.target.value)}
                        disabled={!eventoSocial.isAuthenticated || eventoSocial.commentBusy}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onSubmitEventoComment}
                        disabled={
                          !eventoSocial.isAuthenticated ||
                          eventoSocial.commentBusy ||
                          !eventoSocial.nuevoComentario?.trim()
                        }
                      >
                        Publicar
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
