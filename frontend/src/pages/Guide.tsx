import { CSSProperties, useEffect, useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { guideBins } from '@/data/site';

type Particle = {
  id: number;
  style: CSSProperties;
};

function buildParticles(rgb: string, shape: string): Particle[] {
  return Array.from({ length: 14 }, (_, index) => {
    const size = 4 + Math.random() * 7;
    const style: CSSProperties = {
      left: `${(8 + Math.random() * 84).toFixed(1)}%`,
      background: `rgba(${rgb}, 0.7)`,
      animationDuration: `${(1.6 + Math.random() * 1.6).toFixed(2)}s`,
      animationDelay: `${(Math.random() * 1.2).toFixed(2)}s`,
    };

    if (shape === 'rect') {
      style.width = `${(size * 1.6).toFixed(1)}px`;
      style.height = `${(size * 0.8).toFixed(1)}px`;
      style.borderRadius = '2px';
    }

    if (shape === 'circle') {
      style.width = `${size}px`;
      style.height = `${size}px`;
      style.borderRadius = '50%';
    }

    if (shape === 'hex') {
      style.width = `${size}px`;
      style.height = `${size}px`;
      style.clipPath = 'polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)';
    }

    if (shape === 'diamond') {
      style.width = `${size}px`;
      style.height = `${size}px`;
      style.transform = 'rotate(45deg)';
    }

    if (shape === 'square') {
      style.width = `${size}px`;
      style.height = `${size}px`;
    }

    return { id: index, style };
  });
}

export default function Guide() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [photoHidden, setPhotoHidden] = useState(false);
  const [particles, setParticles] = useState<Particle[]>(() => buildParticles(guideBins[0].rgb, guideBins[0].particleShape));
  const activeBin = guideBins[activeIndex];

  useEffect(() => {
    setParticles(buildParticles(activeBin.rgb, activeBin.particleShape));
  }, [activeBin.rgb, activeBin.particleShape]);

  const guideStyle = useMemo(
    () => ({
      '--guia-cat': activeBin.rgb,
      '--guia-cat-hex': activeBin.color,
    } as CSSProperties),
    [activeBin.color, activeBin.rgb],
  );

  const selectBin = (index: number) => {
    if (index === activeIndex) return;
    setPhotoHidden(true);
    window.setTimeout(() => {
      setActiveIndex(index);
      setPhotoHidden(false);
    }, 240);
  };

  return (
    <section id="guia" className="section" data-screen-label="04 Guia" style={guideStyle}>
      <div className="guia-ambient" aria-hidden="true" />

      <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>
        <div className="guia-header">
          <div>
            <div className="section-tag reveal guia-eyebrow">
              <span className="guia-eyebrow-line" /> EcoScan · Guia
            </div>
            <h2 className="section-title reveal">
              Guia de<br />
              <em className="guia-title-accent">{activeBin.category}</em>
            </h2>
          </div>
          <p className="section-sub reveal guia-header-desc">
            Selecione uma lixeira para descobrir <b>o que pode ser descartado</b>, como preparar o material e o que nunca deve ir ali.
          </p>
        </div>

        <div className="guia-tabs reveal">
          {guideBins.map((bin, index) => (
            <button
              key={bin.id}
              type="button"
              className={`guia-tab ${index === activeIndex ? 'active' : ''}`}
              style={{ '--tab-color': bin.color } as CSSProperties}
              onClick={() => selectBin(index)}
            >
              <span className="dot" />
              <span className="nm">{bin.label}</span>
              <span className="sub">— {bin.sub}</span>
            </button>
          ))}
        </div>

        <div className="guia-grid">
          <div className="guia-photo-card reveal" style={{ borderColor: `rgba(${activeBin.rgb}, 0.3)`, boxShadow: `0 0 60px rgba(${activeBin.rgb}, 0.15)` }}>
            <div className="guia-photo-wrap">
              <img className={`guia-photo ${photoHidden ? 'hidden' : ''}`} src={activeBin.photo} alt={`Lixeira ${activeBin.label}`} />
              <div className="guia-photo-wash" />
              <div className="guia-particles-layer">
                {particles.map((particle) => (
                  <div key={`${activeBin.id}-${particle.id}`} className="guia-particle" style={particle.style} />
                ))}
              </div>
              <div className="guia-photo-overlay" />
              <div className="guia-photo-info">
                <span className="guia-photo-cat">{activeBin.category}</span>
                <div className="guia-photo-sub">{activeBin.sub}</div>
              </div>
            </div>
          </div>

          <div className="guia-info-panel">
            <div className="guia-info-accepts">
              <div className="guia-card-label">O que pode ir aqui</div>
              <div className="guia-items">
                {activeBin.accepts.map((item) => (
                  <span key={item} className="guia-item">{item}</span>
                ))}
              </div>
            </div>

            <div className="guia-info-tip">
              <div className="guia-card-label">Dica de preparo</div>
              <p className="guia-tip-text">{activeBin.tip}</p>
            </div>

            <div className="guia-info-reject">
              <div className="guia-card-label reject">Nunca vai aqui</div>
              <div className="guia-items">
                {activeBin.rejects.map((item) => (
                  <span key={item} className="guia-item reject">{item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="guia-footer-note reveal">
          <div className="guia-note-icon"><Info size={18} /></div>
          <p className="guia-note-text">
            <strong>Dica geral:</strong> Sempre esvazie e enxágue as embalagens antes de descartar. Em caso de dúvida sobre qualquer material, use o scanner do EcoScan — aponte a câmera e a IA identifica o descarte correto na hora.
          </p>
        </div>
      </div>
    </section>
  );
}
