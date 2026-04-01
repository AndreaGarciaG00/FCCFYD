function TableBlock({ table }) {
  const { caption, columns, rows } = table
  if (!columns?.length || !rows?.length) return null
  return (
    <div className="instrumento-table-block">
      {caption ? <p className="instrumento-table-caption">{caption}</p> : null}
      <div className="instrumento-table-wrap">
        <table className="instrumento-table">
          <thead>
            <tr>
              {columns.map((c, i) => (
                <th key={i} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) =>
                  ci === 0 ? (
                    <th key={ci} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={ci}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SubsectionBlock({ sub, index }) {
  return (
    <div className="instrumento-subsection" key={sub.title || index}>
      {sub.title ? <h3 className="instrumento-subsection-title">{sub.title}</h3> : null}
      {sub.paragraphs?.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {sub.objective ? (
        <p className="instrumento-sub-objective">
          <strong>Objetivo:</strong> {sub.objective}
        </p>
      ) : null}
      {sub.preparation ? (
        <div className="instrumento-sub-block">
          <strong className="instrumento-sub-label">Preparación</strong>
          {Array.isArray(sub.preparation) ? (
            sub.preparation.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p>{sub.preparation}</p>
          )}
        </div>
      ) : null}
      {sub.procedure?.length ? (
        <div className="instrumento-sub-block">
          <strong className="instrumento-sub-label">Procedimiento</strong>
          <ol className="instrumento-info-ol">
            {sub.procedure.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
      {sub.scoring?.length ? (
        <div className="instrumento-sub-block">
          <strong className="instrumento-sub-label">Puntuación</strong>
          <ul className="instrumento-info-list instrumento-info-list--bullets">
            {sub.scoring.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {sub.safety?.length ? (
        <div className="instrumento-sub-block instrumento-sub-block--safety">
          <strong className="instrumento-sub-label">Normas de seguridad</strong>
          <ul className="instrumento-info-list instrumento-info-list--bullets">
            {sub.safety.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default function InstrumentoDetail({ detail }) {
  if (!detail) return null

  return (
    <article className="instrumento-info-card">
      {detail.lead ? <p className="instrumento-info-lead">{detail.lead}</p> : null}

      {detail.sections?.map((sec, si) => {
        const listClass =
          sec.listStyle === 'chips'
            ? 'instrumento-info-list instrumento-info-list--chips'
            : 'instrumento-info-list instrumento-info-list--bullets'

        return (
          <section key={sec.title || `sec-${si}`} className="instrumento-info-section">
            {sec.title ? <h2 className="instrumento-info-section-title">{sec.title}</h2> : null}
            {sec.paragraphs?.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {sec.list?.length ? (
              <ul className={listClass}>
                {sec.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {sec.orderedList?.length ? (
              <ol className="instrumento-info-ol instrumento-info-ol--spaced">
                {sec.orderedList.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ol>
            ) : null}
            {sec.tables?.map((t, ti) => (
              <TableBlock key={t.caption || `table-${ti}`} table={t} />
            ))}
            {sec.paragraphsAfterTable?.map((p, i) => (
              <p key={`after-t-${i}`} className="instrumento-table-footnote">
                {p}
              </p>
            ))}
            {sec.subsections?.map((sub, ui) => (
              <SubsectionBlock key={sub.title || ui} sub={sub} index={ui} />
            ))}
          </section>
        )
      })}

      {detail.closing ? <p className="instrumento-info-closing">{detail.closing}</p> : null}

      {detail.sources?.length ? (
        <p className="instrumento-info-sources">
          Fuentes de referencia:{' '}
          {detail.sources.map((s, idx) => (
            <span key={s.label}>
              {idx > 0 ? ' · ' : ''}
              {s.url ? (
                <a href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label}
                </a>
              ) : (
                s.label
              )}
            </span>
          ))}
        </p>
      ) : null}
    </article>
  )
}
