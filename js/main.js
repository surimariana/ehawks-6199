/* =========================================================
   E-HAWKS 6199 · Interacciones y animaciones
   ========================================================= */

/* ---------- EDITA AQUÍ los datos de contacto del equipo ---------- */
const CONTACTO = {
  email: '',      // ej. 'equipo@dominio.com'
  instagram: 'https://www.instagram.com/ehawks.6199/',
  facebook: 'https://www.facebook.com/ehawksual',
};

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Pantalla de carga ---------- */
  const preloader = $('.preloader');
  let loaded = false;
  const finishLoading = () => {
    if (loaded) return;
    loaded = true;
    root.classList.add('is-loaded');
    if (preloader) setTimeout(() => preloader.remove(), 900);
  };
  if (document.readyState === 'complete') setTimeout(finishLoading, 200);
  else window.addEventListener('load', () => setTimeout(finishLoading, 250));
  setTimeout(finishLoading, 2500); // nunca bloquear más de 2.5 s

  /* ---------- Datos de contacto ---------- */
  $$('[data-contact]').forEach((link) => {
    const key = link.dataset.contact;
    const value = CONTACTO[key];
    if (!value) { // aún sin configurar: no saltar al inicio de la página
      link.addEventListener('click', (e) => e.preventDefault());
      return;
    }
    link.href = key === 'email' ? `mailto:${value}` : value;
    const text = $('[data-contact-text]', link);
    if (text && key === 'email') text.textContent = value;
  });

  /* ---------- Año del footer ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Menú móvil ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('.nav');
  const setNav = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  };
  toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setNav(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 1081px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });

  /* ---------- Scroll: header, barra de progreso, parallax, línea de tiempo ---------- */
  const header = $('.header');
  const progress = $('.scroll-progress');
  const toTop = $('.to-top');
  const heroBg = $('.hero__bg');
  const steps = $('.steps');
  const stepItems = $$('.step');

  const updateSteps = () => {
    if (!steps) return;
    const vh = window.innerHeight;
    const trigger = vh * 0.6;
    const rect = steps.getBoundingClientRect();
    const p = Math.min(Math.max((trigger - rect.top - 28) / Math.max(rect.height - 88, 1), 0), 1);
    steps.style.setProperty('--progress', p.toFixed(4));
    stepItems.forEach((step) => {
      const num = $('.step__num', step).getBoundingClientRect();
      step.classList.toggle('is-active', num.top + num.height / 2 < trigger);
    });
  };

  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    toTop.classList.toggle('is-visible', y > 700);
    if (heroBg && !reduceMotion && y < window.innerHeight * 1.2) {
      heroBg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    }
    updateSteps();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Enlace activo del menú ---------- */
  const links = $$('.nav__link');
  const sections = links
    .map((l) => $(l.getAttribute('href')))
    .filter(Boolean);
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => activeObserver.observe(s));

  /* ---------- Aparición al hacer scroll ---------- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('is-visible');
      obs.unobserve(el);
      // Al terminar, se liberan los estilos para que los hover de cada tarjeta funcionen
      const cleanup = (e) => {
        if (e && (e.target !== el || e.propertyName !== 'opacity')) return;
        el.removeEventListener('transitionend', cleanup);
        el.removeAttribute('data-reveal');
        el.classList.remove('is-visible');
        el.style.removeProperty('--d');
      };
      el.addEventListener('transitionend', cleanup);
      setTimeout(cleanup, 2500);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('[data-reveal]').forEach((el) => revealObserver.observe(el));

  /* ---------- Contadores ---------- */
  const counters = $$('[data-count]');
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target; return; }
    const duration = target > 100 ? 2200 : 1600;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!reduceMotion) counters.forEach((el) => { el.textContent = '0'; });
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countObserver.observe(el));

  /* ---------- Brillo que sigue al cursor en tarjetas ---------- */
  if (finePointer) {
    $$('.spot').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Hero: logo que sigue al mouse ---------- */
  const hero = $('.hero');
  const logoWrap = $('.hero__logo-wrap');
  if (hero && logoWrap && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      logoWrap.style.transform = `translate3d(${x * -24}px, ${y * -18}px, 0) rotateY(${x * 10}deg) rotateX(${y * -8}deg)`;
    });
    hero.addEventListener('pointerleave', () => { logoWrap.style.transform = ''; });
  }

  /* ---------- Hero: líneas topográficas animadas ---------- */
  const canvas = $('.hero__topo');
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, t = 0, raf = 0, running = false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawField = (cx, cy, rings, seed, base) => {
      const segments = 110;
      for (let i = 0; i < rings; i++) {
        const r0 = base * 0.05 + i * base * 0.046;
        ctx.beginPath();
        for (let k = 0; k <= segments; k++) {
          const a = (k / segments) * Math.PI * 2;
          const n = 1
            + 0.10 * Math.sin(3 * a + t * 0.35 + i * 0.45 + seed)
            + 0.06 * Math.sin(5 * a - t * 0.25 + i * 0.8 + seed)
            + 0.035 * Math.sin(8 * a + t * 0.5 + i * 0.3);
          const x = cx + Math.cos(a) * r0 * n;
          const y = cy + Math.sin(a) * r0 * n * 0.82;
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        const strong = i % 4 === 0;
        ctx.strokeStyle = strong ? 'rgba(61, 220, 126, 0.22)' : 'rgba(23, 179, 90, 0.10)';
        ctx.lineWidth = strong ? 1.3 : 1;
        ctx.stroke();
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const base = Math.max(Math.min(w, h), 420);
      const mobile = w < 900;
      drawField(mobile ? w * 0.5 : w * 0.78, mobile ? h * 0.22 : h * 0.45, 16, 0, base);
      drawField(w * 0.05, h * 1.02, 12, 2.3, base);
    };

    const loop = () => {
      t += 0.012;
      draw();
      raf = requestAnimationFrame(loop);
    };
    const start = () => { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    resize(); draw();
    window.addEventListener('resize', () => { resize(); draw(); });
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ---------- Galería (lightbox) ---------- */
  const lightbox = $('.lightbox');
  const lbImg = $('.lightbox__img');
  const lbCap = $('.lightbox__cap');
  const items = $$('[data-lightbox]');
  let current = 0;
  let lastFocus = null;

  const show = (index) => {
    current = (index + items.length) % items.length;
    const item = items[current];
    const img = $('img', item);
    lbImg.src = item.getAttribute('href');
    lbImg.alt = img ? img.alt : '';
    const cap = $('.g-item__cap', item);
    lbCap.textContent = cap ? cap.textContent : '';
  };
  const openLb = (index) => {
    lastFocus = document.activeElement;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    $('.lb-close', lightbox).focus();
  };
  const closeLb = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };

  items.forEach((item, i) => item.addEventListener('click', (e) => { e.preventDefault(); openLb(i); }));
  $('.lb-close', lightbox).addEventListener('click', closeLb);
  $('.lb-prev', lightbox).addEventListener('click', () => show(current - 1));
  $('.lb-next', lightbox).addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
    if (e.key === 'Tab') { // mantener el foco dentro del visor
      const focusables = $$('button', lightbox);
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  let touchX = null;
  lightbox.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  /* ---------- Enlaces que preseleccionan el motivo del formulario ---------- */
  const motivo = $('#f-motivo');
  $$('[data-motivo]').forEach((link) => {
    link.addEventListener('click', () => { if (motivo) motivo.value = link.dataset.motivo; });
  });

  /* ---------- Formulario de contacto (abre el correo del usuario) ---------- */
  const form = $('#contact-form');
  const status = $('.form__status', form);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.classList.remove('is-error');
    let valid = true;
    $$('input, textarea', form).forEach((field) => {
      const ok = field.checkValidity();
      field.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok && valid) { field.focus(); valid = false; }
    });
    if (!valid) {
      status.textContent = 'Revisa los campos marcados.';
      status.classList.add('is-error');
      return;
    }
    if (!CONTACTO.email) {
      status.textContent = 'Falta configurar el correo del equipo en js/main.js.';
      status.classList.add('is-error');
      return;
    }
    const data = new FormData(form);
    const subject = `[${data.get('motivo')}] Mensaje de ${data.get('nombre')}`;
    const body = `${data.get('mensaje')}\n\n— ${data.get('nombre')}\n${data.get('correo')}`;
    window.location.href = `mailto:${CONTACTO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = '¡Gracias! Se abrirá tu aplicación de correo para enviar el mensaje.';
    form.reset();
  });
  $$('input, textarea', form).forEach((field) => {
    field.addEventListener('input', () => field.closest('.field').classList.remove('is-invalid'));
  });
})();
