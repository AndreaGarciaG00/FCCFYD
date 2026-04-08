/** URL del PDF con fragmentos que suelen ocultar barra extra en visor embebido del navegador. */
export function pdfEmbedViewerUrl(url) {
  if (!url) return url
  try {
    const u = new URL(url)
    u.hash = 'toolbar=0&navpanes=0&view=FitH'
    return u.toString()
  } catch {
    return url.includes('#') ? url : `${url}#toolbar=0&navpanes=0&view=FitH`
  }
}
