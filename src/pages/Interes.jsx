import { useMemo, useState } from 'react'
import SearchBar from '../components/SearchBar.jsx'
import { youtubeThumbUrl } from '../data/videosInteres.js'

function VideoCard({ id, title, description }) {
  const [playing, setPlaying] = useState(false)
  const thumb = youtubeThumbUrl(id, 'hqdefault')
  const thumbFallback = youtubeThumbUrl(id, 'mqdefault')

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
              src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
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
          href={`https://www.youtube.com/watch?v=${id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Abrir en YouTube
        </a>
      </div>
    </article>
  )
}

export default function Interes({ onBack, videos = [] }) {
  const [busqueda, setBusqueda] = useState('')

  const videosFiltrados = useMemo(() => {
    const q = String(busqueda || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
    if (!q) return videos
    const norm = (s) =>
      String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
    return videos.filter((v) => {
      const blob = norm([v.title, v.description, v.id].join(' '))
      return blob.includes(q)
    })
  }, [videos, busqueda])

  return (
    <div className="page-content page-interes">
      {onBack && (
        <button type="button" className="back-home" onClick={onBack}>
          ← Volver a inicio
        </button>
      )}
      <h1 className="page-title">De interés</h1>
      <p className="page-subtitle page-interes-lead">
        Material audiovisual y recursos útiles para la comunidad FCCFyD.
      </p>
      <div className="interes-toolbar">
        <SearchBar
          className="site-search site-search--interes"
          placeholder="Buscar video por título o tema…"
          ariaLabel="Buscar en De interés"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      {videosFiltrados.length === 0 ? (
        <p className="interes-vacio">No hay videos que coincidan con «{busqueda.trim()}».</p>
      ) : null}
      <div className="interes-videos-grid">
        {videosFiltrados.map((v) => (
          <VideoCard key={v.id} id={v.id} title={v.title} description={v.description} />
        ))}
      </div>
    </div>
  )
}
