import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import DetailModal from '../components/DetailModal.jsx'
import { EVENTOS_STATIC } from '../data/eventosStatic.js'

function inicioDia(fechaISO) {
  const d = new Date(`${fechaISO}T12:00:00`)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatoCorto(fechaISO) {
  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function eventMatches(ev, qRaw) {
  const q = norm(qRaw.trim())
  if (!q) return true
  const blob = norm([ev.titulo, ev.lugar, ev.badge, ev.resumen, formatoCorto(ev.fechaISO), ev.hora].join(' '))
  return blob.includes(q)
}

const DEFAULT_IMG = 'https://picsum.photos/seed/fccfyd-default/320/200'

function metaUnaLinea(hora, lugar) {
  const h = String(hora || '').trim()
  const l = String(lugar || '').trim()
  if (h && l) return `${h} · ${l}`
  return h || l || '—'
}

export default function Eventos({ onBack, events = EVENTOS_STATIC }) {
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle] = useState(null)

  const { proximos, pasados } = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const prox = []
    const past = []
    for (const e of events) {
      const t = inicioDia(e.fechaISO)
      if (t >= hoy) prox.push(e)
      else past.push(e)
    }
    prox.sort((a, b) => inicioDia(a.fechaISO) - inicioDia(b.fechaISO))
    past.sort((a, b) => inicioDia(b.fechaISO) - inicioDia(a.fechaISO))
    return { proximos: prox, pasados: past }
  }, [events])

  const proximosF = useMemo(() => proximos.filter((ev) => eventMatches(ev, busqueda)), [proximos, busqueda])
  const pasadosF = useMemo(() => pasados.filter((ev) => eventMatches(ev, busqueda)), [pasados, busqueda])
  const sinResultados = busqueda.trim() && proximosF.length === 0 && pasadosF.length === 0

  return (
    <div className="page-content page-eventos">
      <button type="button" className="back-home" onClick={onBack}>
        ← Volver a inicio
      </button>

      <h1 className="page-title">Eventos</h1>
      <p className="page-subtitle">
        Congresos, jornadas y actividades de la coordinación de investigación y la facultad.
      </p>

      <div className="eventos-toolbar">
        <SearchBar
          className="site-search site-search--eventos"
          placeholder="Buscar por nombre, lugar, tipo o fecha…"
          ariaLabel="Buscar eventos"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <p className="eventos-toolbar-hint">Filtra en vivo. Pulsa una tarjeta para ver el detalle completo.</p>
      </div>

      {sinResultados ? (
        <p className="eventos-sin-resultados">Ningún evento coincide con «{busqueda.trim()}». Prueba otras palabras.</p>
      ) : null}

      <div className="eventos-stack">
        <section className="eventos-panel" aria-labelledby="ev-prox">
          <h2 id="ev-prox" className="eventos-panel-title">
            Próximos
          </h2>
          {proximosF.length === 0 && !sinResultados ? (
            <p className="eventos-panel-empty">No hay eventos futuros en esta lista.</p>
          ) : null}
          {proximosF.length > 0 ? (
            <div className="eventos-cards-grid">
              {proximosF.map((ev) => (
                <EventoTarjeta
                  key={ev.id}
                  ev={ev}
                  fechaCorta={formatoCorto(ev.fechaISO)}
                  onAbrir={() => setDetalle(ev)}
                />
              ))}
            </div>
          ) : null}
        </section>

        {pasados.length > 0 ? (
          <section className="eventos-panel" aria-labelledby="ev-pas">
            <h2 id="ev-pas" className="eventos-panel-title">
              Anteriores
            </h2>
            {pasadosF.length === 0 && !sinResultados ? (
              <p className="eventos-panel-empty">No hay eventos pasados que coincidan con la búsqueda.</p>
            ) : null}
            {pasadosF.length > 0 ? (
              <div className="eventos-cards-grid">
                {pasadosF.map((ev) => (
                  <EventoTarjeta
                    key={ev.id}
                    ev={ev}
                    fechaCorta={formatoCorto(ev.fechaISO)}
                    onAbrir={() => setDetalle(ev)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      <p className="eventos-footnote">
        Pulsa una tarjeta para ampliar. Las imágenes de ejemplo pueden sustituirse por carteles propios.
      </p>

      <DetailModal
        detail={{ open: detalle != null, type: 'evento', item: detalle }}
        onClose={() => setDetalle(null)}
      />
    </div>
  )
}

function EventoTarjeta({ ev, fechaCorta, onAbrir }) {
  const src = ev.imagen || DEFAULT_IMG
  return (
    <button type="button" className="eventos-card" onClick={onAbrir} aria-label={`Ver detalles: ${ev.titulo}`}>
      <div className="eventos-card-media">
        <img className="eventos-card-img" src={src} alt="" loading="lazy" decoding="async" />
        <span className="eventos-card-date">{fechaCorta}</span>
      </div>
      <div className="eventos-card-body">
        <span className="eventos-card-badge">{ev.badge}</span>
        <h3 className="eventos-card-title">{ev.titulo}</h3>
        <p className="eventos-card-meta">{metaUnaLinea(ev.hora, ev.lugar)}</p>
        <p className="eventos-card-snippet">{ev.resumen}</p>
        <span className="eventos-card-cta">Ver detalles →</span>
      </div>
    </button>
  )
}
