const TABS = [
  { id: 'proyectos', label: 'Divulgación científica', icon: '📚', hint: 'Proyectos visibles en el sitio' },
  { id: 'grupo', label: 'Cuerpo académico', icon: '👥', hint: 'Integrantes del menú lateral' },
  { id: 'instrumentos', label: 'Instrumentos de test', icon: '📋', hint: 'Herramientas e instrumentos' },
  { id: 'videos', label: 'Videos (De interés)', icon: '🎬', hint: 'YouTube en la página De interés' },
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
  ICON_MAP,
  integrantes,
  formIntegrante,
  setFormIntegrante,
  editIntegranteId,
  addIntegrante,
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
}) {
  return (
    <div className="page-content page-admin page-admin-v2">
      <button type="button" className="back-home" onClick={onBackHome}>
        ← Volver a inicio
      </button>

      <header className="admin-v2-hero">
        <div className="admin-v2-hero-text">
          <p className="admin-v2-eyebrow">FCCFyD · Coordinación</p>
          <h1 className="admin-v2-title">Panel de administración</h1>
          <p className="admin-v2-lead">
            Editá todo el contenido dinámico del sitio: divulgación, cuerpo académico, instrumentos y videos.
          </p>
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
            <span className="admin-v2-tab-hint">{tab.hint}</span>
          </button>
        ))}
      </nav>

      <div className="admin-v2-body">
        {adminSection === 'proyectos' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editProyectoId ? 'Editar proyecto' : 'Nuevo proyecto'}</h2>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Título</span>
                  <input
                    value={formProyecto.title}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, title: e.target.value }))}
                    placeholder="Nombre del proyecto"
                  />
                </label>
                <label>
                  <span>Categoría</span>
                  <input
                    value={formProyecto.cat}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, cat: e.target.value }))}
                    placeholder="Ej. Ciencias de la Salud"
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
                  <span>Icono</span>
                  <select
                    value={formProyecto.icon}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, icon: e.target.value }))}
                  >
                    {Object.entries(ICON_MAP).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v} {k}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="admin-form-full">
                  <span>Descripción</span>
                  <input
                    value={formProyecto.desc}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, desc: e.target.value }))}
                    placeholder="Descripción breve"
                  />
                </label>
                <label className="admin-form-full">
                  <span>URL imagen de portada (opcional)</span>
                  <input
                    value={formProyecto.imagen || ''}
                    onChange={(e) => setFormProyecto((s) => ({ ...s, imagen: e.target.value }))}
                    placeholder="https://… (tarjeta y modal de divulgación)"
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

        {adminSection === 'grupo' && (
          <div className="admin-section admin-v2-section">
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">{editIntegranteId ? 'Editar integrante' : 'Nuevo integrante'}</h2>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Nombre</span>
                  <input
                    value={formIntegrante.nombre}
                    onChange={(e) => setFormIntegrante((s) => ({ ...s, nombre: e.target.value }))}
                    placeholder="Dr. Nombre Apellido"
                  />
                </label>
                <label>
                  <span>Rol</span>
                  <input
                    value={formIntegrante.rol}
                    onChange={(e) => setFormIntegrante((s) => ({ ...s, rol: e.target.value }))}
                    placeholder="Ej. Coordinación"
                  />
                </label>
                <label>
                  <span>Disciplina / área</span>
                  <input
                    value={formIntegrante.disciplina}
                    onChange={(e) => setFormIntegrante((s) => ({ ...s, disciplina: e.target.value }))}
                    placeholder="Ej. FCCFyD"
                  />
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="button" className="btn btn-primary admin-v2-btn-primary" onClick={addIntegrante}>
                  {editIntegranteId ? 'Guardar cambios' : 'Agregar integrante'}
                </button>
                {editIntegranteId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEditIntegrante}>
                    Cancelar
                  </button>
                )}
              </div>
            </div>
            <div className="admin-v2-card">
              <h2 className="admin-v2-card-title">Cuerpo académico</h2>
              <div className="admin-table-wrap admin-v2-table-wrap">
                <table className="admin-table admin-v2-table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Rol</th>
                      <th>Disciplina</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {integrantes.map((i) => (
                      <tr key={i.id}>
                        <td>
                          <strong>{i.nombre}</strong>
                        </td>
                        <td>{i.rol}</td>
                        <td>{i.disciplina}</td>
                        <td className="admin-cell-actions">
                          <button type="button" className="admin-btn-edit" onClick={() => startEditIntegrante(i)}>
                            Editar
                          </button>
                          <button type="button" className="admin-btn-delete" onClick={() => deleteIntegrante(i.id)}>
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
              <p className="admin-v2-hint">
                La <strong>clave interna</strong> define la URL (solo letras y números, sin espacios). Ej.{' '}
                <code>miInstrumento</code>. Para la calculadora IMC usá la clave <code>calculadoraIMC</code>.
              </p>
              <div className="admin-form-grid admin-v2-form">
                <label>
                  <span>Clave (id)</span>
                  <input
                    value={formInstrumento.key}
                    onChange={(e) => setFormInstrumento((s) => ({ ...s, key: e.target.value }))}
                    placeholder="ej. calculadoraIMC"
                    disabled={!!editInstrumentKey}
                  />
                </label>
                <label className="admin-form-full">
                  <span>Título (menú y página)</span>
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
              <p className="admin-v2-hint">
                Pegá el enlace de YouTube o solo el ID de 11 caracteres (ej. <code>dQw4w9WgXcQ</code>).
              </p>
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
              <h2 className="admin-v2-card-title">Videos en «De interés»</h2>
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
      </div>
    </div>
  )
}
