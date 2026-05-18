import React, { useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAuth } from '@/hooks/useAuth';
import { Loading } from '@/components/Loading';
import { ROUTES } from '@/utils/constants';
import { formatKg, formatCO2 } from '@/utils/formatters';

gsap.registerPlugin(ScrollTrigger);

const METRICS = [
  { icon: '📷', label: 'Scans este mês', value: '147', delta: '+18%' },
  { icon: '♻', label: 'Material reciclado', value: formatKg(12.4), delta: '+24%' },
  { icon: '🌿', label: 'CO₂ evitado', value: formatCO2(3.2), delta: '+9%' },
  { icon: '⭐', label: 'EcoPoints acumulados', value: '1.760', delta: '+42%' },
];

const BARS = [
  { day: 'Seg', pct: 55, scans: 18 }, { day: 'Ter', pct: 72, scans: 24 },
  { day: 'Qua', pct: 36, scans: 12 }, { day: 'Qui', pct: 92, scans: 31 },
  { day: 'Sex', pct: 82, scans: 28 }, { day: 'Sáb', pct: 64, scans: 22 },
  { day: 'Dom', pct: 38, scans: 12 },
];

const SCANS = [
  { icon: '🍶', name: 'Garrafa PET — 600 ml', meta: 'Hoje, 09:42 · Lixeira amarela', pts: '+12' },
  { icon: '📦', name: 'Caixa de papelão', meta: 'Hoje, 08:11 · Lixeira azul', pts: '+8' },
  { icon: '🔋', name: 'Pilha AA · 4 un', meta: 'Ontem, 17:30 · Ponto especial', pts: '+30' },
  { icon: '🔌', name: 'Carregador de celular', meta: 'Ontem, 14:05 · E-lixo', pts: '+22' },
];

const NAV_ITEMS = ['Painel', 'Escanear', 'Pontos de coleta', 'Estatísticas', 'Conquistas'];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const chartRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [activeNav, setActiveNav] = React.useState(0);

  useEffect(() => {
    // Reveal elements
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('in'), idx * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const bars = chart.querySelectorAll<HTMLElement>('.dash-bar__fill');
    const trigger = ScrollTrigger.create({
      trigger: chart, start: 'top 80%', once: true,
      onEnter: () => {
        bars.forEach((b, i) => gsap.to(b, { height: b.dataset.h, duration: 1, delay: i * 0.07, ease: 'power3.out' }));
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    const fill = progressFillRef.current;
    if (!fill) return;
    const trigger = ScrollTrigger.create({
      trigger: fill, start: 'top 80%', once: true,
      onEnter: () => gsap.to(fill, { width: '88%', duration: 1.3, ease: 'power3.out' }),
    });
    return () => trigger.kill();
  }, []);

  if (loading) return <Loading fullScreen />;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  const initials = user.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  return (
    <div className="dash-page">
      <div className="dash-frame">
        {/* Sidebar */}
        <aside className="dash-sidebar">
          <div className="dash-sidebar__brand"><span className="pill-dot" />EcoScan</div>
          <nav className="dash-sidebar__nav">
            {NAV_ITEMS.map((item, i) => (
              <button key={item} className={`dash-sidebar__item ${activeNav === i ? 'active' : ''}`} onClick={() => setActiveNav(i)}>
                {item}
              </button>
            ))}
          </nav>
          <div className="dash-sidebar__foot">
            <div className="dash-sidebar__avatar">{initials}</div>
            <div>
              <div className="dash-sidebar__name">{user.name}</div>
              <button onClick={logout} className="dash-sidebar__logout">Sair</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="dash-main">
          <header className="dash-main__head">
            <div className="dash-main__search">
              <input placeholder="Buscar resíduo, ponto de coleta…" />
            </div>
            <div className="dash-main__user">
              <div className="dash-sidebar__avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{user.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Nível {user.level}</div>
              </div>
            </div>
          </header>

          <div className="dash-main__greet">
            <div>
              <h2>Olá, <em>{user.name.split(' ')[0]}</em>.</h2>
              <p>Você está a 240 pontos de subir para o Nível {user.level + 1}.</p>
            </div>
            <div className="dash-level-pill">🔥 Sequência de 12 dias</div>
          </div>

          {/* Progress */}
          <div className="dash-progress reveal">
            <div className="dash-progress__row">
              <span>Progresso para <b>Nível {user.level + 1}</b></span>
              <span>1.760<span style={{ color: 'var(--muted)' }}> / 2.000</span></span>
            </div>
            <div className="dash-progress__bar">
              <div ref={progressFillRef} className="dash-progress__fill" style={{ width: 0 }} />
            </div>
          </div>

          {/* Metrics */}
          <div className="dash-metrics reveal">
            {METRICS.map(m => (
              <div key={m.label} className="dash-metric">
                <div className="dash-metric__top">
                  <span className="dash-metric__icon">{m.icon}</span>
                  <span className="dash-metric__delta">▲ {m.delta}</span>
                </div>
                <div className="dash-metric__value">{m.value}</div>
                <div className="dash-metric__label">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="dash-lower">
            {/* Chart */}
            <div className="dash-chart-card reveal">
              <div className="dash-card-head">
                <h4>Atividade semanal</h4>
              </div>
              <div ref={chartRef} className="dash-chart">
                {BARS.map(b => (
                  <div key={b.day} className="dash-bar-wrap">
                    <div className="dash-bar__tip">{b.scans} scans</div>
                    <div className="dash-bar__fill" data-h={`${b.pct}%`} style={{ height: 0 }} />
                    <span className="dash-bar__day">{b.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Scan list */}
            <div className="dash-list-card reveal">
              <div className="dash-card-head">
                <h4>Últimos scans</h4>
                <a href="#">Ver tudo →</a>
              </div>
              {SCANS.map(s => (
                <div key={s.name} className="dash-scan">
                  <div className="dash-scan__icon">{s.icon}</div>
                  <div className="dash-scan__body">
                    <div className="dash-scan__name">{s.name}</div>
                    <div className="dash-scan__meta">{s.meta}</div>
                  </div>
                  <div className="dash-scan__pts">{s.pts}</div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
