import { useEffect, useMemo, useState } from 'react'
import { HERO_PUBLICACIONES } from '../data/pageHeroImages.js'
import { EVENTOS_STATIC } from '../data/eventosStatic.js'
import { fixPublicStorageUrl } from '../services/storageService.js'
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
  return h || l || ''
}

export default function Eventos({ onBack, onOpenPost, events = EVENTOS_STATIC, user = null, heroSrc }) {
  const [busqueda, setBusqueda] = useState('')
  const hero = heroSrc || HERO_PUBLICACIONES
  const [socialById, setSocialById] = useState({})

  const feedItems = useMemo(() => {
    const list = events.filter((ev) => eventMatches(ev, busqueda))
    return [...list].sort((a, b) => inicioDia(b.fechaISO) - inicioDia(a.fechaISO))
  }, [events, busqueda])

  const sinResultados = busqueda.trim() && feedItems.length === 0

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
    if (!feedItems.length) return
    let cancelled = false
    ;(async () => {
      const entries = await Promise.all(
        feedItems.map(async (ev) => {
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
  }, [feedItems, user?.id])

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
    } catch (e) {
      window.alert(e.message || 'No se pudo actualizar el like.')
    }
  }

  return (
    <div className="page-content page-eventos page-eventos--fb page-eventos-root">
      <section className="inscripcion-hero" aria-label="Cabecera Publicaciones">
        <img src={hero} alt="" className="inscripcion-hero-photo" />
        <div className="inscripcion-hero-scrim" aria-hidden />
        <div className="inscripcion-hero-inner">
          <button type="button" className="inscripcion-hero-back" onClick={onBack}>
            ← Inicio
          </button>
          <h1 className="inscripcion-hero-title eventos-hero-title">Publicaciones</h1>
          <p className="eventos-hero-tagline">Avisos, eventos y novedades de la FCCFyD.</p>
          <div className="inscripcion-hero-search">
            <label htmlFor="eventos-filter" className="visually-hidden">
              Buscar publicaciones
            </label>
            <svg
              className="inscripcion-hero-search-icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              id="eventos-filter"
              type="search"
              className="inscripcion-hero-search-input"
              placeholder="Buscar por título, fecha, lugar…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>
      <div className="inscripcion-hero-rule" aria-hidden />

      <div className="fb-feed-shell">
        {sinResultados ? (
          <p className="eventos-sin-resultados fb-feed-alert">
            Ninguna publicación coincide con «{busqueda.trim()}». Prueba otras palabras.
          </p>
        ) : null}

        <div className="fb-feed" role="feed" aria-busy="false">
          {feedItems.length === 0 && !sinResultados ? (
            <p className="fb-feed-empty">Aún no hay publicaciones.</p>
          ) : null}
          {feedItems.map((ev) => (
            <FbPostFeedCard
              key={ev.id}
              ev={ev}
              fechaCorta={formatoCorto(ev.fechaISO)}
              social={socialById[ev.id]}
              onOpen={() => onOpenPost?.(ev)}
              onLike={() => toggleLikeCard(ev)}
              onComentar={() => onOpenPost?.(ev)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function FbPostFeedCard({ ev, fechaCorta, social, onOpen, onLike, onComentar }) {
  const rawSrc = ev.imagen || DEFAULT_IMG
  const src = fixPublicStorageUrl(rawSrc)
  const meta = metaUnaLinea(ev.hora, ev.lugar)

  const likes = social?.likesCount ?? 0
  const comments = social?.commentsCount ?? 0

  return (
    <article className="fb-post-feed-card">
      <header className="fb-post-feed-head">
        <div className="fb-post-feed-avatar" aria-hidden>
          F
        </div>
        <div className="fb-post-feed-meta">
          <p className="fb-post-feed-author">FCCFyD · UJED</p>
          <div className="fb-post-feed-row">
            <span className="fb-post-feed-badge-pill">{ev.badge}</span>
            <time className="fb-post-feed-date" dateTime={ev.fechaISO}>
              {fechaCorta}
            </time>
          </div>
        </div>
      </header>

      <button type="button" className="fb-post-feed-main" onClick={onOpen}>
        <div className="fb-post-feed-media">
          <img className="fb-post-feed-img" src={src} alt="" loading="lazy" decoding="async" />
        </div>
        <div className="fb-post-feed-body">
          <h2 className="fb-post-feed-title">{ev.titulo}</h2>
          {meta ? <p className="fb-post-feed-whenwhere">{meta}</p> : null}
          {ev.resumen ? <p className="fb-post-feed-snippet">{ev.resumen}</p> : null}
          <span className="fb-post-feed-more">Ver publicación completa</span>
        </div>
      </button>

      <div className="fb-post-feed-engagement">
        <div className="fb-post-feed-stats">
          <span className="fb-post-feed-stat">
            {likes === 1 ? '1 me gusta' : `${likes} me gusta`}
          </span>
          <span className="fb-post-feed-stat fb-post-feed-stat--right">
            {comments === 1 ? '1 comentario' : `${comments} comentarios`}
          </span>
        </div>
        <div className="fb-post-feed-actions" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={`fb-post-feed-action-btn ${social?.likedByMe ? 'is-liked' : ''}`}
            onClick={onLike}
          >
            <span className="fb-post-feed-action-ico" aria-hidden>
              {social?.likedByMe ? '❤️' : '🤍'}
            </span>
            Me gusta
          </button>
          <button type="button" className="fb-post-feed-action-btn" onClick={onComentar}>
            <span className="fb-post-feed-action-ico" aria-hidden>
              💬
            </span>
            Comentar
          </button>
        </div>
      </div>
    </article>
  )
}
