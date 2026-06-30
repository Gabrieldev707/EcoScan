import { FormEvent, MouseEvent, useRef, useState } from 'react';
import { ArrowRight, Lock, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { gsap } from 'gsap';
import { loginFeatures } from '@/data/site';
import { useAuth } from '@/hooks/useAuth';
import { validateLogin, validateRegister, type LoginErrors, type RegisterErrors } from '@/utils/validators';

type AuthMode = 'login' | 'register';
type FormErrors = LoginErrors & RegisterErrors;

function GoogleIcon() {
  return (
    <svg className="oauth-icon google-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.3-.2-1.9H12v3.6h5.4c-.2 1.2-.9 2.3-2 3v2.4h3.2c1.9-1.7 3-4.2 3-7.1Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.7l-3.2-2.4c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.5A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.7H3.1a10 10 0 0 0 0 8.6l3.3-2.5Z" />
      <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10 10 0 0 0-8.9 5.7l3.3 2.5C7.2 7.9 9.4 6.1 12 6.1Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="oauth-icon apple-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.5 13.2c0-2.1 1.7-3.1 1.8-3.2-1-1.5-2.5-1.7-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.8-2.7-.8-1.4 0-2.7.8-3.4 2.1-1.5 2.6-.4 6.4 1.1 8.5.7 1 1.6 2.2 2.7 2.1 1.1 0 1.5-.7 2.8-.7 1.3 0 1.7.7 2.8.7 1.2 0 1.9-1 2.6-2 .8-1.2 1.1-2.3 1.1-2.4 0 0-2.2-.8-2.2-3.4ZM14.8 5.5c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.7-1 1.7-.9 2.6 1 0 1.9-.5 2.5-1.2Z"
      />
    </svg>
  );
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'EC';
}

export default function Login() {
  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user, login, register, logout, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';

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

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
    setStatus(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = isRegister
      ? validateRegister(name, email, password, confirm)
      : validateLogin(email, password);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus('Revise os campos destacados antes de continuar.');
      shakeCard();
      return;
    }

    setBusy(true);
    setStatus(null);
    setErrors({});

    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);

      spawnParticles();
      setStatus(isRegister ? 'Conta criada. Painel liberado.' : 'Sessão iniciada. Painel liberado.');
      window.setTimeout(() => document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' }), 700);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível autenticar agora.');
      shakeCard();
    } finally {
      setBusy(false);
    }
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
            <div className="crd-eyebrow">// {isRegister ? 'Cadastro' : 'Entrar'} · v1</div>

            {user ? (
              <div className="session-card">
                <div className="session-avatar">{getInitials(user.name)}</div>
                <div className="session-kicker">Sessão ativa</div>
                <h3>{user.name}</h3>
                <p className="lead">Você já está conectado ao painel EcoScan.</p>
                <div className="session-meta">
                  <span>Nível {user.level}</span>
                  <span>{user.points.toLocaleString('pt-BR')} EcoPoints</span>
                </div>
                <div className="session-actions">
                  <a className="submit session-link" href="#dashboard">
                    <span>Abrir painel</span>
                    <ArrowRight size={14} />
                  </a>
                  <button type="button" className="ghost-action" onClick={logout}>
                    Sair da conta
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3>{isRegister ? 'Criar conta.' : 'Bem-vinda de volta.'}</h3>
                <p className="lead">
                  {isRegister ? 'Cadastre sua conta para começar a acumular EcoPoints.' : 'Entre com sua conta para continuar reciclando.'}
                </p>

                <div className="auth-switch" role="tablist" aria-label="Modo de acesso">
                  <button
                    type="button"
                    className={mode === 'login' ? 'active' : ''}
                    onClick={() => switchMode('login')}
                    role="tab"
                    aria-selected={mode === 'login'}
                  >
                    Entrar
                  </button>
                  <button
                    type="button"
                    className={mode === 'register' ? 'active' : ''}
                    onClick={() => switchMode('register')}
                    role="tab"
                    aria-selected={mode === 'register'}
                  >
                    Cadastrar
                  </button>
                </div>

                <form id="loginForm" noValidate onSubmit={handleSubmit}>
                  {isRegister && (
                    <div className={`field ${errors.name ? 'error' : ''}`}>
                      <input
                        type="text"
                        id="name"
                        placeholder=" "
                        autoComplete="name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        aria-invalid={Boolean(errors.name)}
                      />
                      <label htmlFor="name">Nome</label>
                      <UserRound className="icon" size={16} />
                      {errors.name && <div className="field-error">{errors.name}</div>}
                    </div>
                  )}

                  <div className={`field email ${errors.email ? 'error' : ''}`}>
                    <input
                      type="email"
                      id="email"
                      placeholder=" "
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                    />
                    <label htmlFor="email">E-mail</label>
                    <Mail className="icon" size={16} />
                    {errors.email && <div className="field-error">{errors.email}</div>}
                  </div>

                  <div className={`field password ${errors.password ? 'error' : ''}`}>
                    <input
                      type="password"
                      id="password"
                      placeholder=" "
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(errors.password)}
                    />
                    <label htmlFor="password">Senha</label>
                    <Lock className="icon" size={16} />
                    {errors.password && <div className="field-error">{errors.password}</div>}
                  </div>

                  {isRegister && (
                    <div className={`field password ${errors.confirm ? 'error' : ''}`}>
                      <input
                        type="password"
                        id="confirm"
                        placeholder=" "
                        autoComplete="new-password"
                        value={confirm}
                        onChange={(event) => setConfirm(event.target.value)}
                        aria-invalid={Boolean(errors.confirm)}
                      />
                      <label htmlFor="confirm">Confirmar senha</label>
                      <Lock className="icon" size={16} />
                      {errors.confirm && <div className="field-error">{errors.confirm}</div>}
                    </div>
                  )}

                  <div className="row-helpers">
                    <label><input type="checkbox" defaultChecked /> Manter conectado</label>
                    <a href="#login">Esqueci a senha</a>
                  </div>

                  {status && <div className="form-status">{status}</div>}

                  <button
                    ref={buttonRef}
                    type="submit"
                    className="submit"
                    id="submitBtn"
                    onClick={createRipple}
                    disabled={busy || loading}
                  >
                    <span>{busy ? 'Processando...' : isRegister ? 'Criar conta' : 'Entrar na conta'}</span>
                    <ArrowRight size={14} />
                  </button>

                  <div className="divider">Ou continue com</div>
                  <div className="oauth">
                    <button type="button"><GoogleIcon /> Google</button>
                    <button type="button"><AppleIcon /> Apple</button>
                  </div>

                  <p className="signup-line">
                    {isRegister ? 'Já tem conta?' : 'Não tem conta?'}{' '}
                    <button type="button" onClick={() => switchMode(isRegister ? 'login' : 'register')}>
                      {isRegister ? 'Entrar agora' : 'Cadastre-se grátis'}
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
