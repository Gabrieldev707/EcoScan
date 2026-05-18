import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

const STATS = [
  { value: '12', suffix: '', label: 'Categorias de resíduos' },
  { value: '98', suffix: '%', label: 'Precisão de identificação' },
  { value: '500', suffix: 'm', label: 'Raio de pontos de coleta' },
  { value: '2.840', suffix: '', label: 'EcoPoints no ranking' },
];

const TEAM = [
  { name: 'Gabriel Azevedo', role: 'Fullstack · IA', scans: 312, pts: 2840 },
];

const FEATURES = [
  { icon: '📷', title: 'Scan com IA', desc: 'Câmera aponta pro resíduo e a IA identifica a categoria em menos de 2 segundos.' },
  { icon: '📍', title: 'Pontos de coleta', desc: 'Mapa em tempo real com os descartadores corretos a até 500m da sua posição.' },
  { icon: '⭐', title: 'EcoPoints', desc: 'Cada descarte correto gera pontos convertíveis em descontos com parceiros.' },
  { icon: '👥', title: 'Grupos', desc: 'Escolas e empresas criam grupos e medem o impacto coletivo em tempo real.' },
];

export default function About() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('in'), i * 60);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="about-page">
      {/* Hero section */}
      <section className="about-hero">
        <div className="section-tag reveal"><span className="pill-dot" /> Sobre o projeto</div>
        <h1 className="about-hero__title h-display reveal">
          Tecnologia a serviço<br />do planeta.
        </h1>
        <p className="about-hero__sub reveal">
          EcoScan nasceu em Campina Grande, PB, para resolver um problema simples: a maioria das pessoas quer reciclar,
          mas não sabe <b>o quê</b> vai onde. A IA faz essa ponte.
        </p>
      </section>

      {/* Stats */}
      <section className="about-stats">
        {STATS.map(s => (
          <div key={s.label} className="about-stat reveal">
            <div className="about-stat__num">{s.value}<span className="about-stat__suf">{s.suffix}</span></div>
            <div className="about-stat__label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features grid */}
      <section className="about-features">
        <div className="section-tag reveal"><span className="pill-dot" /> Funcionalidades</div>
        <h2 className="about-section-title h-display reveal">Como funciona</h2>
        <div className="about-features__grid">
          {FEATURES.map(f => (
            <div key={f.title} className="about-feature reveal">
              <div className="about-feature__icon">{f.icon}</div>
              <h3 className="about-feature__title">{f.title}</h3>
              <p className="about-feature__desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="about-team">
        <div className="section-tag reveal"><span className="pill-dot" /> Equipe</div>
        <h2 className="about-section-title h-display reveal">Quem faz</h2>
        <div className="about-team__grid">
          {TEAM.map(m => (
            <div key={m.name} className="about-team-card reveal">
              <div className="about-team-card__avatar">{m.name.split(' ').map(w => w[0]).join('')}</div>
              <div className="about-team-card__name">{m.name}</div>
              <div className="about-team-card__role">{m.role}</div>
              <div className="about-team-card__meta">
                <span>{m.scans} scans</span>
                <span>{m.pts.toLocaleString('pt-BR')} pts</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <h2 className="h-display reveal">Pronto para começar?</h2>
        <p className="reveal">Crie sua conta gratuita e faça seu primeiro scan agora.</p>
        <Link to={ROUTES.LOGIN} className="btn-primary reveal">Criar conta grátis</Link>
      </section>
    </div>
  );
}
