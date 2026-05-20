import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  BatteryWarning,
  Bell,
  Coins,
  Cpu,
  Flame,
  Gift,
  Globe,
  LayoutDashboard,
  Leaf,
  Map,
  Newspaper,
  Recycle,
  ScanLine,
  Search,
  Settings,
  Trophy,
  TrendingUp,
  Users,
  Wine,
  Apple,
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { dashboardMetrics, recentScans, weeklyActivity } from '@/data/site';

gsap.registerPlugin(ScrollTrigger);

const menuItems = [
  { label: 'Painel', icon: LayoutDashboard },
  { label: 'Escanear', icon: ScanLine },
  { label: 'Pontos de coleta', icon: Map },
  { label: 'Estatísticas', icon: BarChart3 },
  { label: 'Conquistas', icon: Trophy },
];

const communityItems = [
  { label: 'Meu grupo', icon: Users },
  { label: 'Ranking', icon: Globe },
  { label: 'Recompensas', icon: Gift },
];

const metricIcons = [ScanLine, Recycle, Leaf, Coins];
const scanIcons = [Wine, Newspaper, BatteryWarning, Cpu, Apple];

export default function Dashboard() {
  const chartRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState(0);
  const [activeRange, setActiveRange] = useState('Semana');

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    const bars = chart.querySelectorAll<HTMLElement>('.b');
    const trigger = ScrollTrigger.create({
      trigger: chart,
      start: 'top 80%',
      once: true,
      onEnter: () => {
        bars.forEach((bar, index) => {
          gsap.to(bar, {
            height: bar.dataset.h,
            duration: 1,
            delay: index * 0.07,
            ease: 'power3.out',
          });
        });
      },
    });
    return () => trigger.kill();
  }, []);

  useEffect(() => {
    const fill = fillRef.current;
    if (!fill) return;
    const trigger = ScrollTrigger.create({
      trigger: fill,
      start: 'top 80%',
      once: true,
      onEnter: () => gsap.to(fill, { width: fill.dataset.target, duration: 1.3, ease: 'power3.out' }),
    });
    return () => trigger.kill();
  }, []);

  return (
    <section id="dashboard" data-screen-label="03 Dashboard">
      <div className="dash-wrap">
        <div style={{ marginBottom: 48, maxWidth: 820 }}>
          <div className="section-tag reveal"><LayoutDashboard size={12} /> Dashboard</div>
          <h2 className="section-title reveal">Seu progresso, <em>tangível</em>.</h2>
          <p className="section-sub reveal">
            Métricas em tempo real, histórico de scans e o impacto coletivo da sua rede — num painel pensado para gerar <b>consistência</b>, não culpa.
          </p>
        </div>

        <div className="dash-frame reveal">
          <aside className="sidebar">
            <div className="sb-brand"><span className="dot" />EcoScan</div>

            <div className="sb-section">
              <div className="sb-label">Menu</div>
              {menuItems.map(({ label, icon: Icon }, index) => (
                <button
                  key={label}
                  type="button"
                  className={`sb-item ${activeMenu === index ? 'active' : ''}`}
                  onClick={() => setActiveMenu(index)}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            <div className="sb-section">
              <div className="sb-label">Comunidade</div>
              {communityItems.map(({ label, icon: Icon }) => (
                <div key={label} className="sb-item">
                  <Icon size={16} /> {label}
                </div>
              ))}
            </div>

            <div className="sb-foot">
              <div className="avatar">JS</div>
              <div>
                <div style={{ color: 'var(--text)', fontWeight: 500 }}>Júlia Santos</div>
                <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.16em', marginTop: 2 }}>
                  Configurações
                </div>
              </div>
            </div>
          </aside>

          <div className="main">
            <div className="main-head">
              <div className="search-box">
                <Search size={14} />
                <input placeholder="Buscar resíduo, ponto de coleta…" />
                <span className="kbd">⌘K</span>
              </div>

              <div className="head-right">
                <button className="icon-btn" type="button">
                  <Bell size={16} />
                  <span className="badge">3</span>
                </button>
                <button className="icon-btn" type="button"><Settings size={16} /></button>
                <div className="user-chip">
                  <div className="avatar">JS</div>
                  <div>
                    <div className="nm">Júlia Santos</div>
                    <div className="lvl">Nível 7 · Guardiã</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="greet">
              <div>
                <h2>Olá, <em>Júlia</em>.</h2>
                <p>Você está a 240 pontos de subir para o Nível 8 — Defensora.</p>
              </div>
              <div className="level-pill"><Flame size={14} /> Sequência de 12 dias</div>
            </div>

            <div className="progress-card">
              <div className="progress-row">
                <div className="lbl">Progresso para <b>Nível 8 · Defensora</b></div>
                <div className="pts">1.760<span className="denom"> / 2.000</span></div>
              </div>
              <div className="bar"><div ref={fillRef} className="fill" data-target="88%" /></div>
            </div>

            <div className="metric-grid">
              {dashboardMetrics.map((metric, index) => {
                const Icon = metricIcons[index];
                return (
                  <div key={metric.label} className="metric">
                    <div className="top">
                      <div className="ico"><Icon size={16} /></div>
                      <div className="delta"><TrendingUp size={12} /> {metric.delta}</div>
                    </div>
                    <div className="num">
                      {metric.value}
                      {metric.unit && <span className="u">{metric.unit}</span>}
                    </div>
                    <div className="lab">{metric.label}</div>
                  </div>
                );
              })}
            </div>

            <div className="lower">
              <div className="chart-card">
                <div className="card-head">
                  <h4>Atividade semanal</h4>
                  <div className="seg">
                    {['Semana', 'Mês', 'Ano'].map((range) => (
                      <button
                        key={range}
                        type="button"
                        className={activeRange === range ? 'on' : ''}
                        onClick={() => setActiveRange(range)}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={chartRef} className="chart" id="chart">
                  {weeklyActivity.map((activity) => (
                    <div key={activity.day} className="bar-wrap">
                      <span className="tip">{activity.scans} scans</span>
                      <div className="b" data-h={activity.height} />
                      <span className="d">{activity.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="list-card">
                <div className="card-head"><h4>Últimos scans</h4><a href="#dashboard">Ver tudo →</a></div>
                <div className="scan-list">
                  {recentScans.map((scan, index) => {
                    const Icon = scanIcons[index];
                    return (
                      <div key={scan.name} className="scan">
                        <div className={`cat ${scan.tone}`.trim()}><Icon size={16} /></div>
                        <div className="body">
                          <div className="nm">{scan.name}</div>
                          <div className="meta">{scan.meta}</div>
                        </div>
                        <div className="pts">{scan.points}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
