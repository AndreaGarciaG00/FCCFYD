function DetalleBloque({ titulo, children, bloqueClassName, titleClassName }) {
  if (children == null) return null
  return (
    <section className={bloqueClassName || 'modal-detalle-bloque'}>
      <h3 className={titleClassName || 'modal-subtitle modal-detalle-bloque-title'}>{titulo}</h3>
      {children}
    </section>
  )
}

function fechasLegibles(value, textClass = 'modal-text') {
  if (value == null) return null
  if (typeof value === 'string' && value.trim()) {
    return <p className={textClass}>{value}</p>
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    const ini = value.inicio ?? value.desde ?? value.start
    const fin = value.fin ?? value.hasta ?? value.end
    const parts = []
    if (ini) parts.push(`Inicio: ${ini}`)
    if (fin) parts.push(`Fin: ${fin}`)
    if (parts.length) {
      return (
        <p className={textClass}>
          {parts.join(' · ')}
        </p>
      )
    }
  }
  return null
}

export function ContenidoJson({ value, textClassName = 'modal-text', listClassName, preClassName }) {
  const listCls = listClassName || 'modal-text modal-detalle-lista'
  const preCls = preClassName || 'modal-text modal-detalle-pre'
  if (value == null) return null
  if (typeof value === 'string' && value.trim()) {
    return <p className={textClassName}>{value}</p>
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return null
    return (
      <ul className={listCls}>
        {value.map((x, i) => (
          <li key={i}>
            {typeof x === 'string'
              ? x
              : typeof x === 'object' && x !== null && 'titulo' in x
                ? `${x.titulo}${x.cuerpo != null ? `: ${x.cuerpo}` : ''}`
                : JSON.stringify(x)}
          </li>
        ))}
      </ul>
    )
  }
  if (typeof value === 'object') {
    if (typeof value.cuerpo === 'string' && value.cuerpo.trim()) {
      return <p className={textClassName}>{value.cuerpo}</p>
    }
    if (typeof value.texto === 'string' && value.texto.trim()) {
      return <p className={textClassName}>{value.texto}</p>
    }
    const keys = Object.keys(value)
    if (keys.length === 0) return null
    return <pre className={preCls}>{JSON.stringify(value, null, 2)}</pre>
  }
  return null
}

function fechasTieneContenido(f) {
  if (f == null) return false
  if (typeof f === 'string') return f.trim().length > 0
  if (typeof f === 'object' && !Array.isArray(f)) return Object.keys(f).length > 0
  if (Array.isArray(f)) return f.length > 0
  return true
}

function informacionTieneContenido(ig) {
  if (ig == null) return false
  if (typeof ig === 'string') return ig.trim().length > 0
  if (typeof ig === 'object' && !Array.isArray(ig)) {
    if (typeof ig.cuerpo === 'string' && ig.cuerpo.trim()) return true
    if (typeof ig.texto === 'string' && ig.texto.trim()) return true
    return Object.keys(ig).length > 0
  }
  return true
}

function FechasContenido({ value, textClassName, listClassName, preClassName }) {
  const tc = textClassName || 'modal-text'
  const leg = fechasLegibles(value, tc)
  if (leg) return leg
  const listCls = listClassName || `${tc} modal-detalle-lista`
  return (
    <ContenidoJson
      value={value}
      textClassName={tc}
      listClassName={listCls}
      preClassName={preClassName}
    />
  )
}

/** Bloques compartidos entre el modal de divulgación y la ficha de proyecto. */
export function ProyectoDetalleSecciones({ item, variant }) {
  if (!item) return null
  const opc =
    item.datos_adicionales && typeof item.datos_adicionales === 'object'
      ? item.datos_adicionales.resumen_opcional
      : null

  const isFicha = variant === 'ficha'
  const bloqueClassName = isFicha ? 'proyecto-ficha-bloque' : undefined
  const titleClassName = isFicha ? 'proyecto-ficha-bloque-title' : undefined
  const textClass = isFicha ? 'proyecto-ficha-text' : 'modal-text'
  const listClass = isFicha ? 'proyecto-ficha-text proyecto-ficha-lista' : 'modal-text modal-detalle-lista'
  const preClass = isFicha ? 'proyecto-ficha-pre' : undefined

  return (
    <>
      {item.estadoDb ? (
        <p className={textClass}>
          <strong>Estado:</strong> {item.estadoDb}
        </p>
      ) : null}
      {fechasTieneContenido(item.fechas) ? (
        <DetalleBloque titulo="Fechas" bloqueClassName={bloqueClassName} titleClassName={titleClassName}>
          <FechasContenido
            value={item.fechas}
            textClassName={textClass}
            listClassName={listClass}
            preClassName={preClass}
          />
        </DetalleBloque>
      ) : null}
      {informacionTieneContenido(item.informacion_general) ? (
        <DetalleBloque titulo="Información general" bloqueClassName={bloqueClassName} titleClassName={titleClassName}>
          <ContenidoJson
            value={item.informacion_general}
            textClassName={textClass}
            listClassName={listClass}
            preClassName={preClass || 'modal-text modal-detalle-pre'}
          />
        </DetalleBloque>
      ) : null}
      {typeof opc === 'string' && opc.trim() ? (
        <DetalleBloque titulo="Detalles adicionales" bloqueClassName={bloqueClassName} titleClassName={titleClassName}>
          <p className={textClass}>{opc}</p>
        </DetalleBloque>
      ) : null}
    </>
  )
}
