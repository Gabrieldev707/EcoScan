import { ArrowUpRight } from 'lucide-react';

const LINKS = [
  { href: '#hero', label: 'Início' },
  { href: '#login', label: 'Acesso' },
  { href: '#dashboard', label: 'App' },
  { href: '#guia', label: 'Guia' },
  { href: '#about', label: 'Sobre' },
];

export function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <a href="#hero" className="brand">
          <span className="dot" />
          EcoScan
        </a>

        <div className="nav-links">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>

        <a href="#login" className="nav-cta">
          Entrar <ArrowUpRight size={13} />
        </a>
      </div>
    </nav>
  );
}
