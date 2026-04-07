import { useState } from 'react'
import AdminStorageField from '../components/AdminStorageField.jsx'
import { fixPublicStorageUrl } from '../services/storageService.js'

const TABS = [
  { id: 'proyectos', label: 'Proyectos de investigación', icon: '📚' },
  { id: 'publicaciones', label: 'Publicaciones', icon: '📰' },
  { id: 'grupo', label: 'Docentes', icon: '👥' },
  { id: 'inscripcion', label: 'Inscripción (docs)', icon: '📎' },
  { id: 'perfiles', label: 'Perfiles', icon: '🪪' },
  { id: 'servicioSocial', label: 'Servicio social', icon: '📋' },
  { id: 'evaluaciones', label: 'Evaluaciones', icon: '📊' },
  { id: 'comentarios', label: 'Comentarios', icon: '💬' },
  { id: 'instrumentos', label: 'Instrumentos de test', icon: '🧪' },
  { id: 'videos', label: 'De interés', icon: '🎬' },
  { id: 'codigos', label: 'Códigos de acceso', icon: '🔑' },
]

export default function AdminPanel({
  onBackHome,
  onLogout,
  adminSection,
  setAdminSection,
  projects,
  formProyecto,
  setFormProyecto,
  editProyectoId,
  addProyecto,
  deleteProyecto,
  startEditProyecto,
  cancelEditProyecto,
  integrantes,
  editIntegranteId,
  deleteIntegrante,
  startEditIntegrante,
  cancelEditIntegrante,
  instrumentos,
  formInstrumento,
  setFormInstrumento,
  editInstrumentKey,
  addInstrument,
  deleteInstrument,
  startEditInstrument,
  cancelEditInstrument,
  videosInteres,
  formVideo,
  setFormVideo,
  editVideoId,
  addVideo,
  deleteVideo,
  startEditVideo,
  cancelEditVideo,
  codigosAcceso = [],
  codigosAccesoLoading = false,
  codigoAccesoError = '',
  formCodigoAcceso,
  setFormCodigoAcceso,
  addCodigoAcceso,
  desactivarCodigoAcceso,
  docentesFull = [],
  formDocente,
  docenteArchivos = { foto: null, cv: null },
  setFormDocente,
  setDocenteArchivos,
  addDocente,
  subirImagenesGaleriaProyecto,
  subirPortadaProyecto,
  subirImagenesProyectoNuevo,
  inscripcionRows = [],
  formInscripcion,
  setFormInscripcion,
  editInscripcionId,
  setInscripcionArchivo,
  inscripcionArchivo = null,
  inscripcionAdminNotice = null,
  dismissInscripcionNotice,
  saveInscripcion,
  deleteInscripcion,
  startEditInscripcion,
  cancelEditInscripcion,
  perfilesRows = [],
  editPerfilId,
  formPerfil,
  setFormPerfil,
  setPerfilArchivo,
  savePerfilAdmin,
  startEditPerfil,
  cancelEditPerfil,
  servicioConfigRows = [],
  servicioRegistrosRows = [],
  patchServicioConfig,
  patchServicioRegistro,
  evalConfigRows = [],
  evalSelectedId,
  setEvalSelectedId,
  evalRangosRows = [],
  evalResultadosRows = [],
  crearEvaluacionConfig,
  eliminarEvaluacionConfig,
  crearEvalRango,
  eliminarEvalRango,
  comentariosRows = [],
  eliminarComentarioAdmin,
  publicacionesRows = [],
  reaccionesRows = [],
  formPublicacion,
  setFormPublicacion,
  editPublicacionId,
  savePublicacionAdmin,
  deletePublicacionAdmin,
  startEditPublicacion,
  cancelEditPublicacion,
  eliminarReaccionAdmin,
  subirImagenesPublicacion,
  quitarImagenPublicacion,
}) {
  const [evalNueva, setEvalNueva] = useState({ slug: '', nombre: '', descripcion: '' })
  const [servicioDetalleId, setServicioDetalleId] = useState(null)
  const [rangoNuevo, setRangoNuevo] = useState({
    puntaje_min: '',
    puntaje_max: '',
    titulo_resultado: '',
    descripcion_resultado: '',
    color_alerta: '',
  })

  return (
    <div className="page-content page-admin page-admin-v2">
      <button type="button" className="back-home" onClick={onBackHome}>
        ← Volver a inicio
      </button>

      <header className="admin-v2-hero">
        <div className="admin-v2-hero-text">
          <p className="admin-v2-eyebrow">FCCFyD · Coordinación</p>
          <h1 className="admin-v2-title">Panel de administración</h1>
        </div>
        <button type="button" className="admin-v2-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      <div className="admin-v2-summary">
        <div className="admin-v2-stat">
          <span className="admin-v2-stat-icon" aria-hidden>
            📚
          </span>
          <div>
            <strong>{projects.length}</strong>
            <span>Proyectos</span>
          </div>
        </div>
        <div className="admin-v2-stat">
          <span className="admin-v2-stat-icon" aria-hidden>
            👥
          </span>
          <div>
            <strong>{integrantes.length}</strong>
            <span>Integrantes</span>
          </div>
        </div>
        <div className="admin-v2-stat">
          <span className="admin-v2-stat-icon" aria-hidden>
            📋
          </span>
          <div>
            <strong>{instrumentos.length}</strong>
            <span>Instrumentos</span>
          </div>
        </div>
        <div className="admin-v2-stat">
          <span className="admin-v2-stat-icon" aria-hidden>
            🎬
          </span>
          <div>
            <strong>{videosInteres.length}</strong>
            <span>Videos</span>
          </div>
        </div>
        <div className="admin-v2-stat">
          <span className="admin-v2-stat-icon" aria-hidden>
            🔑
          </span>
          <div>
            <strong>{codigosAcceso.filter((c) => c.es_activo !== false).length}</strong>
            <span>Códigos activos</span>
          </div>
        </div>
      </div>

      <nav className="admin-v2-tabs" aria-label="Secciones del panel">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`admin-v2-tab ${adminSection === tab.id ? 'active' : ''}`}
            onClick={() => setAdminSection(tab.id)}
          >
            <span className="admin-v2-tab-icon" aria-hidden>
              {tab.icon}
            </span>
            <span className="admin-v2-tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="admin-v2-body">
        {adminSection === 'proyectos' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editProyectoId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
              <div className="admin-form-grid admin-v2-form">
                <label className="admin-form-full">
                  <span>Título</span>
                  <input
                    value={formProyecto.title}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Título del proyecto"
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción corta (texto en tarjetas y base del slug en la URL)</span>
                  <input
                    value={formProyecto.desc}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, desc: e.target.value }))}
                    placeholder="Ej. Proyecto de actividad física en adultos mayores"
                  />
                </label>
                <label>
                  <span>Investigador responsable</span>
                  <input
                    value={formProyecto.investigador_responsable}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, investigador_responsable: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Categoría</span>
                  <input
                    value={formProyecto.cat}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, cat: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Estado</span>
                  <select
                    value={formProyecto.status}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, status: e.target.value }))}
                  >
                    <option>En curso</option>
                    <option>Planificación</option>
                  </select>
                </label>
                <label>
                  <span>Fecha de inicio</span>
                  <input
                    type="date"
                    value={formProyecto.fecha_inicio || ''}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, fecha_inicio: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Fecha de fin (opcional)</span>
                  <input
                    type="date"
                    value={formProyecto.fecha_fin || ''}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, fecha_fin: e.target.value }))}
                  />
                </label>
                {(() => {
                  const gal =
                    Array.isArray(formProyecto.imagenGaleria) && formProyecto.imagenGaleria.length
                      ? formProyecto.imagenGaleria
                      : formProyecto.imagen?.trim()
                        ? [formProyecto.imagen.trim()]
                        : []
                  return gal.length > 0 ? (
                  <div className="admin-form-full admin-proyecto-galeria-strip-wrap">
                    <span className="admin-storage-field-label">Vista previa</span>
                    <div className="admin-proyecto-galeria-strip">
                      {gal.map((url, i) => (
                        <div
                          key={`${url}-${i}`}
                          className={`admin-proyecto-galeria-thumb-wrap${i === 0 ? ' is-cover' : ''}`}
                        >
                          <img src={fixPublicStorageUrl(url)} alt="" className="admin-proyecto-galeria-thumb" />
                          {i === 0 ? <span className="admin-proyecto-galeria-cover-tag">Portada</span> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                  ) : null
                })()}
                <div className="admin-form-full">
                  <AdminStorageField
                    label={editProyectoId ? 'Añadir imágenes' : 'Subir imágenes'}
                    accept="image/*"
                    multiple
                    currentUrl={undefined}
                    onUploadedMultiple={(files) =>
                      editProyectoId
                        ? subirImagenesGaleriaProyecto(files)
                        : subirImagenesProyectoNuevo(files)
                    }
                  />
                </div>
                {editProyectoId ? (
                  <div className="admin-form-full">
                    <AdminStorageField
                      label="Reemplazar portada"
                      accept="image/*"
                      currentUrl={undefined}
                      onUploaded={(file) => subirPortadaProyecto(file)}
                    />
                  </div>
                ) : null}
                <label className="admin-form-full">
                  <span>Información general</span>
                  <textarea
                    className="admin-json-textarea"
                    rows={8}
                    value={formProyecto.informacion_text}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, informacion_text: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Financiamiento, colaboradores u otros datos (opcional)</span>
                  <textarea
                    className="admin-json-textarea"
                    rows={5}
                    value={formProyecto.opcionales_text}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, opcionales_text: e.target.value }))}
                    placeholder="Texto libre opcional."
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={addProyecto}>
                  {editProyectoId ? 'Guardar cambios' : 'Agregar proyecto'}
                </button>
                {editProyectoId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditProyecto}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Listado de proyectos</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Proyecto</th>
                      <th>Slug</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                        </td>
                        <td>
                          <code className="admin-v2-code">{p.slug || '—'}</code>
                        </td>
                        <td>{p.cat}</td>
                        <td>
                          <span className={`admin-badge ${p.status === 'En curso' ? 'en-curso' : 'planificacion'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditProyecto(p)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deleteProyecto(p.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'publicaciones' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">
                {editPublicacionId ? 'Editar publicación' : 'Nueva publicación'}
              </h2>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Tipo</span>
                  <select
                    value={formPublicacion.tipo}
                    onChange={(e) => setFormPublicacion((s) => ({ ...s, tipo: e.target.value }))}
                  >
                    <option value="Noticia">Noticia</option>
                    <option value="Evento">Evento</option>
                  </select>
                </label>
                <label>
                  <span>Slug (único)</span>
                  <input
                    value={formPublicacion.slug}
                    onChange={(e) => setFormPublicacion((s) => ({ ...s, slug: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Título</span>
                  <input
                    value={formPublicacion.titulo}
                    onChange={(e) => setFormPublicacion((s) => ({ ...s, titulo: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Contenido</span>
                  <textarea
                    rows={6}
                    value={formPublicacion.cuerpo_texto}
                    onChange={(e) => setFormPublicacion((s) => ({ ...s, cuerpo_texto: e.target.value }))}
                  />
                </label>
                {(() => {
                  let urls = []
                  try {
                    const parsed = JSON.parse(formPublicacion.galeria_json || '[]')
                    urls = Array.isArray(parsed) ? parsed.map((u) => String(u).trim()).filter(Boolean) : []
                  } catch {
                    urls = []
                  }
                  return urls.length > 0 ? (
                    <div className="admin-form-full admin-proyecto-galeria-strip-wrap">
                      <span className="admin-storage-field-label">Imágenes (la primera es portada en tarjetas)</span>
                      <div className="admin-proyecto-galeria-strip">
                        {urls.map((url, i) => (
                          <div
                            key={`${url}-${i}`}
                            className={`admin-proyecto-galeria-thumb-wrap${i === 0 ? ' is-cover' : ''}`}
                          >
                            <img src={fixPublicStorageUrl(url)} alt="" className="admin-proyecto-galeria-thumb" />
                            {i === 0 ? <span className="admin-proyecto-galeria-cover-tag">Portada</span> : null}
                            {quitarImagenPublicacion ? (
                              <button
                                type="button"
                                className="admin-btn-delete admin-publicacion-galeria-remove"
                                onClick={() => quitarImagenPublicacion(i)}
                                aria-label={`Quitar imagen ${i + 1}`}
                              >
                                Quitar
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null
                })()}
                <div className="admin-form-full">
                  <AdminStorageField
                    label="Añadir imágenes a la galería"
                    accept="image/*"
                    multiple
                    hint="Podés elegir varias a la vez. Se suben al storage y se guardan al pulsar «Crear» o «Guardar publicación»."
                    currentUrl={undefined}
                    onUploadedMultiple={(files) => subirImagenesPublicacion?.(files)}
                  />
                </div>
                <label>
                  <span>Fecha de publicación</span>
                  <input
                    type="datetime-local"
                    value={formPublicacion.fecha_publicacion}
                    onChange={(e) => setFormPublicacion((s) => ({ ...s, fecha_publicacion: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={savePublicacionAdmin}>
                  {editPublicacionId ? 'Guardar publicación' : 'Crear publicación'}
                </button>
                {editPublicacionId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditPublicacion}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Listado publicaciones</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Tipo</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {publicacionesRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <strong>{row.titulo}</strong>
                          <div>
                            <code className="admin-v2-code">{row.slug}</code>
                          </div>
                        </td>
                        <td>{row.tipo}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditPublicacion(row)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deletePublicacionAdmin(row.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Reacciones</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Publicación</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {reaccionesRows.map((r) => (
                      <tr key={`${r.publicacion_id}-${r.perfil_id}`}>
                        <td>
                          <code className="admin-v2-code">{String(r.publicacion_id).slice(0, 8)}…</code>
                        </td>
                        <td>
                          <code className="admin-v2-code">{String(r.perfil_id).slice(0, 8)}…</code>
                        </td>
                        <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                        <td className="admin-cell-actions">
                          <button
                            type="button"
                            className="admin-btn-delete"
                            onClick={() => eliminarReaccionAdmin(r.publicacion_id, r.perfil_id)}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'grupo' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editIntegranteId ? 'Editar docente' : 'Nuevo docente'}</h2>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Nombres</span>
                  <input
                    value={formDocente.nombres}
                    onChange={(e) => setFormDocente((s) => ({ ...s, nombres: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Apellidos</span>
                  <input
                    value={formDocente.apellidos}
                    onChange={(e) => setFormDocente((s) => ({ ...s, apellidos: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Grado académico</span>
                  <input
                    value={formDocente.grado_academico}
                    onChange={(e) => setFormDocente((s) => ({ ...s, grado_academico: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Slug (único)</span>
                  <input
                    value={formDocente.slug}
                    onChange={(e) => setFormDocente((s) => ({ ...s, slug: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Correo</span>
                  <input
                    type="email"
                    value={formDocente.correo}
                    onChange={(e) => setFormDocente((s) => ({ ...s, correo: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Cargo</span>
                  <input
                    value={formDocente.cargo}
                    onChange={(e) => setFormDocente((s) => ({ ...s, cargo: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Área de trabajo</span>
                  <input
                    value={formDocente.area_trabajo}
                    onChange={(e) => setFormDocente((s) => ({ ...s, area_trabajo: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>LinkedIn (URL)</span>
                  <input
                    type="url"
                    placeholder="https://www.linkedin.com/in/usuario"
                    value={(() => {
                      try {
                        const redes = JSON.parse(formDocente.redes_sociales_json || '{}')
                        return typeof redes?.linkedin === 'string' ? redes.linkedin : ''
                      } catch {
                        return ''
                      }
                    })()}
                    onChange={(e) =>
                      setFormDocente((s) => {
                        let redes = {}
                        try {
                          const parsed = JSON.parse(s.redes_sociales_json || '{}')
                          if (parsed && typeof parsed === 'object') redes = parsed
                        } catch {
                          redes = {}
                        }
                        return {
                          ...s,
                          redes_sociales_json: JSON.stringify(
                            {
                              ...redes,
                              linkedin: e.target.value,
                            },
                            null,
                            2,
                          ),
                        }
                      })
                    }
                  />
                </label>
                <label>
                  <span>Orden</span>
                  <input
                    type="number"
                    value={formDocente.orden}
                    onChange={(e) => setFormDocente((s) => ({ ...s, orden: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción breve</span>
                  <textarea
                    rows={2}
                    value={formDocente.descripcion_breve}
                    onChange={(e) => setFormDocente((s) => ({ ...s, descripcion_breve: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Teléfono</span>
                  <input
                    value={formDocente.telefono}
                    onChange={(e) => setFormDocente((s) => ({ ...s, telefono: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Ubicación física</span>
                  <input
                    value={formDocente.ubicacion_fisica}
                    onChange={(e) => setFormDocente((s) => ({ ...s, ubicacion_fisica: e.target.value }))}
                  />
                </label>
                <div className="admin-form-full">
                  <AdminStorageField
                    label="Foto (archivo)"
                    accept="image/*"
                    currentUrl={formDocente.foto_url}
                    pendingFile={docenteArchivos.foto}
                    onUploaded={(file) => setDocenteArchivos((s) => ({ ...s, foto: file }))}
                    onClearPending={() => setDocenteArchivos((s) => ({ ...s, foto: null }))}
                    onClearPath={() => setFormDocente((s) => ({ ...s, foto_url: '', foto_path: '' }))}
                  />
                </div>
                <div className="admin-form-full">
                  <AdminStorageField
                    label="CV (PDF o imagen)"
                    accept=".pdf,image/*"
                    currentUrl={formDocente.cv_url}
                    pendingFile={docenteArchivos.cv}
                    onUploaded={(file) => setDocenteArchivos((s) => ({ ...s, cv: file }))}
                    onClearPending={() => setDocenteArchivos((s) => ({ ...s, cv: null }))}
                    onClearPath={() => setFormDocente((s) => ({ ...s, cv_url: '', cv_path: '' }))}
                  />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={addDocente}>
                  {editIntegranteId ? 'Guardar docente' : 'Agregar docente'}
                </button>
                {editIntegranteId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditIntegrante}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Listado docentes</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Cargo</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {docentesFull.map((d) => (
                      <tr key={d.id}>
                        <td>
                          {d.foto_url ? (
                            <img src={d.foto_url} alt="" className="admin-doc-thumb" />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <strong>
                            {d.nombres} {d.apellidos}
                          </strong>
                        </td>
                        <td>
                          <code className="admin-v2-code">{d.correo}</code>
                        </td>
                        <td>{d.cargo || '—'}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditIntegrante(d.id)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deleteIntegrante(d.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'inscripcion' && (
          <div className="admin-section admin-v2-section">
            {inscripcionAdminNotice ? (
              <div
                className={`admin-inscripcion-notice admin-inscripcion-notice--${inscripcionAdminNotice.kind === 'success' ? 'success' : 'error'}`}
                role="status"
              >
                <span>{inscripcionAdminNotice.message}</span>
                {dismissInscripcionNotice ? (
                  <button type="button" className="btn btn-ghost admin-inscripcion-notice-dismiss" onClick={dismissInscripcionNotice}>
                    Cerrar
                  </button>
                ) : null}
              </div>
            ) : null}
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editInscripcionId ? 'Editar documento' : 'Nuevo documento'}</h2>
              <div className="admin-form-grid admin-v2-form">
                <label className="admin-form-full">
                  <span>Título</span>
                  <input
                    value={formInscripcion.titulo}
                    onChange={(e) => setFormInscripcion((s) => ({ ...s, titulo: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción</span>
                  <textarea
                    rows={2}
                    value={formInscripcion.descripcion}
                    onChange={(e) => setFormInscripcion((s) => ({ ...s, descripcion: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Orden</span>
                  <input
                    type="number"
                    value={formInscripcion.orden}
                    onChange={(e) => setFormInscripcion((s) => ({ ...s, orden: e.target.value }))}
                  />
                </label>
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={formInscripcion.es_descargable !== false}
                    onChange={(e) => setFormInscripcion((s) => ({ ...s, es_descargable: e.target.checked }))}
                  />
                  <span>Descargable</span>
                </label>
                <label className="admin-checkbox-row">
                  <input
                    type="checkbox"
                    checked={formInscripcion.es_visible !== false}
                    onChange={(e) => setFormInscripcion((s) => ({ ...s, es_visible: e.target.checked }))}
                  />
                  <span>Visible</span>
                </label>
                <div className="admin-form-full">
                  <AdminStorageField
                    label="Archivo (PDF, Word, etc.)"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    currentUrl={fixPublicStorageUrl(formInscripcion.file_url)}
                    pendingFile={inscripcionArchivo}
                    onUploaded={(file) => setInscripcionArchivo(file)}
                    onClearPending={() => setInscripcionArchivo(null)}
                    onClearPath={() => {
                      setInscripcionArchivo(null)
                      setFormInscripcion((s) => ({ ...s, file_url: '', file_path: '', file_size: '' }))
                    }}
                  />
                </div>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={saveInscripcion}>
                  Guardar
                </button>
                {editInscripcionId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditInscripcion}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Documentos</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Archivo</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {inscripcionRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.titulo}</td>
                        <td>
                          {row.file_url ? (
                            <a href={fixPublicStorageUrl(row.file_url)} target="_blank" rel="noopener noreferrer">
                              Enlace
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditInscripcion(row)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deleteInscripcion(row.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'perfiles' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editPerfilId ? 'Editar perfil' : 'Elegí un perfil de la tabla'}</h2>
              {editPerfilId ? (
                <div className="admin-form-grid admin-v2-form">
                  <label className="admin-form-full">
                    <span>Identificador</span>
                    <input value={editPerfilId} readOnly className="admin-input-readonly" />
                  </label>
                  <label>
                    <span>Nombres</span>
                    <input
                      value={formPerfil.nombres}
                      onChange={(e) => setFormPerfil((s) => ({ ...s, nombres: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Apellidos</span>
                    <input
                      value={formPerfil.apellidos}
                      onChange={(e) => setFormPerfil((s) => ({ ...s, apellidos: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Matrícula</span>
                    <input
                      value={formPerfil.matricula}
                      onChange={(e) => setFormPerfil((s) => ({ ...s, matricula: e.target.value }))}
                    />
                  </label>
                  <label>
                    <span>Rol</span>
                    <select
                      value={formPerfil.rol}
                      onChange={(e) => setFormPerfil((s) => ({ ...s, rol: e.target.value }))}
                    >
                      <option value="alumno">alumno</option>
                      <option value="maestro">maestro</option>
                      <option value="admin">admin</option>
                      <option value="invitado">invitado</option>
                    </select>
                  </label>
                  <label className="admin-form-full">
                    <span>Correo (cápsula)</span>
                    <input
                      value={formPerfil.email_capsula}
                      onChange={(e) => setFormPerfil((s) => ({ ...s, email_capsula: e.target.value }))}
                    />
                  </label>
                  <div className="admin-form-full">
                    <AdminStorageField
                      label="Avatar (imagen)"
                      accept="image/*"
                      currentUrl={formPerfil.avatar_url}
                      onUploaded={(file) => setPerfilArchivo(file)}
                      onClearPath={() => setFormPerfil((s) => ({ ...s, avatar_url: '', avatar_path: '' }))}
                    />
                  </div>
                  <div className="admin-form-actions">
                    <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={savePerfilAdmin}>
                      Guardar perfil
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={cancelEditPerfil}>
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="admin-v2-hint">Seleccioná «Editar» en un usuario de la tabla.</p>
              )}
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Usuarios registrados</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Correo / id</th>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {perfilesRows.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <code className="admin-v2-code">{p.id.slice(0, 8)}…</code>
                        </td>
                        <td>
                          {p.nombres} {p.apellidos}
                        </td>
                        <td>{p.rol}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditPerfil(p)}>
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'servicioSocial' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Campos del formulario</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Campo</th>
                      <th>Etiqueta</th>
                      <th>Oblig.</th>
                      <th>Visible</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {servicioConfigRows.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <code>{c.nombre_campo}</code>
                        </td>
                        <td>
                          <input
                            defaultValue={c.etiqueta}
                            key={c.id + c.etiqueta}
                            onBlur={(e) => {
                              if (e.target.value !== c.etiqueta) {
                                patchServicioConfig(c.id, { etiqueta: e.target.value })
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            defaultChecked={c.es_obligatorio}
                            onChange={(e) => patchServicioConfig(c.id, { es_obligatorio: e.target.checked })}
                          />
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            defaultChecked={c.es_visible}
                            onChange={(e) => patchServicioConfig(c.id, { es_visible: e.target.checked })}
                          />
                        </td>
                        <td>—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Registros</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Solicitud</th>
                      <th>Estado</th>
                      <th>Obs. admin</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {servicioRegistrosRows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <code className="admin-v2-code">{String(r.perfil_id).slice(0, 8)}…</code>
                          <div className="admin-v2-cell-muted">
                            {r.created_at ? new Date(r.created_at).toLocaleString() : ''}
                          </div>
                        </td>
                        <td>
                          {(() => {
                            const extra = r?.datos_extra && typeof r.datos_extra === 'object' ? r.datos_extra : {}
                            const nombre = String(extra?.nombre || '').trim()
                            return (
                              <div className="admin-servicio-solicitud">
                                {nombre ? <div className="admin-servicio-solicitud-mini"><strong>{nombre}</strong></div> : null}
                                <div className="admin-v2-cell-muted admin-servicio-solicitud-mini">
                                  Semestre: {r.semestre ?? '—'} · Grupo: {r.grupo || '—'}
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-ghost admin-servicio-detalle-btn"
                                  onClick={() => setServicioDetalleId(r.id)}
                                >
                                  Ver detalles
                                </button>
                              </div>
                            )
                          })()}
                        </td>
                        <td>
                          <input
                            defaultValue={r.estado || ''}
                            onBlur={(e) => {
                              if (e.target.value !== (r.estado || '')) {
                                patchServicioRegistro(r.id, { estado: e.target.value })
                              }
                            }}
                          />
                        </td>
                        <td>
                          <input
                            defaultValue={r.observaciones_admin || ''}
                            className="admin-input-wide"
                            onBlur={(e) => {
                              if (e.target.value !== (r.observaciones_admin || '')) {
                                patchServicioRegistro(r.id, { observaciones_admin: e.target.value })
                              }
                            }}
                          />
                        </td>
                        <td>—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {(() => {
              const detalle = servicioRegistrosRows.find((x) => x.id === servicioDetalleId)
              if (!detalle) return null
              const extra = detalle?.datos_extra && typeof detalle.datos_extra === 'object' ? detalle.datos_extra : {}
              const nombre = String(extra?.nombre || '').trim()
              const matricula = String(extra?.matricula || '').trim()
              const correo = String(extra?.correo || '').trim()
              const celular = String(extra?.celular || '').trim()
              const comentario = String(extra?.comentario || '').trim()
              return (
                <div className="admin-servicio-modal-backdrop" role="dialog" aria-modal="true">
                  <div className="admin-servicio-modal">
                    <div className="admin-servicio-modal-head">
                      <div>
                        <h3>Detalle de solicitud</h3>
                        <p className="admin-v2-cell-muted">
                          {detalle.created_at ? new Date(detalle.created_at).toLocaleString() : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost admin-servicio-modal-close"
                        onClick={() => setServicioDetalleId(null)}
                        aria-label="Cerrar"
                      >
                        ×
                      </button>
                    </div>

                    <div className="admin-servicio-modal-grid">
                      <div className="admin-servicio-modal-item">
                        <span className="admin-servicio-modal-label">Nombre</span>
                        <p>{nombre || '—'}</p>
                      </div>
                      <div className="admin-servicio-modal-item">
                        <span className="admin-servicio-modal-label">Matrícula</span>
                        <p>{matricula || '—'}</p>
                      </div>
                      <div className="admin-servicio-modal-item">
                        <span className="admin-servicio-modal-label">Semestre</span>
                        <p>{detalle.semestre ?? '—'}</p>
                      </div>
                      <div className="admin-servicio-modal-item">
                        <span className="admin-servicio-modal-label">Grupo</span>
                        <p>{detalle.grupo || '—'}</p>
                      </div>
                      <div className="admin-servicio-modal-item">
                        <span className="admin-servicio-modal-label">Correo</span>
                        <p>{correo || '—'}</p>
                      </div>
                      <div className="admin-servicio-modal-item">
                        <span className="admin-servicio-modal-label">Celular</span>
                        <p>{celular || '—'}</p>
                      </div>
                    </div>

                    {comentario ? (
                      <div className="admin-servicio-modal-nota">
                        <span className="admin-servicio-modal-label">Sobre ti e intereses</span>
                        <p className="admin-servicio-comentario">{comentario}</p>
                      </div>
                    ) : null}
                    <div className="admin-servicio-modal-actions">
                      <button type="button" className="btn btn-primary" onClick={() => setServicioDetalleId(null)}>
                        Cerrar
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}

        {adminSection === 'evaluaciones' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Nueva evaluación</h2>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Slug</span>
                  <input
                    value={evalNueva.slug}
                    onChange={(e) => setEvalNueva((s) => ({ ...s, slug: e.target.value }))}
                    placeholder="ej. imc"
                  />
                </label>
                <label>
                  <span>Nombre</span>
                  <input
                    value={evalNueva.nombre}
                    onChange={(e) => setEvalNueva((s) => ({ ...s, nombre: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción</span>
                  <input
                    value={evalNueva.descripcion}
                    onChange={(e) => setEvalNueva((s) => ({ ...s, descripcion: e.target.value }))}
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn btn-primary admin-v2-btn-primary"
                  onClick={() => {
                    crearEvaluacionConfig(evalNueva)
                    setEvalNueva({ slug: '', nombre: '', descripcion: '' })
                  }}
                >
                  Crear evaluación
                </button>
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Configuraciones</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Slug</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {evalConfigRows.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <label className="admin-radio-row">
                            <input
                              type="radio"
                              name="evalpick"
                              checked={evalSelectedId === ev.id}
                              onChange={() => setEvalSelectedId(ev.id)}
                            />
                            {ev.nombre}
                          </label>
                        </td>
                        <td>
                          <code>{ev.slug}</code>
                        </td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-delete" onClick={() => eliminarEvaluacionConfig(ev.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Rangos de puntuación</h2>
              <p className="admin-v2-hint">
                {evalSelectedId
                  ? 'Los rangos se aplican a la evaluación marcada en la tabla anterior.'
                  : 'Seleccioná una evaluación en la tabla anterior para agregar rangos.'}
              </p>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Puntaje mínimo</span>
                  <input
                    value={rangoNuevo.puntaje_min}
                    onChange={(e) => setRangoNuevo((s) => ({ ...s, puntaje_min: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Puntaje máximo</span>
                  <input
                    value={rangoNuevo.puntaje_max}
                    onChange={(e) => setRangoNuevo((s) => ({ ...s, puntaje_max: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Título del resultado</span>
                  <input
                    value={rangoNuevo.titulo_resultado}
                    onChange={(e) => setRangoNuevo((s) => ({ ...s, titulo_resultado: e.target.value }))}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción del resultado</span>
                  <input
                    value={rangoNuevo.descripcion_resultado}
                    onChange={(e) => setRangoNuevo((s) => ({ ...s, descripcion_resultado: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Color de alerta</span>
                  <input
                    value={rangoNuevo.color_alerta}
                    onChange={(e) => setRangoNuevo((s) => ({ ...s, color_alerta: e.target.value }))}
                    placeholder="#RRGGBB o nombre"
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  className="btn btn-primary admin-v2-btn-primary"
                  onClick={() => {
                    crearEvalRango(rangoNuevo)
                    setRangoNuevo({
                      puntaje_min: '',
                      puntaje_max: '',
                      titulo_resultado: '',
                      descripcion_resultado: '',
                      color_alerta: '',
                    })
                  }}
                >
                  Agregar rango
                </button>
              </div>
              <div className="admin-table-wrap admin-v2-table-wrap admin-table-mt">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Min</th>
                      <th>Max</th>
                      <th>Título</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {evalRangosRows.map((r) => (
                      <tr key={r.id}>
                        <td>{r.puntaje_min}</td>
                        <td>{r.puntaje_max}</td>
                        <td>{r.titulo_resultado}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-delete" onClick={() => eliminarEvalRango(r.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Últimos resultados</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Evaluación</th>
                      <th>Usuario</th>
                      <th>Puntaje</th>
                      <th>Interpretación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evalResultadosRows.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <code>{String(r.evaluacion_id).slice(0, 8)}…</code>
                        </td>
                        <td>
                          <code>{String(r.perfil_id).slice(0, 8)}…</code>
                        </td>
                        <td>{r.puntaje_final}</td>
                        <td>{r.interpretacion || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'comentarios' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Comentarios</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Publicación</th>
                      <th>Usuario</th>
                      <th>Contenido</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {comentariosRows.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <code>{String(c.publicacion_id).slice(0, 8)}…</code>
                        </td>
                        <td>
                          <code>{String(c.perfil_id).slice(0, 8)}…</code>
                        </td>
                        <td className="admin-cell-clip">{c.contenido}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-delete" onClick={() => eliminarComentarioAdmin(c.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'instrumentos' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">
                {editInstrumentKey ? 'Editar instrumento' : 'Nuevo instrumento'}
              </h2>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Clave interna</span>
                  <input
                    value={formInstrumento.key}
                    onChange={(e) => setFormInstrumento((s) => ({ ...s, key: e.target.value }))}
                    placeholder="ej. calculadoraIMC"
                    disabled={!!editInstrumentKey}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Título en el menú</span>
                  <input
                    value={formInstrumento.label}
                    onChange={(e) => setFormInstrumento((s) => ({ ...s, label: e.target.value }))}
                    placeholder="Nombre visible"
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción corta</span>
                  <input
                    value={formInstrumento.desc}
                    onChange={(e) => setFormInstrumento((s) => ({ ...s, desc: e.target.value }))}
                    placeholder="Subtítulo o ayuda"
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={addInstrument}>
                  {editInstrumentKey ? 'Guardar cambios' : 'Agregar instrumento'}
                </button>
                {editInstrumentKey && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditInstrument}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Instrumentos registrados</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Clave</th>
                      <th>Título</th>
                      <th>Descripción</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {instrumentos.map((row) => (
                      <tr key={row.key}>
                        <td>
                          <code className="admin-v2-code">{row.key}</code>
                        </td>
                        <td>{row.label}</td>
                        <td className="admin-v2-cell-muted">{row.desc}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditInstrument(row)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deleteInstrument(row.key)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'videos' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editVideoId ? 'Editar video' : 'Nuevo video'}</h2>
              <div className="admin-form-grid admin-v2-form">
                <label className="admin-form-full">
                  <span>ID o URL de YouTube</span>
                  <input
                    value={formVideo.id}
                    onChange={(e) => setFormVideo((s) => ({ ...s, id: e.target.value }))}
                    placeholder="https://youtu.be/... o ID"
                    disabled={!!editVideoId}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Título</span>
                  <input
                    value={formVideo.title}
                    onChange={(e) => setFormVideo((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Título en la página"
                  />
                </label>
                <label className="admin-form-full">
                  <span>Descripción</span>
                  <input
                    value={formVideo.description}
                    onChange={(e) => setFormVideo((s) => ({ ...s, description: e.target.value }))}
                    placeholder="Texto bajo el video"
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={addVideo}>
                  {editVideoId ? 'Guardar cambios' : 'Agregar video'}
                </button>
                {editVideoId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditVideo}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">De interés</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {videosInteres.map((v) => (
                      <tr key={v.id}>
                        <td>
                          <code className="admin-v2-code">{v.id}</code>
                        </td>
                        <td>{v.title}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditVideo(v)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deleteVideo(v.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {adminSection === 'codigos' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Nuevo código de acceso</h2>
              <p className="admin-v2-hint">El tipo «Invitado» requiere indicar un correo específico.</p>
              {codigoAccesoError ? <p className="form-login-error">{codigoAccesoError}</p> : null}
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Código</span>
                  <input
                    value={formCodigoAcceso.codigo}
                    onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, codigo: e.target.value }))}
                    placeholder="Ej. ALUMNO01"
                    autoComplete="off"
                  />
                </label>
                <label>
                  <span>Tipo</span>
                  <select
                    value={formCodigoAcceso.tipo}
                    onChange={(e) => {
                      const tipo = e.target.value
                      setFormCodigoAcceso((s) => ({
                        ...s,
                        tipo,
                        email: tipo === 'INVITADO' ? s.email : '',
                      }))
                    }}
                  >
                    <option value="ALUMNOS">ALUMNOS</option>
                    <option value="MAESTROS">MAESTROS</option>
                    <option value="INVITADO">INVITADO</option>
                  </select>
                </label>
                <label>
                  <span>Rol a asignar</span>
                  <select
                    value={formCodigoAcceso.rol}
                    onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, rol: e.target.value }))}
                  >
                    <option value="alumno">alumno</option>
                    <option value="maestro">maestro</option>
                  </select>
                </label>
                <label className="admin-form-full">
                  <span>Dominio permitido (opcional)</span>
                  <input
                    value={formCodigoAcceso.dominioPermitido}
                    onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, dominioPermitido: e.target.value }))}
                    placeholder="ej. alumnos.ujed.mx"
                  />
                </label>
                <label>
                  <span>Uso máximo (−1 = ilimitado)</span>
                  <input
                    type="number"
                    value={formCodigoAcceso.usoMaximo}
                    onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, usoMaximo: e.target.value }))}
                  />
                </label>
                <label>
                  <span>Expira</span>
                  <input
                    type="datetime-local"
                    value={formCodigoAcceso.fechaExp}
                    onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, fechaExp: e.target.value }))}
                  />
                </label>
                {formCodigoAcceso.tipo === 'INVITADO' ? (
                  <label className="admin-form-full">
                    <span>Correo específico (invitado)</span>
                    <input
                      type="email"
                      value={formCodigoAcceso.email}
                      onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, email: e.target.value }))}
                      placeholder="correo@ejemplo.com"
                    />
                  </label>
                ) : null}
                <label className="admin-form-full">
                  <span>Descripción</span>
                  <input
                    value={formCodigoAcceso.descripcion}
                    onChange={(e) => setFormCodigoAcceso((s) => ({ ...s, descripcion: e.target.value }))}
                    placeholder="Texto interno para identificar el código"
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={addCodigoAcceso}>
                  Crear código
                </button>
              </div>
            </div>

            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Códigos registrados</h2>
              {codigosAccesoLoading ? (
                <p className="admin-v2-hint">Cargando…</p>
              ) : (
                <div className="admin-table-wrap admin-v2-table-wrap">
                  <table className="admin-table admin-v2-table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Rol</th>
                        <th>Correo</th>
                        <th>Dominio</th>
                        <th>Uso máx.</th>
                        <th>Expira</th>
                        <th>Estado</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {codigosAcceso.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="admin-v2-cell-muted">
                            No hay códigos para mostrar.
                          </td>
                        </tr>
                      ) : (
                        codigosAcceso.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <code className="admin-v2-code">{row.codigo}</code>
                            </td>
                            <td>{row.tipo}</td>
                            <td>{row.rol_a_asignar}</td>
                            <td>{row.email_especifico || '—'}</td>
                            <td>{row.dominio_permitido || '—'}</td>
                            <td>{row.uso_maximo}</td>
                            <td>
                              {row.fecha_expiracion
                                ? new Date(row.fecha_expiracion).toLocaleString('es-MX', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })
                                : '—'}
                            </td>
                            <td>
                              <span className={`admin-badge ${row.es_activo !== false ? 'en-curso' : 'planificacion'}`}>
                                {row.es_activo !== false ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="admin-cell-actions">
                              {row.es_activo !== false ? (
                                <button
                                  type="button"
                                  className="admin-btn-delete"
                                  onClick={() => desactivarCodigoAcceso(row.id)}
                                >
                                  Desactivar
                                </button>
                              ) : (
                                <span className="admin-v2-cell-muted">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
