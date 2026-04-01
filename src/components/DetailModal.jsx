import { proyectoCoverUrl } from '../utils/proyectoDisplay.js'

function fechaEventoLarga(fechaISO) {
  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function DetailModal({ detail, onClose }) {
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
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
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
              <p className="modal-text">{item.desc}</p>
              <p className="modal-text-muted">
                Información para la comunidad universitaria y divulgación del trabajo en CIMOHU / FCCFyD.
              </p>
            </div>
          </>
        )}

        {type === 'integrante' && (
          <div className="modal-body">
            <h2 className="modal-title">{item.nombre}</h2>
            <p className="modal-subtitle">{item.rol}</p>
            <p className="modal-text">{item.disciplina}</p>
            <p className="modal-text-muted">
              Información extendida del integrante, líneas de investigación, publicaciones y
              contacto.
            </p>
          </div>
        )}

        {isEvento && (
          <>
            <img
              className="modal-evento-cover"
              src={item.imagen || 'https://picsum.photos/seed/fccfyd-default/560/315'}
              alt=""
              width="448"
              height="252"
            />
            <div className="modal-body modal-body--evento">
              <p className="modal-evento-badge">{item.badge}</p>
              <h2 className="modal-title">{item.titulo}</h2>
              <p className="modal-subtitle">
                <time dateTime={item.fechaISO}>{fechaEventoLarga(item.fechaISO)}</time>
              </p>
              <p className="modal-text">
                <strong>Hora:</strong> {item.hora}
                <br />
                <strong>Lugar:</strong> {item.lugar}
              </p>
              <p className="modal-text">{item.resumen}</p>
              {item.linkUrl ? (
                <p className="modal-text">
                  <a href={item.linkUrl} className="modal-evento-link" target="_blank" rel="noopener noreferrer">
                    {item.linkLabel || 'Enlace relacionado'}
                  </a>
                </p>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
