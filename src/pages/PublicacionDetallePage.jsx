import { useEffect, useState } from 'react'
import { HERO_PUBLICACION_DETALLE } from '../data/pageHeroImages.js'
import { fixPublicStorageUrl } from '../services/storageService.js'
import { publicacionesInteraccionService } from '../services/publicacionesInteraccionService.js'

const DEFAULT_IMG = 'https://picsum.photos/seed/fccfyd-default/560/315'

function fechaPublicacionLarga(fechaISO) {
  return new Date(`${fechaISO}T12:00:00`).toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function publicacionImageUrls(item) {
  const fromGaleria = Array.isArray(item?.galeria)
    ? item.galeria.map((u) => String(u).trim()).filter(Boolean)
    : []
  if (fromGaleria.length) return fromGaleria.map(fixPublicStorageUrl)
  if (item?.imagen) return [fixPublicStorageUrl(String(item.imagen).trim())]
  return [DEFAULT_IMG]
}

export default function PublicacionDetallePage({ item, user, onBack, heroSrc }) {
  const hero = heroSrc || HERO_PUBLICACION_DETALLE
  const [likesCount, setLikesCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [nuevoComentario, setNuevoComentario] = useState('')
  const [socialLoading, setSocialLoading] = useState(false)
  const [socialError, setSocialError] = useState('')
  const [likeBusy, setLikeBusy] = useState(false)
  const [commentBusy, setCommentBusy] = useState(false)

  const publicacionId = item?.id

  const cargarSocial = async (pid, perfilId) => {
    if (!pid) return
    setSocialLoading(true)
    setSocialError('')
    try {
      const [reacciones, comments] = await Promise.all([
        publicacionesInteraccionService.listarReacciones(pid),
        publicacionesInteraccionService.listarComentarios(pid),
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

  useEffect(() => {
    if (!publicacionId) return
    setNuevoComentario('')
    cargarSocial(publicacionId, user?.id)
  }, [publicacionId, user?.id])

  const toggleLike = async () => {
    if (!publicacionId || likeBusy) return
    if (!user?.id) {
      window.alert('Inicia sesión para dar like.')
      return
    }
    setLikeBusy(true)
    setSocialError('')
    try {
      if (likedByMe) {
        await publicacionesInteraccionService.quitarLike(publicacionId, user.id)
      } else {
        await publicacionesInteraccionService.darLike(publicacionId, user.id)
      }
      await cargarSocial(publicacionId, user.id)
    } catch (e) {
      setSocialError(e.message || 'No se pudo actualizar el like.')
    } finally {
      setLikeBusy(false)
    }
  }

  const enviarComentario = async () => {
    if (!publicacionId || commentBusy) return
    if (!user?.id) {
      window.alert('Inicia sesión para comentar.')
      return
    }
    const texto = nuevoComentario.trim()
    if (!texto) return
    setCommentBusy(true)
    setSocialError('')
    try {
      await publicacionesInteraccionService.crearComentario(publicacionId, user.id, texto)
      setNuevoComentario('')
      await cargarSocial(publicacionId, user.id)
    } catch (e) {
      setSocialError(e.message || 'No se pudo publicar el comentario.')
    } finally {
      setCommentBusy(false)
    }
  }

  if (!item) {
    return (
      <div className="page-content page-publicacion-detalle page-publicacion-detalle-root">
        <section className="inscripcion-hero inscripcion-hero--compact" aria-label="Cabecera">
          <img src={hero} alt="" className="inscripcion-hero-photo" />
          <div className="inscripcion-hero-scrim" aria-hidden />
          <div className="inscripcion-hero-inner inscripcion-hero-inner--compact">
            <button type="button" className="inscripcion-hero-back" onClick={onBack}>
              ← Publicaciones
            </button>
          </div>
        </section>
        <div className="inscripcion-hero-rule" aria-hidden />
        <div className="fb-detail-shell">
          <p className="fb-post-detail-empty">No encontramos esta publicación.</p>
        </div>
      </div>
    )
  }

  const urls = publicacionImageUrls(item)
  const mediaMulti = urls.length > 1

  return (
    <div className="page-content page-publicacion-detalle page-publicacion-detalle-root">
      <section className="inscripcion-hero inscripcion-hero--compact" aria-label="Cabecera publicación">
        <img src={hero} alt="" className="inscripcion-hero-photo" />
        <div className="inscripcion-hero-scrim" aria-hidden />
        <div className="inscripcion-hero-inner inscripcion-hero-inner--compact">
          <button type="button" className="inscripcion-hero-back" onClick={onBack}>
            ← Publicaciones
          </button>
        </div>
      </section>
      <div className="inscripcion-hero-rule" aria-hidden />

      <div className="fb-detail-shell">
        <article className="fb-post-detail">
          <header className="fb-post-detail-head">
            <div className="fb-post-detail-avatar" aria-hidden>
              F
            </div>
            <div className="fb-post-detail-meta">
              <p className="fb-post-detail-author">FCCFyD · UJED</p>
              <div className="fb-post-detail-row">
                <span className="fb-post-detail-badge-pill">{item.badge}</span>
                <time className="fb-post-detail-date" dateTime={item.fechaISO}>
                  {fechaPublicacionLarga(item.fechaISO)}
                </time>
              </div>
            </div>
          </header>

          <div
            className={
              mediaMulti ? 'fb-post-detail-media fb-post-detail-media--multi' : 'fb-post-detail-media'
            }
          >
            {urls.map((src, i) => (
              <img
                key={`${i}-${src.slice(0, 48)}`}
                className="fb-post-detail-img"
                src={src}
                alt=""
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ))}
          </div>

          <div className="fb-post-detail-body">
            <h1 className="fb-post-detail-title">{item.titulo}</h1>
            {(item.hora || item.lugar) ? (
              <p className="fb-post-detail-sub">
                {item.hora ? (
                  <>
                    <strong>Hora:</strong> {item.hora}
                    {item.lugar ? ' · ' : null}
                  </>
                ) : null}
                {item.lugar ? (
                  <>
                    <strong>Lugar:</strong> {item.lugar}
                  </>
                ) : null}
              </p>
            ) : null}
            {item.resumen ? <p className="fb-post-detail-text">{item.resumen}</p> : null}
            {item.linkUrl ? (
              <p className="fb-post-detail-link-wrap">
                <a href={item.linkUrl} className="fb-post-detail-link" target="_blank" rel="noopener noreferrer">
                  {item.linkLabel || 'Enlace relacionado'}
                </a>
              </p>
            ) : null}
          </div>

          <div className="fb-post-detail-social">
            <div className="fb-post-detail-stats-bar">
              <span>
                {likesCount === 1 ? '1 me gusta' : `${likesCount} me gusta`}
              </span>
              <span className="fb-post-detail-stats-sep" aria-hidden>
                ·
              </span>
              <span>
                {comentarios.length === 1 ? '1 comentario' : `${comentarios.length} comentarios`}
              </span>
            </div>
            <div className="fb-post-detail-actions">
              <button
                type="button"
                className={`fb-post-detail-like${likedByMe ? ' is-liked' : ''}`}
                onClick={toggleLike}
                disabled={likeBusy}
              >
                <span className="fb-post-detail-like-ico" aria-hidden>
                  {likedByMe ? '❤️' : '🤍'}
                </span>
                {likedByMe ? 'Te gusta' : 'Me gusta'}
              </button>
            </div>

            <div className="fb-post-detail-comments">
              <h2 className="fb-post-detail-comments-title">Comentarios</h2>
              {socialLoading ? <p className="fb-post-detail-muted">Cargando…</p> : null}
              {socialError ? <p className="form-login-error">{socialError}</p> : null}
              {!socialLoading && comentarios.length === 0 ? (
                <p className="fb-post-detail-muted">Todavía no hay comentarios.</p>
              ) : (
                <ul className="fb-post-detail-comments-list">
                  {comentarios.map((c) => (
                    <li key={c.id} className="fb-post-detail-comment">
                      <p className="fb-post-detail-comment-text">{c.contenido}</p>
                      <time className="fb-post-detail-comment-date">
                        {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
              <div className="fb-post-detail-comment-form">
                <textarea
                  rows={3}
                  placeholder={
                    user?.id ? 'Escribe un comentario…' : 'Inicia sesión para comentar'
                  }
                  value={nuevoComentario}
                  onChange={(e) => setNuevoComentario(e.target.value)}
                  disabled={!user?.id || commentBusy}
                />
                <div className="fb-post-detail-comment-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={enviarComentario}
                    disabled={!user?.id || commentBusy || !nuevoComentario.trim()}
                  >
                    Publicar comentario
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  )
}

