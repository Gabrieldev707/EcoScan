import {
  BarChart3,
  BookOpen,
  MapPin,
  ScanLine,
  Sparkles,
  Trophy,
  Users,
  UsersRound,
} from 'lucide-react';
import { aboutFeatures, impactStats, personas } from '@/data/site';

const featureIcons = [ScanLine, MapPin, Trophy, UsersRound, BarChart3, BookOpen];

export default function About() {
  return (
    <section id="about" className="section" data-screen-label="05 Sobre">
      <div className="section-inner">
        <div style={{ maxWidth: 880 }}>
          <div className="section-tag reveal"><Sparkles size={12} /> Sobre o projeto</div>
          <h2 className="section-title reveal">Reciclar não falta vontade — <em>falta clareza</em>.</h2>
          <p className="section-sub reveal" style={{ maxWidth: 720 }}>
            O Brasil gera mais de <b>80 milhões de toneladas</b> de resíduos sólidos por ano e recicla menos de <b>4%</b>.
            O problema não é só estrutural, é cultural: as pessoas querem fazer certo, mas não sabem como.
            O EcoScan resolve a dúvida no momento exato em que ela aparece.
          </p>
        </div>

        <div className="feature-grid">
          {aboutFeatures.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <div key={feature.title} className="feature reveal">
                <div className="ico"><Icon size={24} /></div>
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
                <span className="tag">{feature.tag}</span>
              </div>
            );
          })}
        </div>

        <div className="impact-grid reveal">
          {impactStats.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="num">
                {stat.value}
                <span className="small">{stat.suffix}</span>
              </div>
              <div className="lab">{stat.label}</div>
              <div className="src">{stat.source}</div>
            </div>
          ))}
        </div>

        <div className="team-head">
          <div className="section-tag reveal"><Users size={12} /> A equipe</div>
          <h2 className="section-title reveal">Pessoas reais.<br /><em>Casos reais.</em></h2>
          <p className="section-sub reveal">
            Construído por estudantes da Unifacisa em torno de cinco personas — cada uma representa um motivo concreto pelo qual alguém abre o EcoScan pela primeira vez.
          </p>
        </div>

        <div className="team-list">
          {personas.map((persona) => (
            <div key={persona.name} className="team reveal">
              <div className="av-wrap"><div className="av">{persona.initials}</div></div>
              <div className="info">
                <div className="role">{persona.role}</div>
                <div className="nm">{persona.name}</div>
                <p className="desc">{persona.description}</p>
              </div>
              <div className="meta">
                <div className="num">{persona.age}</div>
                <div className="lab">Anos</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
