import React, { useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/utils/constants';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Magnetic effect on CTA
  useEffect(() => {
    const btn = navRef.current?.querySelector<HTMLElement>('.nav__cta');
    if (!btn || matchMedia('(hover: none)').matches) return;
    let rect = btn.getBoundingClientRect();
    const measure = () => (rect = btn.getBoundingClientRect());
    window.addEventListener('resize', measure);

    const onMove = (e: MouseEvent) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      gsap.to(btn, { x: (e.clientX - cx) * 0.22, y: (e.clientY - cy) * 0.3, duration: 0.35, ease: 'power3.out' });
    };
    const onLeave = () => gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });

    btn.addEventListener('mousemove', onMove);
    btn.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('resize', measure);
      btn.removeEventListener('mousemove', onMove);
      btn.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleLogout = () => { logout(); navigate(ROUTES.LOGIN); };

  return (
    <nav ref={navRef} className="nav">
      <div className="nav__inner">
        <Link to={ROUTES.HOME} className="nav__brand">
          <span className="pill-dot" />
          EcoScan
        </Link>

        <div className="nav__links">
          <NavLink to={ROUTES.HOME} end>Início</NavLink>
          <NavLink to={ROUTES.ABOUT}>Sobre</NavLink>
          {user && <NavLink to={ROUTES.DASHBOARD}>Dashboard</NavLink>}
        </div>

        {user ? (
          <div className="nav__user">
            <span className="nav__user-name">{user.name.split(' ')[0]}</span>
            <button onClick={handleLogout} className="nav__logout">Sair</button>
          </div>
        ) : (
          <Link to={ROUTES.LOGIN} className="nav__cta">
            Entrar <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
          </Link>
        )}
      </div>
    </nav>
  );
}
