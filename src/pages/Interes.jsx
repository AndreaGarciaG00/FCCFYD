import { useMemo, useState } from 'react'
import { HERO_INTERES } from '../data/pageHeroImages.js'
import { youtubeThumbUrl } from '../data/videosInteres.js'

function youtubeIdFromRow(v) {
  const y = String(v?.youtube_id || '').trim()
  if (y) return y
  const id = String(v?.id || '').trim()
  if (/^[\w-]{11}$/.test(id)) return id
  return ''
}

function VideoCard({ videoId, title, description }) {
  const [playing, setPlaying] = useState(false)
  const thumb = youtubeThumbUrl(videoId, 'hqdefault')
  const thumbFallback = youtubeThumbUrl(videoId, 'mqdefault')

  return (
    <article className="interes-video-card">
      <div className="interes-video-frame">
        {!playing ? (
          <button
            type="button"
            className="interes-video-thumb-btn"
            onClick={() => setPlaying(true)}
            aria-label={`Reproducir video: ${title}`}
          >
            <img
              src={thumb}
              alt=""
              className="interes-video-thumb"
              onError={(e) => {
                e.currentTarget.src = thumbFallback
              }}
            />
            <span className="interes-video-play" aria-hidden>
              <svg width="44" height="44" viewBox="0 0 72 72" fill="none">
                <circle cx="36" cy="36" r="36" fill="rgba(0,0,0,0.55)" />
                <path d="M28 22 L52 36 L28 50 Z" fill="#fff" />
              </svg>
            </span>
          </button>
        ) : (
          <div className="interes-video-embed">
            <iframe
              title={title}
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>
      <div className="interes-video-meta">
        <h2 className="interes-video-title">{title}</h2>
        <p className="interes-video-desc">{description}</p>
        <a
          className="interes-video-link"
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir en YouTube
        </a>
      </div>
    </article>
  )
}

export default function Interes({ onBack, videos = [], heroSrc }) {
  const [busqueda, setBusqueda] = useState('')
  const hero = heroSrc || HERO_INTERES

  const videosConYoutube = useMemo(
    () => videos.filter((v) => Boolean(youtubeIdFromRow(v))),
    [videos],
  )

  const videosFiltrados = useMemo(() => {
    const q = String(busqueda || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
    if (!q) return videosConYoutube
    const norm = (s) =>
      String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
    return videosConYoutube.filter((v) => {
      const yt = youtubeIdFromRow(v)
      const blob = norm([v.title, v.description, yt, v.id].join(' '))
      return blob.includes(q)
    })
  }, [videosConYoutube, busqueda])

  return (
    <div className="page-content page-interes page-interes-root">
      <section className="inscripcion-hero" aria-label="Cabecera De interés">
        <img src={hero} alt="" className="inscripcion-hero-photo" />
        <div className="inscripcion-hero-scrim" aria-hidden />
        <div className="inscripcion-hero-inner">
          <button type="button" className="inscripcion-hero-back" onClick={onBack}>
            ← Inicio
          </button>
          <h1 className="inscripcion-hero-title interes-hero-title">De interés</h1>
          <p className="interes-hero-tagline">
            Material audiovisual y recursos útiles para la comunidad FCCFyD.
          </p>
          <div className="inscripcion-hero-search">
            <label htmlFor="interes-filter" className="visually-hidden">
              Buscar videos
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
              id="interes-filter"
              type="search"
              className="inscripcion-hero-search-input"
              placeholder="Buscar por título o tema…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>
      </section>
      <div className="inscripcion-hero-rule" aria-hidden />

      <div className="interes-body-wrap">
        {videosFiltrados.length === 0 ? (
          <p className="interes-vacio">
            {busqueda.trim()
              ? `No hay videos que coincidan con «${busqueda.trim()}».`
              : 'Aún no hay videos en esta sección.'}
          </p>
        ) : null}
        <div className="interes-videos-grid">
          {videosFiltrados.map((v) => (
            <VideoCard
              key={v.id}
              videoId={youtubeIdFromRow(v)}
              title={v.title}
              description={v.description}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
