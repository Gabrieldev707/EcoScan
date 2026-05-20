import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Navbar } from '@/components/Navbar';
import Footer from '@/components/Footer';
import Guide from '@/pages/Guide';
import Hero from '@/pages/Hero';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import About from '@/pages/About';
import '@/styles/globals.css';

function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onScroll = () => {
      const root = document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      bar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return <div ref={barRef} className="scroll-progress" />;
}

function RevealObserver() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const siblings = [...(entry.target.parentElement?.children ?? [])];
          const index = siblings.indexOf(entry.target);
          const delay = Math.max(0, index % 6) * 60;
          window.setTimeout(() => entry.target.classList.add('in'), delay);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return null;
}

function MagneticNavCta() {
  useEffect(() => {
    const button = document.querySelector<HTMLElement>('.nav-cta');
    if (!button || matchMedia('(hover: none)').matches) return;

    let rect = button.getBoundingClientRect();
    const measure = () => {
      rect = button.getBoundingClientRect();
    };

    const onMove = (event: MouseEvent) => {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      gsap.to(button, {
        x: (event.clientX - centerX) * 0.22,
        y: (event.clientY - centerY) * 0.3,
        duration: 0.35,
        ease: 'power3.out',
      });
    };

    const onLeave = () => {
      gsap.to(button, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    };

    window.addEventListener('resize', measure);
    button.addEventListener('mousemove', onMove);
    button.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('resize', measure);
      button.removeEventListener('mousemove', onMove);
      button.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollProgress />
      <RevealObserver />
      <MagneticNavCta />
      <Navbar />
      <main>
        <Hero />
        <Login />
        <Dashboard />
        <Guide />
        <About />
      </main>
      <Footer />
    </>
  );
}
