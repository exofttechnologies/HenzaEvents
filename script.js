/**
 * HENZA EVENTS v2 — script.js
 * 1. Hamburger menu toggle
 * 2. Smooth scroll with navbar offset
 * 3. Active nav link (IntersectionObserver)
 * 4. Navbar shrink on scroll
 * 5. Scroll reveal animations
 * 6. Stats counter animation
 * 7. Contact form handler
 * 8. Scroll progress bar
 * 9. Typewriter effect
 * 10. Testimonial infinite scroll (duplication)
 * 11. Hero carousel + bg sync
 */
document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 — HAMBURGER ─────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () =>
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu()
  );
  mobileClose.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-link').forEach(l => l.addEventListener('click', closeMenu));

  /* 2 — SMOOTH SCROLL ─────────────────────── */
  const NAV_H = 68;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - NAV_H,
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  /* 3 — ACTIVE NAV LINK ───────────────────── */
  const sections = document.querySelectorAll('section[id], #stats');
  const navLinks = document.querySelectorAll('.nav-link');

  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${e.target.id}`);
        });
      }
    });
  }, { threshold: 0.4, rootMargin: `-${NAV_H}px 0px 0px 0px` }).observe
    && sections.forEach(s =>
      new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          navLinks.forEach(l =>
            l.classList.toggle('active', l.getAttribute('href') === `#${s.id}`)
          );
        }
      }, { threshold: 0.4, rootMargin: `-${NAV_H}px 0px 0px 0px` }).observe(s)
    );

  /* 4 — NAVBAR SHRINK ─────────────────────── */
  const navbar = document.getElementById('navbar');
  const progressBar = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    // Scroll progress
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }, { passive: true });

  /* 5 — SCROLL REVEAL ─────────────────────── */
  if (!reduceMotion) {
    const sel = [
      '.eyebrow','.section-hd h2','.section-hd .sub',
      '.svc-card','.step','.test-card','.cinfo-row',
      '.about-images','.about-text','.stat-item',
      '.check-list li','.feat-list li','.contact-form-wrap',
      '.contact-info'
    ].join(',');

    document.querySelectorAll(sel).forEach(el => {
      if (el.closest('#home')) return;
      el.classList.add('reveal-init');
      // Stagger siblings
      const idx = Array.from(el.parentElement?.children || []).indexOf(el);
      if (idx > 0 && idx < 5) el.style.transitionDelay = `${idx * 0.12}s`;
    });

    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 }).observe
      && document.querySelectorAll('.reveal-init').forEach(el => {
        new IntersectionObserver((es, o) => {
          if (es[0].isIntersecting) { es[0].target.classList.add('revealed'); o.unobserve(es[0].target); }
        }, { threshold: 0.18 }).observe(el);
      });
  }

  /* 6 — STATS COUNTER ─────────────────────── */
  const statsEl = document.getElementById('stats');
  let counted = false;

  function easeOut(t) { return t * (2 - t); }

  function animate(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    let start = null;
    (function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      el.textContent = Math.round(easeOut(p) * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    })(performance.now());
  }

  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll('.stat-num[data-target]').forEach(el =>
        reduceMotion
          ? (el.textContent = el.dataset.target + (el.dataset.suffix || ''))
          : animate(el)
      );
    }
  }, { threshold: 0.5 }).observe(statsEl);

  /* 7 — CONTACT FORM ──────────────────────── */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const success   = document.getElementById('form-success');
  const nameInp   = document.getElementById('full-name');
  const emailInp  = document.getElementById('email');
  const nameErr   = document.getElementById('name-error');
  const emailErr  = document.getElementById('email-error');

  function fieldErr(f) {
    const v = f.value.trim();
    if (f.required && !v) return 'This field is required.';
    if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
      return 'Please enter a valid email.';
    return '';
  }
  function setErr(inp, el, msg) {
    el.textContent = msg;
    inp.style.borderColor = msg ? '#C0392B' : '#E5E1DA';
  }

  nameInp.addEventListener('blur',  () => setErr(nameInp,  nameErr,  fieldErr(nameInp)));
  emailInp.addEventListener('blur', () => setErr(emailInp, emailErr, fieldErr(emailInp)));
  nameInp.addEventListener('input',  () => { if (nameErr.textContent)  setErr(nameInp,  nameErr,  ''); });
  emailInp.addEventListener('input', () => { if (emailErr.textContent) setErr(emailInp, emailErr, ''); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nE = fieldErr(nameInp), eE = fieldErr(emailInp);
    setErr(nameInp, nameErr, nE);
    setErr(emailInp, emailErr, eE);
    if (nE || eE) return;

    const orig = submitBtn.textContent;
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      success.removeAttribute('hidden');
      form.reset();
      setErr(nameInp, nameErr, '');
      setErr(emailInp, emailErr, '');
      setTimeout(() => {
        submitBtn.textContent = orig;
        submitBtn.disabled = false;
        setTimeout(() => success.setAttribute('hidden', ''), 4000);
      }, 3000);
    }, 1500);
  });

});

/* ─── TESTIMONIAL INFINITE SCROLL ───────────────── */
(function () {
  const track = document.getElementById('tcTrack');
  if (!track) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  // Clone all cards so the CSS animation loops seamlessly at -50%
  Array.from(track.children).forEach(c => track.appendChild(c.cloneNode(true)));
})();

/* ─── HERO CAROUSEL ─────────────────────────── */
(function () {
  const slides    = Array.from(document.querySelectorAll('.hc-slide'));
  const bgLayers  = Array.from(document.querySelectorAll('.hero-bg-layer'));
  const dots      = Array.from(document.querySelectorAll('.hc-dot'));
  const prevBtn   = document.getElementById('hcPrev');
  const nextBtn   = document.getElementById('hcNext');
  const carousel  = document.getElementById('heroCarousel');
  const INTERVAL  = 4500;

  if (!slides.length) return;

  let current  = 0;
  let timer    = null;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function goTo(idx) {
    // -- Carousel slide --
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');

    // -- Background layer --
    if (bgLayers[current]) bgLayers[current].classList.remove('active');

    current = (idx + slides.length) % slides.length;

    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');

    // -- Fade in matching bg layer --
    if (bgLayers[current]) bgLayers[current].classList.add('active');
  }

  function next()  { goTo(current + 1); }
  function prev()  { goTo(current - 1); }

  function startAuto() {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }
  function stopAuto()  { clearInterval(timer); }

  // Init — first slide + first bg layer already have .active in HTML
  startAuto();

  // Buttons
  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  // Dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { goTo(i); startAuto(); });
  });

  // Pause on hover / focus
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin',    stopAuto);
  carousel.addEventListener('focusout',   startAuto);

  // Keyboard left/right inside the carousel
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });
})();
