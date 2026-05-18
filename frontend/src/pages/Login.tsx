import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { validateLogin } from '@/utils/validators';
import { ROUTES } from '@/utils/constants';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

type Mode = 'login' | 'register';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  const shake = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      x: '+=14', duration: 0.07, repeat: 7, yoyo: true,
      ease: 'power1.inOut', onComplete: () => gsap.set(cardRef.current, { x: 0 }),
    });
  };

  const spawnParticles = () => {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('span');
      p.style.cssText = `position:fixed;border-radius:50%;pointer-events:none;background:var(--green);
        width:${4 + Math.random() * 8}px;height:${4 + Math.random() * 8}px;
        left:${Math.random() * 100}vw;bottom:0;--dx:${(Math.random() - 0.5) * 200}px;
        animation:floatUp ${2 + Math.random() * 2}s ${Math.random() * 0.5}s ease-out forwards;z-index:999`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 5000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (mode === 'login') {
      const errs = validateLogin(email, password);
      if (Object.keys(errs).length) { setErrors(errs); shake(); return; }
      setLoading(true);
      try {
        await login(email, password);
        spawnParticles();
        setTimeout(() => navigate(ROUTES.DASHBOARD), 600);
      } catch (err) {
        setApiError((err as Error).message);
        shake();
      } finally {
        setLoading(false);
      }
    } else {
      const errs: Record<string, string> = {};
      if (!name.trim()) errs.name = 'Nome obrigatório';
      if (!email.trim()) errs.email = 'E-mail obrigatório';
      if (password.length < 6) errs.password = 'Mínimo 6 caracteres';
      if (password !== confirm) errs.confirm = 'Senhas não coincidem';
      if (Object.keys(errs).length) { setErrors(errs); shake(); return; }
      setLoading(true);
      try {
        await register(name, email, password);
        spawnParticles();
        setTimeout(() => navigate(ROUTES.DASHBOARD), 600);
      } catch (err) {
        setApiError((err as Error).message);
        shake();
      } finally {
        setLoading(false);
      }
    }
  };

  const eyeIcon = (
    <button type="button" onClick={() => setShowPwd(s => !s)} style={{ color: 'var(--muted)', background: 'none', border: 0, cursor: 'pointer', fontSize: 14 }}>
      {showPwd ? '🙈' : '👁'}
    </button>
  );

  return (
    <div className="login-page">
      <div className="login-grid">
        {/* Left panel */}
        <div className="login-info">
          <div className="section-tag reveal"><span>🔒</span> Acesso seguro</div>
          <h2 className="login-info__title reveal h-display">
            Sua conta.<br /><em>Seu impacto.</em><br />Mensurável.
          </h2>
          <p className="login-info__sub reveal">
            Entre para acompanhar seus scans, escalar no ranking da sua cidade e visualizar quanto material você desviou do aterro <b>este mês</b>.
          </p>
          {[
            { n: '01', title: 'Privacidade por padrão', desc: 'Imagens processadas no dispositivo. Nada armazenado sem permissão.' },
            { n: '02', title: 'Pontuação que importa', desc: 'Cada descarte correto vira EcoPoints — convertíveis em descontos.' },
            { n: '03', title: 'Grupos colaborativos', desc: 'Escolas, empresas e bairros medem o impacto coletivo em tempo real.' },
          ].map(f => (
            <div key={f.n} className="feature-row reveal">
              <div className="feature-row__num">{f.n}</div>
              <div>
                <div className="feature-row__title">{f.title}</div>
                <div className="feature-row__desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="login-card-wrap">
          <div ref={cardRef} className="login-card">
            <div className="login-card__blob a" />
            <div className="login-card__blob b" />
            <div className="login-card__eyebrow">// {mode === 'login' ? 'Entrar' : 'Criar conta'} · v1</div>

            <h3 className="login-card__title">
              {mode === 'login' ? <>Bem-vinda<br />de volta.</> : <>Criar<br />conta.</>}
            </h3>
            <p className="login-card__lead">
              {mode === 'login' ? 'Entre com sua conta para continuar.' : 'Comece a transformar descartes em impacto.'}
            </p>

            <form onSubmit={handleSubmit} noValidate>
              {mode === 'register' && (
                <Input label="Nome completo" id="name" value={name} onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }} error={errors.name} autoComplete="name" />
              )}
              <Input label="E-mail" id="email" type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} error={errors.email} autoComplete="email" />
              <Input label="Senha" id="password" type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} error={errors.password} rightSlot={eyeIcon} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
              {mode === 'register' && (
                <Input label="Confirmar senha" id="confirm" type="password" value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: '' })); }} error={errors.confirm} autoComplete="new-password" />
              )}

              {apiError && <p className="login-card__api-error">{apiError}</p>}

              <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
                {mode === 'login' ? 'Entrar na conta' : 'Criar conta'}
              </Button>

              {mode === 'login' && (
                <div className="login-card__helpers">
                  <a href="#" className="login-card__forgot">Esqueci a senha</a>
                </div>
              )}
            </form>

            <p className="login-card__switch">
              {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
              <button type="button" onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErrors({}); setApiError(''); }}>
                {mode === 'login' ? 'Cadastre-se grátis' : 'Entrar'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
