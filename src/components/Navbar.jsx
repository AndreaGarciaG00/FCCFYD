import logoUjed from '../assets/UJEDLOGO-removebg-preview.png'
import logoFacultad from '../assets/LogoFCCFYD.png'
import SearchBar from './SearchBar.jsx'

export default function Navbar({ onOpenMenu, onSiteSearch }) {
  return (
    <header className="navbar navbar--mobile-only">
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-menu-btn"
          onClick={onOpenMenu}
          aria-label="Abrir menú"
        >
          <span className="hamburger" />
          <span className="hamburger" />
          <span className="hamburger" />
        </button>
        <img src={logoUjed} alt="Logo UJED" className="logo-ujed" />
      </div>
      <SearchBar className="site-search--navbar" onSearch={onSiteSearch} />
      <div className="navbar-right">
        <img
          src={logoFacultad}
          alt="Logo Facultad de Ciencias de la Cultura Física y Deporte"
          className="logo-facultad"
        />
      </div>
    </header>
  )
}

