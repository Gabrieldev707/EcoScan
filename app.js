/* =========================================================
   EcoScan — v2 interactions
   ========================================================= */
gsap.registerPlugin(ScrollTrigger);

/* ---------- Lucide ---------- */
function renderIcons() {
  if (window.lucide && window.lucide.createIcons) window.lucide.createIcons();
}
renderIcons();

/* ---------- Custom cursor with lerp ---------- */
(function customCursor() {
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  if (matchMedia('(hover: none)').matches) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let dx = mx, dy = my;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  const tick = () => {
    dx += (mx - dx) * 0.35;
    dy += (my - dy) * 0.35;
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    dot.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  const setHover = (h) => {
    dot.classList.toggle('hover', h);
    ring.style.opacity = h ? '0' : '0.5';
  };
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .sb-item, .feature, .metric, .team, .scan, input, .field')) setHover(true);
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .sb-item, .feature, .metric, .team, .scan, input, .field')) setHover(false);
  });
})();

/* ---------- Scroll progress bar ---------- */
(function scrollProgress() {
  const el = document.getElementById('scrollProgress');
  if (!el) return;
  const tick = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const p = max > 0 ? (window.scrollY / max) * 100 : 0;
    el.style.width = p + '%';
  };
  window.addEventListener('scroll', tick, { passive: true });
  tick();
})();

/* ---------- HERO: split text ---------- */
(function splitHeroTitle() {
  const el = document.getElementById('heroTitle');
  if (!el) return;
  const text = 'EcoScan';
  el.innerHTML = '';
  text.split('').forEach((ch) => {
    const s = document.createElement('span');
    s.className = 'ltr';
    s.textContent = ch;
    s.style.opacity = '0';
    s.style.transform = 'translateY(80px)';
    el.appendChild(s);
  });
})();

/* ---------- HERO: video autoplay + scroll-scrub takeover ---------- */
(function heroVideo() {
  const video = document.getElementById('heroVideo');
  const wrap = document.querySelector('.hero-wrap');
  if (!video || !wrap) return;

  let scrollControl = false;
  let videoReady = false;

  const ensurePlay = () => {
    const promise = video.play();
    if (promise && promise.catch) promise.catch(() => {});
  };

  const onReady = () => { videoReady = true; ensurePlay(); };
  if (video.readyState >= 2) onReady();
  else video.addEventListener('loadeddata', onReady, { once: true });

  // Belt-and-suspenders autoplay
  document.addEventListener('DOMContentLoaded', ensurePlay, { once: true });
  ensurePlay();

  const letters = document.querySelectorAll('#heroTitle .ltr');
  const eyebrow = document.getElementById('heroEyebrow');
  const sub = document.getElementById('heroSub');
  const cta = document.getElementById('heroCta');
  const badges = document.getElementById('heroBadges');
  const underline = document.getElementById('heroUnderline');

  const tl = gsap.timeline({ paused: true });
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
    .to(letters, { y: 0, opacity: 1, duration: 0.7, stagger: 0.06, ease: 'power3.out' }, 0.05)
    .to(underline, { scaleX: 1, duration: 0.9, ease: 'power3.out' }, 0.35)
    .to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .to(cta, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
    .to(badges, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

  ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.5,
    onUpdate: (self) => {
      // Once user has scrolled past the very top, take over the video
      if (self.progress > 0.005 && !scrollControl) {
        scrollControl = true;
        video.pause();
        video.loop = false;
      }
      if (scrollControl && videoReady && video.duration && isFinite(video.duration)) {
        const t = Math.max(0, Math.min(0.999, self.progress)) * video.duration;
        try { video.currentTime = t; } catch (e) {}
      }
      // Entry timeline kicks in after ~55% scroll
      const p = self.progress;
      const tlP = p < 0.55 ? 0 : Math.min(1, (p - 0.55) / 0.35);
      tl.progress(tlP);
    },
  });
})();

/* ---------- HERO: magnetic CTA ---------- */
(function magnetic() {
  const btn = document.getElementById('magneticBtn');
  if (!btn) return;
  if (matchMedia('(hover: none)').matches) return;
  let rect = null;
  const measure = () => (rect = btn.getBoundingClientRect());
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });

  btn.addEventListener('mousemove', (e) => {
    if (!rect) measure();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.28;
    const dy = (e.clientY - cy) * 0.4;
    gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  });
})();

/* ---------- LOGIN: ripple + shake + particles ---------- */
(function loginInteractions() {
  const form = document.getElementById('loginForm');
  const card = document.getElementById('loginCard');
  const btn = document.getElementById('submitBtn');
  if (!form || !btn) return;

  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size / 2) + 'px';
    r.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pwd = document.getElementById('password').value;
    if (!email || !pwd) {
      gsap.to(card, {
        x: '+=16',
        duration: 0.07,
        repeat: 7,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => gsap.set(card, { x: 0 })
      });
      return;
    }
    spawnParticles(20);
    btn.querySelector('span').textContent = 'Bem-vinda!';
    setTimeout(() => {
      document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    }, 700);
  });

  function spawnParticles(n) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const left = Math.random() * 100;
      const dx = (Math.random() - 0.5) * 240 + 'px';
      const dur = 2 + Math.random() * 2.2;
      const delay = Math.random() * 0.7;
      const size = 4 + Math.random() * 8;
      p.style.left = left + 'vw';
      p.style.width = p.style.height = size + 'px';
      p.style.setProperty('--dx', dx);
      p.style.animation = `floatUp ${dur}s ${delay}s ease-out forwards`;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), (dur + delay) * 1000 + 100);
    }
  }
})();

/* ---------- Sidebar / segmented controls ---------- */
(function sidebar() {
  document.querySelectorAll('.sb-item').forEach((it) => {
    it.addEventListener('click', () => {
      document.querySelectorAll('.sb-item').forEach((x) => x.classList.remove('active'));
      it.classList.add('active');
    });
  });
  document.querySelectorAll('.card-head .seg button').forEach((b) => {
    b.addEventListener('click', () => {
      b.parentElement.querySelectorAll('button').forEach((x) => x.classList.remove('on'));
      b.classList.add('on');
    });
  });
})();

/* ---------- Dashboard: animate bars + progress + counts ---------- */
(function dashboardAnim() {
  const bars = document.querySelectorAll('#chart .b');
  if (bars.length) {
    ScrollTrigger.create({
      trigger: '#chart',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        bars.forEach((b, i) => {
          gsap.to(b, {
            height: b.dataset.h,
            duration: 1,
            delay: i * 0.07,
            ease: 'power3.out',
          });
        });
      },
    });
  }

  const fill = document.querySelector('.progress-card .fill');
  if (fill) {
    ScrollTrigger.create({
      trigger: '.progress-card',
      start: 'top 80%',
      once: true,
      onEnter: () => {
        gsap.to(fill, { width: fill.dataset.target, duration: 1.3, ease: 'power3.out' });
      },
    });
  }

  // Metric numbers count-up — preserve <span class="u"> units
  document.querySelectorAll('.metric .num').forEach((el) => {
    const u = el.querySelector('.u');
    const unit = u ? u.outerHTML : '';
    const txt = (u ? el.firstChild.textContent : el.textContent).trim();
    const match = txt.match(/([0-9.,]+)/);
    if (!match) return;
    const numStr = match[1];
    const hasComma = numStr.includes(',');
    const hasDot = numStr.includes('.');
    const rawNum = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
    if (!isFinite(rawNum)) return;
    const format = (v) => {
      if (hasComma) return v.toFixed(1).replace('.', ',');
      if (hasDot) return Math.round(v).toLocaleString('pt-BR');
      return Math.round(v).toString();
    };
    el.innerHTML = '0' + unit;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, {
          v: rawNum,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => { el.innerHTML = format(o.v) + unit; },
        });
      },
    });
  });
})();

/* ---------- Stat numbers (sobre) — count-up ---------- */
(function statsCountUp() {
  document.querySelectorAll('.stat .num').forEach((el) => {
    const small = el.querySelector('.small');
    const suffixHTML = small ? small.outerHTML : '';
    const txt = (small ? el.firstChild.textContent : el.textContent).trim();
    const m = txt.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (!m) return;
    const orig = txt;
    const raw = parseFloat(m[1].replace(',', '.'));
    if (!isFinite(raw)) return;
    const prefix = orig.substring(0, orig.indexOf(m[1]));
    el.innerHTML = prefix + '0' + suffixHTML;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, {
          v: raw,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            const v = m[1].includes(',') ? o.v.toFixed(1).replace('.', ',') : Math.round(o.v).toString();
            el.innerHTML = prefix + v + suffixHTML;
          },
        });
      },
    });
  });

  // Team meta numbers count-up
  document.querySelectorAll('.team .meta .num').forEach((el) => {
    const raw = parseInt(el.textContent, 10);
    if (!isFinite(raw)) return;
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, { v: raw, duration: 1.2, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } });
      },
    });
  });
})();

/* ---------- IntersectionObserver — .reveal ---------- */
(function reveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // small stagger within a parent
        const idx = [...entry.target.parentElement.children].indexOf(entry.target);
        const delay = (idx % 6) * 60;
        setTimeout(() => entry.target.classList.add('in'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
})();

/* ---------- GUIA DE DESCARTE — Tabs + photo card ---------- */
(function guiaDescarte() {
  const BINS = [
    {
      id: 'azul', label: 'Azul', category: 'PAPEL', sub: 'Papel e Papelão',
      color: '#3b82f6', rgb: '59,130,246', accent: 'PAPEL', particleShape: 'rect',
      photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80',
      accepts: ['Jornal','Revista','Caderno','Caixa de papelão','Folhas de papel','Papel craft','Envelope','Caixa de cereal','Papel de embrulho','Caixa de sapato'],
      tip: 'Amasse o papelão para economizar espaço, mas não rasgue em pedaços muito pequenos — dificulta o processo de reciclagem nas usinas.',
      rejects: ['Papel higiênico','Guardanapo usado','Papel molhado','Papel carbono','Papel plastificado','Papel encerado']
    },
    {
      id: 'vermelho', label: 'Vermelho', category: 'PLÁSTICO', sub: 'Embalagens Plásticas',
      color: '#ef4444', rgb: '239,68,68', accent: 'PLÁSTICO', particleShape: 'circle',
      photo: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=900&q=80',
      accepts: ['Garrafa PET','Pote de iogurte','Embalagem de shampoo','Caixinha longa vida','Filme plástico','Pote de margarina','Embalagem de detergente','Tampa plástica','Sacola plástica','Canudo'],
      tip: 'Lave as embalagens antes de descartar. Plástico com resíduo de alimento contamina o lote inteiro e impede a reciclagem de tudo.',
      rejects: ['Fralda descartável','Esponja','Celofane','Talheres sujos','Mangueira velha','Plástico com isopor']
    },
    {
      id: 'amarelo', label: 'Amarelo', category: 'METAL', sub: 'Metais e Alumínio',
      color: '#eab308', rgb: '234,179,8', accent: 'METAL', particleShape: 'hex',
      photo: 'https://images.unsplash.com/photo-1567177662154-dfeb4c93b6ae?w=900&q=80',
      accepts: ['Lata de alumínio','Lata de conserva','Tampinha de garrafa','Folha de alumínio','Panela velha','Arame','Clipe de papel','Lata de tinta vazia','Prego','Parafuso'],
      tip: 'Latas de alumínio são 100% recicláveis infinitas vezes sem perda de qualidade. Amassar economiza espaço e facilita o transporte.',
      rejects: ['Pilha','Bateria','Lâmpada','Espelho','Metal com tinta tóxica','Eletrônico']
    },
    {
      id: 'verde', label: 'Verde', category: 'VIDRO', sub: 'Vidros e Frascos',
      color: '#22c55e', rgb: '34,197,94', accent: 'VIDRO', particleShape: 'diamond',
      photo: 'https://images.unsplash.com/photo-1550782674-fa597bc8d32d?w=900&q=80',
      accepts: ['Garrafa de vidro','Pote de conserva','Frasco de perfume','Vidro de remédio','Copo de vidro','Jarra','Vidro de maionese','Frasco de molho'],
      tip: 'Vidro quebrado pode ser reciclado — embale em papel antes de descartar para evitar acidentes. Nunca misture vidro temperado com vidro comum.',
      rejects: ['Espelho','Lâmpada','Vidro temperado (box)','Cristal','Cerâmica','Porcelana','Ampola médica']
    },
    {
      id: 'cinza', label: 'Cinza', category: 'REJEITO', sub: 'Não Reciclável',
      color: '#6b7280', rgb: '107,114,128', accent: 'REJEITO', particleShape: 'square',
      photo: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=900&q=80',
      accepts: ['Papel higiênico','Guardanapo usado','Fralda descartável','Absorvente','Toco de cigarro','Chiclete','Cotonete','Esponja usada','Papel carbono','Cerâmica quebrada'],
      tip: 'Rejeito é o que ainda não tem como ser reciclado. Mas cuidado — pilhas, remédios, óleo e eletrônicos têm descarte especial em ecopontos.',
      rejects: ['Pilha (ecoponto)','Remédio vencido (farmácia)','Óleo de cozinha (ecoponto)','Eletrônico (loja)','Lâmpada (ecoponto)']
    }
  ];

  const guia = document.getElementById('guia');
  if (!guia) return;

  const tabsEl = document.getElementById('guiaTabs');
  const photoCard = document.getElementById('guiaPhotoCard');
  const photoImg = document.getElementById('guiaPhoto');
  const photoWash = document.getElementById('guiaPhotoWash');
  const photoCat = document.getElementById('guiaPhotoCat');
  const photoSub = document.getElementById('guiaPhotoSub');
  const particlesEl = document.getElementById('guiaParticles');
  const infoPanel = document.getElementById('guiaInfoPanel');
  const titleAccent = document.getElementById('guiaTitleAccent');

  if (!tabsEl) return;

  /* ===== Scoped theme apply ===== */
  function applyTheme(b) {
    guia.style.setProperty('--guia-cat', b.rgb);
    guia.style.setProperty('--guia-cat-hex', b.color);
  }

  /* ===== Build tabs ===== */
  BINS.forEach((b, i) => {
    const btn = document.createElement('button');
    btn.className = 'guia-tab';
    btn.dataset.idx = i;
    btn.style.setProperty('--tab-color', b.color);
    btn.innerHTML = `
      <span class="dot"></span>
      <span class="nm">${b.label}</span>
      <span class="sub">— ${b.sub}</span>
    `;
    btn.addEventListener('click', () => selectBin(i));
    tabsEl.appendChild(btn);
  });

  /* ===== Photo update ===== */
  function updatePhoto(b, animate) {
    if (animate) {
      photoImg.classList.add('hidden');
      setTimeout(() => {
        photoImg.src = b.photo;
        photoImg.onload = () => photoImg.classList.remove('hidden');
        photoImg.onerror = () => photoImg.classList.remove('hidden');
      }, 240);
    } else {
      photoImg.src = b.photo;
      photoImg.onerror = () => {};
    }
    photoWash.style.background = b.color;
    photoCat.textContent = b.category;
    photoCat.style.color = b.color;
    photoSub.textContent = b.sub;
    photoCard.style.borderColor = `rgba(${b.rgb}, 0.3)`;
    photoCard.style.boxShadow = `0 0 60px rgba(${b.rgb}, 0.15)`;
  }

  /* ===== Info panel build ===== */
  function buildInfo(b) {
    infoPanel.innerHTML = `
      <div class="guia-info-accepts">
        <div class="guia-card-label">O que pode ir aqui</div>
        <div class="guia-items">
          ${b.accepts.map(it => `<span class="guia-item">${it}</span>`).join('')}
        </div>
      </div>
      <div class="guia-info-tip">
        <div class="guia-card-label">Dica de preparo</div>
        <p class="guia-tip-text">${b.tip}</p>
      </div>
      <div class="guia-info-reject">
        <div class="guia-card-label reject">Nunca vai aqui</div>
        <div class="guia-items">
          ${b.rejects.map(it => `<span class="guia-item reject">${it}</span>`).join('')}
        </div>
      </div>
    `;
  }

  /* ===== Header accent text ===== */
  function updateHeader(b) {
    if (titleAccent) {
      titleAccent.textContent = b.accent;
      titleAccent.style.color = b.color;
    }
  }

  /* ===== Particles inside photo ===== */
  function spawnParticles(b) {
    particlesEl.innerHTML = '';
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'guia-particle';
      const size = 4 + Math.random() * 7;
      let shapeCSS = '';
      switch (b.particleShape) {
        case 'rect':    shapeCSS = `border-radius:2px;width:${(size * 1.6).toFixed(1)}px;height:${(size * 0.8).toFixed(1)}px`; break;
        case 'circle':  shapeCSS = `border-radius:50%;width:${size}px;height:${size}px`; break;
        case 'hex':     shapeCSS = `width:${size}px;height:${size}px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)`; break;
        case 'diamond': shapeCSS = `width:${size}px;height:${size}px;transform:rotate(45deg)`; break;
        case 'square':  shapeCSS = `width:${size}px;height:${size}px`; break;
      }
      p.style.cssText = `
        left:${(8 + Math.random() * 84).toFixed(1)}%;
        background:rgba(${b.rgb}, 0.7);
        ${shapeCSS};
        animation-duration:${(1.6 + Math.random() * 1.6).toFixed(2)}s;
        animation-delay:${(Math.random() * 1.2).toFixed(2)}s;
      `;
      particlesEl.appendChild(p);
    }
  }

  /* ===== Select ===== */
  let isAnimating = false;
  let currentIdx = -1;
  function selectBin(idx, initial) {
    if (isAnimating && !initial) return;
    if (idx === currentIdx && !initial) return;
    isAnimating = true;
    currentIdx = idx;
    const b = BINS[idx];

    [...tabsEl.children].forEach((el, i) => el.classList.toggle('active', i === idx));
    applyTheme(b);
    updatePhoto(b, !initial);
    buildInfo(b);
    updateHeader(b);
    spawnParticles(b);

    setTimeout(() => { isAnimating = false; }, 520);
  }

  /* ===== Init — open first bin, then re-trigger when section enters view ===== */
  applyTheme(BINS[0]);
  selectBin(0, true);

  if ('IntersectionObserver' in window) {
    let opened = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !opened) {
          opened = true;
          // Replay particles + slide-in cards when section enters view
          spawnParticles(BINS[currentIdx >= 0 ? currentIdx : 0]);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    io.observe(guia);
  }
})();

/* ---------- Re-render lucide as DOM settles ---------- */
setTimeout(renderIcons, 60);
setTimeout(renderIcons, 400);
