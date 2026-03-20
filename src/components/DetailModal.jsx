export default function DetailModal({ detail, onClose }) {
  if (!detail.open || !detail.item) return null

  const { type, item } = detail

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        {type === 'proyecto' && (
          <div className="modal-body">
            <h2 className="modal-title">{item.title}</h2>
            <p className="modal-subtitle">{item.cat}</p>
            {item.status && (
              <span
                className={`admin-badge ${
                  item.status === 'En curso' ? 'en-curso' : 'planificacion'
                }`}
              >
                {item.status}
              </span>
            )}
            <p className="modal-text">{item.desc}</p>
            <p className="modal-text-muted">
              Aquí puedes ampliar la descripción del proyecto, sus objetivos, metodología y
              responsables.
            </p>
          </div>
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
      </div>
    </div>
  )
}

