export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <p className="footer-title">FCCFYD · Facultad de Ciencias de la Cultura Física y Deporte</p>
          <p className="footer-text footer-tagline">
            Coordinación de Investigación y Cuerpo Académico · FCCFyD · UJED
          </p>
        </div>
        <div className="footer-right">
          <p className="footer-text">© {new Date().getFullYear()} UJED · FCCFYD</p>
          <p className="footer-text footer-small">
            Consulta académica y proyectos de investigación.
          </p>
        </div>
      </div>
    </footer>
  )
}

