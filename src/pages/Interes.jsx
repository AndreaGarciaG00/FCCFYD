import { useState } from 'react'
import { youtubeThumbUrl } from '../data/videosInteres.js'

function VideoCard({ id, title, description }) {
  const [playing, setPlaying] = useState(false)
  const thumb = youtubeThumbUrl(id, 'maxresdefault')
  const thumbFallback = youtubeThumbUrl(id, 'hqdefault')

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
      <div className="interes-videos-grid">
        {videos.map((v) => (
          <VideoCard key={v.id} id={v.id} title={v.title} description={v.description} />
        ))}
      </div>
    </div>
  )
}
