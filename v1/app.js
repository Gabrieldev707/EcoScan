/* =========================================================
   EcoScan — Interactions
   ========================================================= */
gsap.registerPlugin(ScrollTrigger);

/* ---------- Lucide icons (initial pass) ---------- */
function renderIcons() {
  if (window.lucide && window.lucide.createIcons) {
    window.lucide.createIcons();
  }
}
renderIcons();

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
    s.style.transform = 'translateY(60px)';
    el.appendChild(s);
  });
})();

/* ---------- HERO: scroll-scrub video + content reveal ---------- */
(function heroScroll() {
  const video = document.getElementById('heroVideo');
  const wrap = document.querySelector('.hero-wrap');
  if (!video || !wrap) return;

  let videoReady = false;
  const onReady = () => { videoReady = true; };
  if (video.readyState >= 1) videoReady = true;
  else video.addEventListener('loadedmetadata', onReady, { once: true });

  // Try to start playback briefly so the first frame paints,
  // then pause — we control time via scroll.
  video.play().catch(() => {}).finally(() => video.pause());

  const letters = document.querySelectorAll('#heroTitle .ltr');
  const eyebrow = document.getElementById('heroEyebrow');
  const sub = document.getElementById('heroSub');
  const cta = document.getElementById('heroCta');
  const badges = document.getElementById('heroBadges');

  const tl = gsap.timeline({ paused: true });
  tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0)
    .to(letters, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'power3.out' }, 0.1)
    .to(sub, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.2')
    .to(cta, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3')
    .to(badges, { opacity: 1, x: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

  ScrollTrigger.create({
    trigger: wrap,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 0.4,
    onUpdate: (self) => {
      // 1) Scrub video
      if (videoReady && video.duration && isFinite(video.duration)) {
        const t = Math.max(0, Math.min(1, self.progress)) * video.duration;
        try { video.currentTime = t; } catch (e) {}
      }
      // 2) After ~60% scroll, play the entry timeline
      const p = self.progress;
      const tlP = p < 0.6 ? 0 : Math.min(1, (p - 0.6) / 0.35);
      tl.progress(tlP);
    },
  });
})();

/* ---------- HERO: magnetic CTA ---------- */
(function magnetic() {
  const btn = document.getElementById('magneticBtn');
  if (!btn) return;
  let rect = null;
  const measure = () => (rect = btn.getBoundingClientRect());
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('scroll', measure, { passive: true });

  btn.addEventListener('mousemove', (e) => {
    if (!rect) measure();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.35;
    gsap.to(btn, { x: dx, y: dy, duration: 0.4, ease: 'power3.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  });
})();

/* ---------- LOGIN: ripple + shake + particles ---------- */
(function loginInteractions() {
  const form = document.getElementById('loginForm');
  const card = document.getElementById('loginCard');
  const btn = document.getElementById('submitBtn');
  if (!form || !btn) return;

  // Ripple
  btn.addEventListener('click', (e) => {
    const rect = btn.getBoundingClientRect();
    const r = document.createElement('span');
    r.className = 'ripple';
    const size = Math.max(rect.width, rect.height);
    r.style.width = r.style.height = size + 'px';
    r.style.left = (e.clientX - rect.left - size / 2) + 'px';
    r.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const pwd = document.getElementById('password').value;
    if (!email || !pwd) {
      gsap.to(card, {
        x: '+=14',
        duration: 0.07,
        repeat: 7,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => gsap.set(card, { x: 0 })
      });
      return;
    }
    // Success → green particles
    spawnParticles(20);
    btn.querySelector('span').textContent = 'Bem-vinda!';
    setTimeout(() => {
      document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth' });
    }, 800);
  });

  function spawnParticles(n) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const left = Math.random() * 100;
      const dx = (Math.random() - 0.5) * 200 + 'px';
      const dur = 2 + Math.random() * 2;
      const delay = Math.random() * 0.6;
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

/* ---------- Sidebar: active state toggle ---------- */
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

/* ---------- Dashboard: animate bars + progress on view ---------- */
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
            duration: 0.9,
            delay: i * 0.06,
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
        gsap.to(fill, { width: fill.dataset.target, duration: 1.2, ease: 'power3.out' });
      },
    });
  }

  // Metric numbers — subtle count-up
  document.querySelectorAll('.metric .num').forEach((el) => {
    const txt = el.textContent;
    const match = txt.match(/([0-9.,]+)(.*)/);
    if (!match) return;
    const rawNum = parseFloat(match[1].replace(/\./g, '').replace(',', '.'));
    const suffix = match[2] || '';
    if (!isFinite(rawNum)) return;
    const isDecimal = match[1].includes(',');
    const hasThousand = match[1].includes('.');
    el.textContent = '0' + suffix;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, {
          v: rawNum,
          duration: 1.3,
          ease: 'power2.out',
          onUpdate: () => {
            let s;
            if (isDecimal) {
              s = o.v.toFixed(1).replace('.', ',');
            } else if (hasThousand) {
              s = Math.round(o.v).toLocaleString('pt-BR');
            } else {
              s = Math.round(o.v).toString();
            }
            el.textContent = s + suffix;
          },
        });
      },
    });
  });
})();

/* ---------- About / Team: stagger entry ---------- */
(function aboutStagger() {
  const features = document.querySelectorAll('.feature.anim');
  const stats = document.querySelectorAll('.stat.anim');
  const team = document.querySelectorAll('.team.anim');

  [features, stats, team].forEach((nodes) => {
    if (!nodes.length) return;
    gsap.set(nodes, { y: 40, opacity: 0 });
    ScrollTrigger.create({
      trigger: nodes[0],
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(nodes, {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        });
      },
    });
  });

  // Stat numbers count-up
  document.querySelectorAll('.stat .num').forEach((el) => {
    const orig = el.textContent;
    // Skip non-numeric like "<4%"
    const match = orig.match(/([0-9]+(?:[.,][0-9]+)?)/);
    if (!match) return;
    const raw = parseFloat(match[1].replace(',', '.'));
    if (!isFinite(raw)) return;
    el.dataset.orig = orig;
    el.textContent = orig.replace(match[1], '0');
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        const o = { v: 0 };
        gsap.to(o, {
          v: raw,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            let s;
            if (match[1].includes(',')) s = o.v.toFixed(1).replace('.', ',');
            else s = Math.round(o.v).toString();
            el.textContent = orig.replace(match[1], s);
          },
        });
      },
    });
  });
})();

/* ---------- Section titles fade-in ---------- */
gsap.utils.toArray('.section-title, .section-sub, .section-tag').forEach((el) => {
  gsap.set(el, { y: 24, opacity: 0 });
  ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: () => gsap.to(el, { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out' }),
  });
});

/* ---------- Re-render lucide once everything's wired up ---------- */
setTimeout(renderIcons, 50);
setTimeout(renderIcons, 400);
