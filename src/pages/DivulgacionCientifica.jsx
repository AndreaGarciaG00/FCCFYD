import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import { proyectoCoverUrl } from '../utils/proyectoDisplay.js'

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function proyectoMatches(p, qRaw) {
  const q = norm(qRaw.trim())
  if (!q) return true
  const blob = norm([p.title, p.cat, p.desc, p.status].join(' '))
  return blob.includes(q)
}

export default function DivulgacionCientifica({ projects, onBack, onOpenProyecto }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(
    () => projects.filter((p) => proyectoMatches(p, busqueda)),
    [projects, busqueda],
  )

  return (
    <div className="page-content page-divulgacion">
      <button type="button" className="back-home" onClick={onBack}>
        ← Volver a inicio
      </button>

      <h1 className="page-title">Divulgación científica</h1>
      <p className="page-subtitle">
        Proyectos y líneas de investigación — difusión del quehacer científico CIMOHU / FCCFyD.
      </p>

      <div className="divulgacion-toolbar">
        <SearchBar
          className="site-search site-search--divulgacion"
          placeholder="Buscar por tema, título o palabras clave…"
          ariaLabel="Buscar en divulgación científica"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <p className="divulgacion-toolbar-hint">Pulsa una tarjeta para leer la descripción completa.</p>
      </div>

      {filtrados.length === 0 ? (
        <p className="divulgacion-vacio">
          {busqueda.trim()
            ? `No hay resultados para «${busqueda.trim()}».`
            : 'No hay proyectos para mostrar.'}
        </p>
      ) : (
        <div className="divulgacion-grid">
          {filtrados.map((p) => (
            <button
              key={p.id}
              type="button"
              className="divulgacion-card"
              onClick={() => onOpenProyecto(p)}
              aria-label={`Ver detalle: ${p.title}`}
            >
              <div className="divulgacion-card-media">
                <img
                  className="divulgacion-card-img"
                  src={proyectoCoverUrl(p)}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width="480"
                  height="320"
                />
                <span
                  className={`divulgacion-card-chip ${p.status === 'En curso' ? 'divulgacion-card-chip--activo' : ''}`}
                >
                  {p.status === 'En curso' ? 'En curso' : 'Planificación'}
                </span>
              </div>
              <div className="divulgacion-card-body">
                <p className="divulgacion-card-eyebrow">{p.cat}</p>
                <h3 className="divulgacion-card-title">{p.title}</h3>
                <p className="divulgacion-card-desc">{p.desc}</p>
                <span className="divulgacion-card-cta">Ver más</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
