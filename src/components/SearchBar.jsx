import { useState, useCallback } from 'react'

export default function SearchBar({ className = '', onSearch }) {
  const [query, setQuery] = useState('')

  const runSearch = useCallback(
    (e) => {
      e?.preventDefault()
      const q = query.trim()
      if (onSearch) onSearch(q)
    },
    [query, onSearch],
  )

  return (
    <form className={`site-search ${className}`.trim()} onSubmit={runSearch} role="search">
      <svg
        className="site-search__icon"
        width="20"
        height="20"
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
        type="search"
        className="site-search__input"
        placeholder="Buscar secciones…"
        aria-label="Buscar en el sitio"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  )
}
