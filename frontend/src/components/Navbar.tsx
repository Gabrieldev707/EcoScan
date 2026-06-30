import { ArrowUpRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const LINKS = [
  { href: '#hero', label: 'Início' },
  { href: '#login', label: 'Acesso' },
  { href: '#dashboard', label: 'App' },
  { href: '#guia', label: 'Guia' },
  { href: '#about', label: 'Sobre' },
];

export function Navbar() {
  const { user } = useAuth();
  const initials = user?.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

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

        <a href={user ? '#dashboard' : '#login'} className="nav-cta">
          {user && initials ? <span className="nav-user">{initials}</span> : null}
          {user ? 'Painel' : 'Entrar'} <ArrowUpRight size={13} />
        </a>
      </div>
    </nav>
  );
}
