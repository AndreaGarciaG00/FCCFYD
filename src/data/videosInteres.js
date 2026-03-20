/** Videos embebidos en «De interés» — añade más objetos { id, title, description } */
export const VIDEOS_INTERES = [
  {
    id: 'EX8SeTcMog0',
    title: 'Contenido audiovisual',
    description: 'Video seleccionado para la comunidad FCCFyD. Pulsa la miniatura para reproducir.',
  },
]

export function youtubeThumbUrl(videoId, quality = 'hqdefault') {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}
