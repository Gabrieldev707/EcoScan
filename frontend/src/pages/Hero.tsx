import { useEffect, useRef } from 'react';
import { MapPin, Play, Recycle, ScanLine, Users } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BADGES = [
  { icon: Recycle, label: '12 categorias reconhecidas' },
  { icon: MapPin, label: 'Pontos de coleta a 500m' },
  { icon: Users, label: 'Impacto coletivo em tempo real' },
];

export default function Hero() {
  const wrapRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    title.innerHTML = 'EcoScan'
      .split('')
      .map((character) => `<span class="ltr" style="opacity:0;display:inline-block;transform:translateY(80px)">${character}</span>`)
      .join('');
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    let scrollControl = false;
    let videoReady = false;

    const ensurePlay = () => {
      video.play().catch(() => undefined);
    };

    const onReady = () => {
      videoReady = true;
      ensurePlay();
    };

    if (video.readyState >= 2) onReady();
    else video.addEventListener('loadeddata', onReady, { once: true });
    ensurePlay();

    const letters = wrap.querySelectorAll<HTMLElement>('.ltr');
    const timeline = gsap.timeline({ paused: true });
    timeline
      .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
      .to(letters, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.05)
      .to(underlineRef.current, { scaleX: 1, duration: 0.9, ease: 'power3.out' }, 0.35)
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to(badgesRef.current, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

    const trigger = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        if (self.progress > 0.005 && !scrollControl) {
          scrollControl = true;
          video.pause();
          video.loop = false;
        }

        if (scrollControl && videoReady && video.duration && Number.isFinite(video.duration)) {
          video.currentTime = Math.max(0, Math.min(0.999, self.progress)) * video.duration;
        }

        const progress = self.progress;
        timeline.progress(progress < 0.55 ? 0 : Math.min(1, (progress - 0.55) / 0.35));
      },
    });

    return () => {
      trigger.kill();
      gsap.killTweensOf([letters, eyebrowRef.current, subRef.current, ctaRef.current, badgesRef.current]);
    };
  }, []);

  return (
    <section ref={wrapRef} id="hero" className="hero-wrap" data-screen-label="01 Hero">
      <div className="hero">
        <div className="fallback" />
        <video ref={videoRef} id="heroVideo" src="/hero-video.mp4" muted autoPlay playsInline loop preload="auto" />
        <div className="overlay" />
        <div className="scanlines" />

        <div className="hero-meta">
          <div className="row"><b>01</b> · Identificar</div>
          <div className="row"><b>02</b> · Descartar</div>
          <div className="row"><b>03</b> · Impactar</div>
        </div>

        <div className="hero-meta-r">
          <div className="live"><span className="blink" /> Beta · Campina Grande</div>
          <div style={{ marginTop: 10 }}>v 1.0.0 · 2026</div>
        </div>

        <div className="hero-content">
          <div ref={eyebrowRef} className="hero-eyebrow" style={{ opacity: 0, transform: 'translateY(16px)' }}>
            <span className="pill-dot" /> Identificação inteligente de resíduos
          </div>

          <h1 ref={titleRef} className="hero-title" />
          <span ref={underlineRef} className="hero-underline" style={{ transform: 'scaleX(0)', transformOrigin: 'left' }} />

          <p ref={subRef} className="hero-sub" style={{ opacity: 0, transform: 'translateY(16px)' }}>
            Aponte a câmera. Descubra a destinação correta em segundos. Transforme cada descarte em{' '}
            <b>pontos, hábito e impacto coletivo mensurável</b>.
          </p>

          <div ref={ctaRef} className="hero-cta-row" style={{ opacity: 0, transform: 'translateY(16px)' }}>
            <a href="#login" className="btn-primary" id="magneticBtn">
              <ScanLine size={14} /> Começar agora
            </a>
            <a href="#about" className="btn-ghost">
              <Play size={14} /> Ver projeto
            </a>
          </div>
        </div>

        <div ref={badgesRef} className="hero-badges" style={{ opacity: 0, transform: 'translateX(24px)' }}>
          {BADGES.map(({ icon: Icon, label }) => (
            <div key={label} className="hero-badge">
              <Icon size={16} /> {label}
            </div>
          ))}
        </div>

        <div className="scroll-hint">
          <span className="line" />
          Role para revelar
        </div>
      </div>
    </section>
  );
}
