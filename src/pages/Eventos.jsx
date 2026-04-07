import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import DetailModal from '../components/DetailModal.jsx'
import { EVENTOS_STATIC } from '../data/eventosStatic.js'
import { publicacionesInteraccionService } from '../services/publicacionesInteraccionService.js'

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

export default function Eventos({ onBack, events = EVENTOS_STATIC, user = null }) {
  const [busqueda, setBusqueda] = useState('')
  const [detalle, setDetalle] = useState(null)
  const [likesCount, setLikesCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialError, setSocialError] = useState('')
  const [likeBusy, setLikeBusy] = useState(false)
  const [commentBusy, setCommentBusy] = useState(false)
  const [socialById, setSocialById] = useState({})

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

  const refreshCardSocial = async (publicacionId, perfilId) => {
    if (!publicacionId) return
    const [reacciones, comments] = await Promise.all([
      publicacionesInteraccionService.listarReacciones(publicacionId),
      publicacionesInteraccionService.listarComentarios(publicacionId),
    ])
    const next = {
      likesCount: reacciones.length,
      commentsCount: comments.length,
      likedByMe: !!perfilId && reacciones.some((r) => r.perfil_id === perfilId),
    }
    setSocialById((prev) => ({ ...prev, [publicacionId]: next }))
    return next
  }

  useEffect(() => {
    const visible = [...proximosF, ...pasadosF]
    if (!visible.length) return
    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(
        visible.map(async (ev) => {
          try {
            const s = await refreshCardSocial(ev.id, user?.id)
            return [ev.id, s]
          } catch {
            return [ev.id, { likesCount: 0, commentsCount: 0, likedByMe: false }]
          }
        }),
      )
      if (!cancelled) {
        setSocialById((prev) => ({ ...prev, ...Object.fromEntries(entries) }))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [proximosF, pasadosF, user?.id])

  const cargarSocial = async (publicacionId, perfilId) => {
    if (!publicacionId) return
    setSocialLoading(true)
    setSocialError('')
    try {
      const [reacciones, comments] = await Promise.all([
        publicacionesInteraccionService.listarReacciones(publicacionId),
        publicacionesInteraccionService.listarComentarios(publicacionId),
      ])
      setLikesCount(reacciones.length)
      setLikedByMe(!!perfilId && reacciones.some((r) => r.perfil_id === perfilId))
      setComentarios(comments)
    } catch (e) {
      setSocialError(e.message || 'No se pudieron cargar likes/comentarios.')
      setLikesCount(0)
      setLikedByMe(false)
      setComentarios([])
    } finally {
      setSocialLoading(false)
    }
  }

  const abrirDetalle = async (ev) => {
    setDetalle(ev)
    setNuevoComentario('')
    setLikesCount(0)
    setLikedByMe(false)
    setComentarios([])
    if (ev?.id) {
      await cargarSocial(ev.id, user?.id)
    }
  }

  const toggleLike = async () => {
    if (!detalle?.id || likeBusy) return
    if (!user?.id) {
      window.alert('Inicia sesión para dar like.')
      return
    }
    setLikeBusy(true)
    setSocialError('')
    try {
      if (likedByMe) {
        await publicacionesInteraccionService.quitarLike(detalle.id, user.id)
      } else {
        await publicacionesInteraccionService.darLike(detalle.id, user.id)
      }
      await cargarSocial(detalle.id, user.id)
      await refreshCardSocial(detalle.id, user.id)
    } catch (e) {
      setSocialError(e.message || 'No se pudo actualizar el like.')
    } finally {
      setLikeBusy(false)
    }
  }

  const enviarComentario = async () => {
    if (!detalle?.id || commentBusy) return
    if (!user?.id) {
      window.alert('Inicia sesión para comentar.')
      return
    }
    const texto = nuevoComentario.trim()
    if (!texto) return
    setCommentBusy(true)
    setSocialError('')
    try {
      await publicacionesInteraccionService.crearComentario(detalle.id, user.id, texto)
      setNuevoComentario('')
      await cargarSocial(detalle.id, user.id)
      await refreshCardSocial(detalle.id, user.id)
    } catch (e) {
      setSocialError(e.message || 'No se pudo publicar el comentario.')
    } finally {
      setCommentBusy(false)
    }
  }

  const toggleLikeCard = async (ev) => {
    if (!ev?.id) return
    if (!user?.id) {
      window.alert('Inicia sesión para dar like.')
      return
    }
    const current = socialById[ev.id] || { likesCount: 0, commentsCount: 0, likedByMe: false }
    try {
      if (current.likedByMe) {
        await publicacionesInteraccionService.quitarLike(ev.id, user.id)
      } else {
        await publicacionesInteraccionService.darLike(ev.id, user.id)
      }
      await refreshCardSocial(ev.id, user.id)
      if (detalle?.id === ev.id) {
        await cargarSocial(ev.id, user.id)
      }
    } catch (e) {
      window.alert(e.message || 'No se pudo actualizar el like.')
    }
  }

  return (
    <div className="page-content page-eventos">
      <button type="button" className="back-home" onClick={onBack}>
        ← Volver a inicio
      </button>

      <h1 className="page-title">Publicaciones</h1>

      <div className="eventos-toolbar">
        <SearchBar
          className="site-search site-search--eventos"
          placeholder="Buscar por nombre, lugar, tipo o fecha…"
          ariaLabel="Buscar publicaciones"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {sinResultados ? (
        <p className="eventos-sin-resultados">Ninguna publicación coincide con «{busqueda.trim()}». Prueba otras palabras.</p>
      ) : null}

      <div className="eventos-stack">
        <section className="eventos-panel" aria-labelledby="ev-prox">
          <h2 id="ev-prox" className="eventos-panel-title">
            Próximos
          </h2>
          {proximosF.length === 0 && !sinResultados ? (
            <p className="eventos-panel-empty">No hay publicaciones futuras en esta lista.</p>
          ) : null}
          {proximosF.length > 0 ? (
            <div className="eventos-cards-grid">
              {proximosF.map((ev) => (
                <EventoTarjeta
                  key={ev.id}
                  ev={ev}
                  fechaCorta={formatoCorto(ev.fechaISO)}
                  onAbrir={() => abrirDetalle(ev)}
                  social={socialById[ev.id]}
                  onLike={() => toggleLikeCard(ev)}
                  onComentar={() => abrirDetalle(ev)}
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
              <p className="eventos-panel-empty">No hay publicaciones pasadas que coincidan con la búsqueda.</p>
            ) : null}
            {pasadosF.length > 0 ? (
              <div className="eventos-cards-grid">
                {pasadosF.map((ev) => (
                  <EventoTarjeta
                    key={ev.id}
                    ev={ev}
                    fechaCorta={formatoCorto(ev.fechaISO)}
                    onAbrir={() => abrirDetalle(ev)}
                    social={socialById[ev.id]}
                    onLike={() => toggleLikeCard(ev)}
                    onComentar={() => abrirDetalle(ev)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>

      <DetailModal
        detail={{ open: detalle != null, type: 'evento', item: detalle }}
        onClose={() => setDetalle(null)}
        eventoSocial={{
          likesCount,
          likedByMe,
          comentarios,
          nuevoComentario,
          socialLoading,
          socialError,
          likeBusy,
          commentBusy,
          isAuthenticated: !!user?.id,
        }}
        onToggleEventoLike={toggleLike}
        onChangeEventoComment={setNuevoComentario}
        onSubmitEventoComment={enviarComentario}
      />
    </div>
  )
}

function EventoTarjeta({ ev, fechaCorta, onAbrir, social, onLike, onComentar }) {
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
        <div className="eventos-card-social" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`eventos-card-social-btn ${social?.likedByMe ? 'is-liked' : ''}`}
            onClick={onLike}
          >
            {social?.likedByMe ? '❤️' : '🤍'} {social?.likesCount ?? 0}
          </button>
          <button type="button" className="eventos-card-social-btn" onClick={onComentar}>
            💬 {social?.commentsCount ?? 0}
          </button>
        </div>
        <span className="eventos-card-cta">Ver detalles →</span>
      </div>
    </button>
  )
}
