function formatFileSize(bytes) {
  if (bytes == null || !Number.isFinite(bytes)) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * Campo de archivo para subir a Supabase Storage y devolver path + URL pública.
 * @param {{ pendingFile?: File | null, onClearPending?: () => void }} props
 */
export default function AdminStorageField({
  label,
  accept,
  hint,
  currentUrl,
  pendingFile,
  disabled,
  multiple,
  onUploaded,
  onUploadedMultiple,
  onClearPath,
  onClearPending,
}) {
  return (
    <div className="admin-storage-field">
      <span className="admin-storage-field-label">{label}</span>
      {hint ? <p className="admin-v2-hint admin-storage-field-hint">{hint}</p> : null}
      {currentUrl ? (
        <div className="admin-storage-preview">
          {accept?.includes('image') ? (
            <img src={currentUrl} alt="" className="admin-storage-preview-img" />
          ) : (
            <a href={currentUrl} target="_blank" rel="noopener noreferrer" className="admin-storage-preview-link">
              Ver archivo actual
            </a>
          )}
          {onClearPath ? (
            <button type="button" className="btn btn-ghost admin-storage-clear" onClick={onClearPath} disabled={disabled}>
              Quitar referencia
            </button>
          ) : null}
        </div>
      ) : null}
      {pendingFile ? (
        <div className="admin-storage-pending">
          <span className="admin-storage-pending-name" title={pendingFile.name}>
            Seleccionado: <strong>{pendingFile.name}</strong>
            {pendingFile.size ? ` · ${formatFileSize(pendingFile.size)}` : null}
          </span>
          <span className="admin-storage-pending-hint">Se subirá al pulsar Guardar.</span>
          {onClearPending ? (
            <button type="button" className="btn btn-ghost admin-storage-clear" onClick={onClearPending} disabled={disabled}>
              Quitar archivo
            </button>
          ) : null}
        </div>
      ) : null}
      <label className="admin-storage-file-label">
        <span className="btn btn-ghost admin-storage-file-btn">
          {multiple ? 'Elegir archivos' : 'Elegir archivo'}
        </span>
        <input
          type="file"
          accept={accept}
          disabled={disabled}
          multiple={multiple}
          className="admin-storage-input admin-storage-input-hidden"
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : []
            e.target.value = ''
            if (!files.length) return
            if (multiple && onUploadedMultiple) {
              onUploadedMultiple(files)
            } else if (multiple) {
              files.forEach((f) => onUploaded?.(f))
            } else if (files[0] && onUploaded) {
              onUploaded(files[0])
            }
          }}
        />
      </label>
    </div>
  )
}
