export default function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div className="foot-col">
          <div className="foot-brand"><span className="dot" />EcoScan</div>
          <p className="foot-tag">Identificação inteligente de resíduos. Tecnologia acessível no bolso de qualquer pessoa.</p>
        </div>

        <div className="foot-col">
          <h5>Produto</h5>
          <a href="#hero">Início</a>
          <a href="#login">Acesso</a>
          <a href="#dashboard">App</a>
          <a href="#guia">Guia de Descarte</a>
          <a href="#about">Sobre</a>
        </div>

        <div className="foot-col">
          <h5>Recursos</h5>
          <a href="#about">Documentação</a>
          <a href="#about">API ESG</a>
          <a href="#about">Para escolas</a>
          <a href="#about">Para empresas</a>
        </div>

        <div className="foot-col">
          <h5>Contato</h5>
          <a href="mailto:contato@ecoscan.app">contato@ecoscan.app</a>
          <a href="#hero">Instagram</a>
          <a href="#hero">LinkedIn</a>
          <a href="#hero">GitHub</a>
        </div>
      </div>

      <div className="foot-bottom">
        <div>Unifacisa · Campina Grande, PB · 2025</div>
        <div className="right">
          <span>v 1.0.0</span>
          <span>Status · Operacional</span>
          <span>© EcoScan</span>
        </div>
      </div>
    </footer>
  );
}
