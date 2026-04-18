/**
 * HENZA EVENTS — script.js (Premium v3)
 * ─────────────────────────────────────
 *  1. Hamburger mobile menu toggle
 *  2. Smooth scroll with navbar offset
 *  3. Active nav link (IntersectionObserver)
 *  4. Navbar — transparent → solid on scroll + shrink
 *  5. Scroll reveal animations (fade + slide up)
 *  6. Stats counter animation (easeOut)
 *  7. Contact form with inline validation
 *  8. Scroll progress bar
 *  9. Testimonial infinite scroll (DOM cloning)
 * 10. Hero carousel + background layer sync
 */

document.addEventListener('DOMContentLoaded', () => {

  /** Respect prefers-reduced-motion */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────
     1. HAMBURGER MENU TOGGLE
  ───────────────────────────────────────────── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const mobileClose = document.getElementById('mobile-close');
  const menuOverlay = document.getElementById('menu-overlay');

  function openMenu() {
    mobileMenu.classList.add('open');
    mobileMenu.removeAttribute('aria-hidden');
    if (menuOverlay) menuOverlay.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (menuOverlay) menuOverlay.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () =>
    mobileMenu.classList.contains('open') ? closeMenu() : openMenu()
  );
  mobileClose.addEventListener('click', closeMenu);
  if (menuOverlay) menuOverlay.addEventListener('click', closeMenu);
  document.querySelectorAll('.mobile-link').forEach(l =>
    l.addEventListener('click', closeMenu)
  );

  /* ─────────────────────────────────────────────
     2. SMOOTH SCROLL — with fixed navbar offset
  ───────────────────────────────────────────── */
  const NAV_H = 70; // matches CSS navbar height

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

  /* ─────────────────────────────────────────────
     3. ACTIVE NAV LINK (IntersectionObserver)
  ───────────────────────────────────────────── */
  const sections = document.querySelectorAll(
    '#home, #about, #services, #why-us, #gallery, #how-it-works, #testimonials, #contact'
  );
  const navLinks = document.querySelectorAll('.nav-link');

  // Map section id → matching nav href
  const idToHref = {
    'home':          '#home',
    'about':         '#about',
    'services':      '#services',
    'why-us':        '#services', // no direct nav link; highlight services
    'gallery':       '#gallery',
    'how-it-works':  '#home',
    'testimonials':  '#testimonials',
    'contact':       '#contact',
  };

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const href = idToHref[e.target.id] || `#${e.target.id}`;
        navLinks.forEach(l =>
          l.classList.toggle('active', l.getAttribute('href') === href)
        );
      }
    });
  }, { threshold: 0.35, rootMargin: `-${NAV_H}px 0px 0px 0px` });

  sections.forEach(s => sectionObserver.observe(s));

  /* ─────────────────────────────────────────────
     4. NAVBAR — transparent → solid + shrink on scroll
  ───────────────────────────────────────────── */
  const navbar      = document.getElementById('navbar');
  const progressBar = document.getElementById('scroll-progress');

  /** Update navbar state and scroll progress bar on every scroll tick */
  function onScroll() {
    // Solid/blur when past hero fold
    navbar.classList.toggle('scrolled', window.scrollY > 80);

    // Scroll progress
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
    if (progressBar) progressBar.style.width = pct + '%';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* ─────────────────────────────────────────────
     5. SCROLL REVEAL — fade + slide up
  ───────────────────────────────────────────── */
  if (!reduceMotion) {
    /** Elements to animate on scroll */
    const revealSel = [
      '.eyebrow', '.section-hd h2', '.section-hd .sub',
      '.svc-card', '.step', '.test-card', '.cinfo-row',
      '.about-images', '.about-text', '.stat-item',
      '.check-list li', '.why-list li', '.contact-form-wrap', '.contact-info',
      '.gallery-item', '.why-images', '.why-text'
    ].join(',');

    document.querySelectorAll(revealSel).forEach(el => {
      if (el.closest('#home')) return; // skip hero — it has its own animation
      el.classList.add('reveal-init');

      // Stagger siblings by position index
      const idx = Array.from(el.parentElement?.children || []).indexOf(el);
      if (idx > 0 && idx < 8) el.style.transitionDelay = `${idx * 0.10}s`;
    });

    /** Trigger reveal when element enters viewport */
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal-init').forEach(el =>
      revealObserver.observe(el)
    );
  }

  /* ─────────────────────────────────────────────
     6. STATS COUNTER — animated easeOut numbers
  ───────────────────────────────────────────── */
  const statsSection = document.getElementById('stats');
  let counted = false;

  /** Quadratic easeOut for natural deceleration */
  function easeOut(t) { return t * (2 - t); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const DURATION = 2000; // ms
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / DURATION, 1);
      el.textContent = Math.round(easeOut(progress) * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else              el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }

  new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      document.querySelectorAll('.stat-num[data-target]').forEach(el =>
        reduceMotion
          ? (el.textContent = el.dataset.target + (el.dataset.suffix || ''))
          : animateCounter(el)
      );
    }
  }, { threshold: 0.5 }).observe(statsSection);

  /* ─────────────────────────────────────────────
     7. CONTACT FORM — inline validation
  ───────────────────────────────────────────── */
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const btnText   = submitBtn.querySelector('.btn-text');
  const btnSpinner= submitBtn.querySelector('.btn-spinner');

  const nameInp   = document.getElementById('full-name');
  const emailInp  = document.getElementById('email');
  const nameErr   = document.getElementById('name-error');
  const emailErr  = document.getElementById('email-error');

  /** Returns an error string or '' if valid */
  function validate(field) {
    const v = field.value.trim();
    if (field.required && !v)             return 'This field is required.';
    if (field.type === 'email' && v &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email.';
    return '';
  }

  /** Apply/clear visible error state */
  function setFieldError(input, errEl, msg) {
    errEl.textContent = msg;
    input.style.borderColor = msg ? '#C0392B' : '#E5E1DA';
  }

  // Live blur validation
  nameInp.addEventListener('blur',  () => setFieldError(nameInp,  nameErr,  validate(nameInp)));
  emailInp.addEventListener('blur', () => setFieldError(emailInp, emailErr, validate(emailInp)));

  // Clear on typing
  nameInp.addEventListener('input',  () => { if (nameErr.textContent)  setFieldError(nameInp,  nameErr,  ''); });
  emailInp.addEventListener('input', () => { if (emailErr.textContent) setFieldError(emailInp, emailErr, ''); });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nErr = validate(nameInp);
    const eErr = validate(emailInp);
    setFieldError(nameInp,  nameErr,  nErr);
    setFieldError(emailInp, emailErr, eErr);
    if (nErr || eErr) return;

    const origLabel      = btnText.textContent;
    btnText.textContent = 'Sending…';
    btnSpinner.style.display = 'block';
    submitBtn.disabled    = true;

    // Simulate API delay — replace with real fetch() in production
    setTimeout(() => {

      form.reset();
      setFieldError(nameInp,  nameErr,  '');
      setFieldError(emailInp, emailErr, '');
      btnText.textContent = origLabel;
      btnSpinner.style.display = 'none';
      submitBtn.disabled    = false;

    }, 1500);
  });

  /* ─────────────────────────────────────────────
     8. PARALLAX SYSTEM
  ───────────────────────────────────────────── */
  if (!reduceMotion) {
    const heroInner = document.querySelector('.hero-inner');
    const floatImages = document.querySelectorAll('.img-main, .img-secondary, .cg-main img, .cg-stack img');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      // Hero text parallax
      if (heroInner && scrollY < vh + 100) {
        heroInner.style.transform = `translateY(${scrollY * 0.35}px)`;
        heroInner.style.opacity = 1 - (scrollY / (vh * 0.8));
      }

      // About & Why Choose Us image floating parallax
      floatImages.forEach(img => {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          const center = rect.top + rect.height / 2;
          const diff = center - vh / 2;
          img.style.setProperty('--px-y', `${diff * 0.08}px`);
        }
      });
    }, { passive: true });
  }

}); // end DOMContentLoaded

/* ═══════════════════════════════════════════════
   9. TESTIMONIAL INFINITE SCROLL
   Clones all cards so the CSS animation loops at -50%
════════════════════════════════════════════════ */
(function initTestimonialScroll() {
  const track = document.getElementById('tcTrack');
  if (!track) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Clone all cards and append; CSS then scrolls to -50%
  Array.from(track.children).forEach(card =>
    track.appendChild(card.cloneNode(true))
  );
})();

/* ═══════════════════════════════════════════════
   10. HERO CAROUSEL + BACKGROUND SYNC
════════════════════════════════════════════════ */
(function initHeroCarousel() {
  const slides    = Array.from(document.querySelectorAll('.hc-slide'));
  const bgLayers  = Array.from(document.querySelectorAll('.hero-bg-layer'));
  const dots      = Array.from(document.querySelectorAll('.hc-dot'));
  const prevBtn   = document.getElementById('hcPrev');
  const nextBtn   = document.getElementById('hcNext');
  const carousel  = document.getElementById('heroCarousel');
  const INTERVAL  = 4500; // ms between auto-slides

  if (!slides.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer   = null;

  /** Navigate to a specific slide index */
  function goTo(idx) {
    // Deactivate current
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    dots[current].classList.remove('active');
    dots[current].setAttribute('aria-selected', 'false');
    if (bgLayers[current]) bgLayers[current].classList.remove('active');

    // Update index (wraps around)
    current = ((idx % slides.length) + slides.length) % slides.length;

    // Activate next
    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    dots[current].classList.add('active');
    dots[current].setAttribute('aria-selected', 'true');
    if (bgLayers[current]) bgLayers[current].classList.add('active');
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  function startAuto() {
    if (reduceMotion) return;
    clearInterval(timer);
    timer = setInterval(next, INTERVAL);
  }
  function stopAuto() { clearInterval(timer); }

  // Initialise
  startAuto();

  // Button controls
  nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  // Dot navigation
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => { goTo(i); startAuto(); })
  );

  // Pause auto-play on hover / focus (accessibility)
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin',    stopAuto);
  carousel.addEventListener('focusout',   startAuto);

  // Keyboard arrow navigation inside carousel
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
    if (e.key === 'ArrowRight') { next(); startAuto(); }
  });
})();
