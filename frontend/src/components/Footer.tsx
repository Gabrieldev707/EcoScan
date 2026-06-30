import { GitBranch } from 'lucide-react';

const GITHUB_URL = 'https://github.com/Gabrieldev707/EcoScan.git';
const LINKEDIN_URL = 'https://www.linkedin.com/in/gabriel-azevedo-6a2568230/';

export default function Footer() {
  return (
    <footer>
      <div className="foot-inner">
        <div className="foot-col">
          <div className="foot-brand"><span className="dot" />EcoScan</div>
          <a className="github-btn" href={GITHUB_URL} target="_blank" rel="noreferrer">
            <GitBranch size={15} />
            GitHub
          </a>
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
          <a href={LINKEDIN_URL} target="_blank" rel="noreferrer">LinkedIn</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>

      <div className="dev-credit">
        <span>Desenvolvido por:</span>
        <strong>Gabriel Azevedo</strong>
        <strong>Mateus Regis</strong>
        <strong>Carlos Adrians</strong>
        <strong>Miguel Menezes</strong>
      </div>

      <div className="foot-bottom">
        <div>Unifacisa · Campina Grande, PB · 2025</div>
        <div className="right">
          <span>© EcoScan</span>
        </div>
      </div>
    </footer>
  );
}
