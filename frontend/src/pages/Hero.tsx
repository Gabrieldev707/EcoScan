import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ROUTES } from '@/utils/constants';

gsap.registerPlugin(ScrollTrigger);

const BADGES = [
  { icon: '♻', label: '12 categorias reconhecidas' },
  { icon: '📍', label: 'Pontos de coleta a 500m' },
  { icon: '👥', label: 'Impacto coletivo em tempo real' },
];

export default function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  // Build letter spans on mount
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.innerHTML = 'EcoScan'
      .split('')
      .map(ch => `<span class="ltr" style="opacity:0;display:inline-block;transform:translateY(80px)">${ch}</span>`)
      .join('');
  }, []);

  // GSAP scroll-scrub + entry timeline
  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;

    let scrollControl = false;
    let videoReady = false;

    const ensurePlay = () => { video.play().catch(() => {}); };
    const onReady = () => { videoReady = true; ensurePlay(); };
    if (video.readyState >= 2) onReady();
    else video.addEventListener('loadeddata', onReady, { once: true });
    ensurePlay();

    const letters = wrap.querySelectorAll<HTMLElement>('.ltr');
    const tl = gsap.timeline({ paused: true });
    tl.to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
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
        if (scrollControl && videoReady && video.duration && isFinite(video.duration)) {
          try { video.currentTime = Math.max(0, Math.min(0.999, self.progress)) * video.duration; } catch {}
        }
        const p = self.progress;
        tl.progress(p < 0.55 ? 0 : Math.min(1, (p - 0.55) / 0.35));
      },
    });

    return () => { trigger.kill(); gsap.killTweensOf([letters, eyebrowRef.current, subRef.current, ctaRef.current, badgesRef.current]); };
  }, []);

  return (
    <div ref={wrapRef} className="hero-wrap">
      <div className="hero">
        <div className="hero__fallback" />
        <video ref={videoRef} src="/hero-video.mp4" muted autoPlay playsInline loop preload="auto" className="hero__video" />
        <div className="hero__overlay" />
        <div className="hero__scanlines" />

        <div className="hero__meta">
          <div><b>01</b> · Identificar</div>
          <div><b>02</b> · Descartar</div>
          <div><b>03</b> · Impactar</div>
        </div>
        <div className="hero__meta-r">
          <div className="hero__live"><span className="pill-dot" /> Beta · Campina Grande</div>
          <div style={{ marginTop: 10, fontSize: 10 }}>v 1.0.0 · 2026</div>
        </div>

        <div className="hero__content">
          <div ref={eyebrowRef} className="hero__eyebrow" style={{ opacity: 0, transform: 'translateY(16px)' }}>
            <span className="pill-dot" /> Identificação inteligente de resíduos
          </div>
          <h1 ref={titleRef} className="hero__title h-display" />
          <span ref={underlineRef} className="hero__underline" style={{ transform: 'scaleX(0)', transformOrigin: 'left' }} />
          <p ref={subRef} className="hero__sub" style={{ opacity: 0, transform: 'translateY(16px)' }}>
            Aponte a câmera. Descubra a destinação correta em segundos. Transforme cada descarte em{' '}
            <b>pontos, hábito e impacto coletivo mensurável</b>.
          </p>
          <div ref={ctaRef} className="hero__cta-row" style={{ opacity: 0, transform: 'translateY(16px)' }}>
            <Link to={ROUTES.LOGIN} className="btn-primary">Começar agora</Link>
            <Link to={ROUTES.ABOUT} className="btn-ghost">Ver projeto</Link>
          </div>
        </div>

        <div ref={badgesRef} className="hero__badges" style={{ opacity: 0, transform: 'translateX(24px)' }}>
          {BADGES.map(b => (
            <div key={b.label} className="hero__badge">{b.icon} {b.label}</div>
          ))}
        </div>

        <div className="hero__scroll-hint"><span className="hero__scroll-line" />Role para revelar</div>
      </div>
    </div>
  );
}
