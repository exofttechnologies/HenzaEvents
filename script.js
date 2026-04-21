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
    '#home, #about, #services, #why-us, #gallery'
  );
  const navLinks = document.querySelectorAll('.nav-link');

  // Map section id → matching nav href
  const idToHref = {
    'home':          '#home',
    'about':         '#about',
    'services':      '#services',
    'why-us':        '#services',
    'gallery':       '#gallery',
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
     4b. HERO STAGGERED ENTRANCE ANIMATION
  ───────────────────────────────────────────── */
  const heroAnimEls = document.querySelectorAll('[data-hero-anim]');
  if (heroAnimEls.length) {
    const delays = [0, 300, 500, 750, 1000, 1250]; // ms per step
    heroAnimEls.forEach(el => {
      const step = parseInt(el.dataset.heroAnim, 10) || 1;
      const delay = delays[step] || step * 200;
      setTimeout(() => {
        el.classList.add('hero-visible');
      }, reduceMotion ? 0 : delay);
    });
  }

  /* ─────────────────────────────────────────────
     4c. HERO VIDEO FALLBACK
  ───────────────────────────────────────────── */
  const heroVideo = document.querySelector('.hero-video');
  const heroVideoWrap = document.querySelector('.hero-video-wrap');
  if (heroVideo && heroVideoWrap) {
    // If video fails to load, hide it and let the image carousel show through
    heroVideo.addEventListener('error', () => {
      heroVideoWrap.style.display = 'none';
    });
    // Also check if video stalls on load
    heroVideo.addEventListener('stalled', () => {
      heroVideoWrap.style.display = 'none';
    });
    // If video can play, dim the carousel images (video takes priority)
    heroVideo.addEventListener('playing', () => {
      document.querySelectorAll('.hero-bg-layer').forEach(l => {
        l.style.opacity = '0';
        l.classList.remove('active');
      });
    });
    // Attempt to play (some browsers block autoplay)
    heroVideo.play().catch(() => {
      heroVideoWrap.style.display = 'none';
    });
  }

  /* ─────────────────────────────────────────────
     5. SCROLL REVEAL — fade + slide up
  ───────────────────────────────────────────── */
  if (!reduceMotion) {
    /** Elements to animate on scroll */
    const revealSel = [
      '.eyebrow', '.section-hd h2', '.section-hd .sub',
      '.svc-card', '.test-card',
      '.about-images', '.about-text', '.stat-item',
      '.check-list li', '.why-list li',
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

  if (statsSection) {
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
  }

  /* Contact form removed — validation code cleaned up */

  /* ─────────────────────────────────────────────
     8. PARALLAX SYSTEM
  ───────────────────────────────────────────── */
  if (!reduceMotion) {
    const heroInner = document.querySelector('.hero-inner');
    const floatImages = document.querySelectorAll('.about-hero-img, .about-secondary-img, .cg-main img, .cg-stack img');

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
  const slideLabel = document.getElementById('heroSlideLabel');
  const INTERVAL  = 5500; // ms between auto-slides (slower for cinematic feel)

  if (!slides.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let current = 0;
  let timer   = null;

  /** Update the slide counter label (e.g. "02 / 05") */
  function updateLabel() {
    if (slideLabel) {
      const num = String(current + 1).padStart(2, '0');
      const total = String(slides.length).padStart(2, '0');
      slideLabel.textContent = `${num} / ${total}`;
    }
  }

  /** Navigate to a specific slide index */
  function goTo(idx) {
    // Deactivate current
    slides[current].classList.remove('active');
    slides[current].setAttribute('aria-hidden', 'true');
    if (dots[current]) {
      dots[current].classList.remove('active');
      dots[current].setAttribute('aria-selected', 'false');
    }
    if (bgLayers[current]) bgLayers[current].classList.remove('active');

    // Update index (wraps around)
    current = ((idx % slides.length) + slides.length) % slides.length;

    // Activate next
    slides[current].classList.add('active');
    slides[current].setAttribute('aria-hidden', 'false');
    if (dots[current]) {
      dots[current].classList.add('active');
      dots[current].setAttribute('aria-selected', 'true');
    }
    if (bgLayers[current]) bgLayers[current].classList.add('active');

    updateLabel();
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
  updateLabel();
  startAuto();

  // Button controls (hidden but kept for potential keyboard use)
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });

  // Dot navigation
  dots.forEach((dot, i) =>
    dot.addEventListener('click', () => { goTo(i); startAuto(); })
  );

  // Pause auto-play when hero section is not visible
  const heroSection = document.getElementById('home');
  if (heroSection) {
    const heroObserver = new IntersectionObserver(entries => {
      entries[0].isIntersecting ? startAuto() : stopAuto();
    }, { threshold: 0.1 });
    heroObserver.observe(heroSection);
  }
})();
