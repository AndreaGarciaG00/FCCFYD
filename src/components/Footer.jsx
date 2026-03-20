export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <p className="footer-title">CIMOHU · Ciencias del Movimiento Humano</p>
          <p className="footer-text">
            Coordinación de Investigación y Cuerpo Académico · FCCFyD · UJED
          </p>
        </div>
        <div className="footer-right">
          <p className="footer-text">© {new Date().getFullYear()} UJED · FCCFyD</p>
          <p className="footer-text footer-small">
            Sitio para consulta académica y registro de proyectos de investigación.
          </p>
        </div>
      </div>
    </footer>
  )
}

