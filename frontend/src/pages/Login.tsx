import { FormEvent, MouseEvent, useRef, useState } from 'react';
import { Apple, ArrowRight, Globe, Lock, LockKeyhole, Mail } from 'lucide-react';
import { gsap } from 'gsap';
import { loginFeatures } from '@/data/site';

export default function Login() {
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const shakeCard = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      x: '+=16',
      duration: 0.07,
      repeat: 7,
      yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => gsap.set(cardRef.current, { x: 0 }),
    });
  };

  const spawnParticles = () => {
    for (let index = 0; index < 20; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.width = `${4 + Math.random() * 8}px`;
      particle.style.height = particle.style.width;
      particle.style.setProperty('--dx', `${(Math.random() - 0.5) * 240}px`);
      particle.style.animation = `floatUp ${2 + Math.random() * 2.2}s ${Math.random() * 0.7}s ease-out forwards`;
      document.body.appendChild(particle);
      window.setTimeout(() => particle.remove(), 4800);
    }
  };

  const createRipple = (event: MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    window.setTimeout(() => ripple.remove(), 700);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password.trim()) {
      shakeCard();
      return;
    }

    setSubmitted(true);
    spawnParticles();
    window.setTimeout(() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }), 700);
  };

  return (
    <section id="login" className="section" data-screen-label="02 Login">
      <div className="section-inner login-grid">
        <div className="login-info">
          <div className="section-tag reveal">
            <LockKeyhole size={12} /> Acesso seguro
          </div>
          <h2 className="section-title reveal">
            Sua conta.<br />
            <em>Seu impacto.</em><br />
            <small>Mensurável.</small>
          </h2>
          <p className="section-sub reveal">
            Entre para acompanhar seus scans, escalar no ranking da sua cidade e visualizar quanto material você desviou do aterro <b>este mês</b>.
          </p>

          {loginFeatures.map((feature) => (
            <div key={feature.number} className="feature-row reveal">
              <div className="num">{feature.number}</div>
              <div>
                <div className="ft-title">{feature.title}</div>
                <div className="ft-desc">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="login-card-wrap reveal">
          <div ref={cardRef} className="login-card" id="loginCard">
            <div className="blob a" />
            <div className="blob b" />
            <div className="crd-eyebrow">// Entrar · v1</div>
            <h3>Bem-vinda<br />de volta.</h3>
            <p className="lead">Entre com sua conta para continuar reciclando.</p>

            <form id="loginForm" noValidate onSubmit={handleSubmit}>
              <div className="field email">
                <input
                  type="email"
                  id="email"
                  placeholder=" "
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <label htmlFor="email">E-mail</label>
                <Mail className="icon" size={16} />
              </div>

              <div className="field password">
                <input
                  type="password"
                  id="password"
                  placeholder=" "
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <label htmlFor="password">Senha</label>
                <Lock className="icon" size={16} />
              </div>

              <div className="row-helpers">
                <label><input type="checkbox" defaultChecked /> Manter conectado</label>
                <a href="#login">Esqueci a senha</a>
              </div>

              <button
                ref={buttonRef}
                type="submit"
                className="submit"
                id="submitBtn"
                onClick={createRipple}
              >
                <span>{submitted ? 'Bem-vinda!' : 'Entrar na conta'}</span>
                <ArrowRight size={14} />
              </button>

              <div className="divider">Ou continue com</div>
              <div className="oauth">
                <button type="button"><Globe size={14} /> Google</button>
                <button type="button"><Apple size={14} /> Apple</button>
              </div>

              <p className="signup-line">Não tem conta? <a href="#login">Cadastre-se grátis</a></p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
