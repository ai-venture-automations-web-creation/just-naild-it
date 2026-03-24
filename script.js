/* ============================================================
   Just Nail'D It — script.js
   Vanilla JS: mobile menu, sticky header, scroll progress,
   Intersection Observer reveals, counter animation, back-to-top
   ============================================================ */

(function () {
  'use strict';

  /* ---- Scroll Progress Bar ---- */
  const progressBar = document.createElement('div');
  progressBar.classList.add('scroll-progress');
  document.body.prepend(progressBar);

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  /* ---- Sticky Header ---- */
  const header = document.getElementById('site-header');
  function updateHeader() {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  /* ---- Back to Top ---- */
  const backToTop = document.getElementById('backToTop');
  function updateBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---- Throttled Scroll Handler ---- */
  let scrollTicking = false;
  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      window.requestAnimationFrame(function () {
        updateScrollProgress();
        updateHeader();
        updateBackToTop();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // Initial call
  updateScrollProgress();
  updateHeader();
  updateBackToTop();

  /* ---- Mobile Menu ---- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileNav = document.getElementById('mobileNav');

  function closeMobileMenu() {
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('open');
    mobileNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function openMobileMenu() {
    menuToggle.classList.add('open');
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('open');
    mobileNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = menuToggle.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on nav link click
    const mobileLinks = mobileNav.querySelectorAll('.mobile-nav-link, .btn');
    mobileLinks.forEach(function (link) {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (mobileNav.classList.contains('open') &&
          !mobileNav.contains(e.target) &&
          !menuToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
        closeMobileMenu();
        menuToggle.focus();
      }
    });

    // Close on resize to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) {
        closeMobileMenu();
      }
    });
  }

  /* ---- Smooth Scroll for Anchor Links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---- Intersection Observer — Reveal Animations ---- */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all elements immediately
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---- Counter Animation ---- */
  function animateCounter(el, target, duration, isDecimal) {
    const start = 0;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.round(current);
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    }
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('.stat-number[data-target]');
  let countersStarted = false;

  if ('IntersectionObserver' in window && counterEls.length > 0) {
    const statsSection = document.querySelector('.stats-bar');
    if (statsSection) {
      const counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !countersStarted) {
            countersStarted = true;
            counterEls.forEach(function (el) {
              const target = parseFloat(el.getAttribute('data-target'));
              const isDecimal = el.getAttribute('data-target').includes('.');
              animateCounter(el, target, 1800, isDecimal);
            });
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counterObserver.observe(statsSection);
    }
  } else {
    counterEls.forEach(function (el) {
      el.textContent = el.getAttribute('data-target');
    });
  }

  /* ---- Gallery Image Hover — touch-device tap support ---- */
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(function (item) {
    item.addEventListener('touchstart', function () {
      // Toggle hover overlay on tap for touch devices
      item.classList.toggle('touch-hover');
    }, { passive: true });
  });

  /* ---- Active Nav Link on Scroll ---- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav a');

  function setActiveNav() {
    const scrollPos = window.scrollY + 120;
    let current = '';
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(setActiveNav);
  }, { passive: true });

  setActiveNav();

  /* ---- Service Cards — Stagger delay on scroll ---- */
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(function (card, i) {
    const delay = (i % 3) * 100;
    card.style.transitionDelay = delay + 'ms';
  });

  /* ---- Lazy Load Images (native fallback for older browsers) ---- */
  if ('loading' in HTMLImageElement.prototype) {
    // Native lazy loading supported — done automatically via loading="lazy"
  } else if ('IntersectionObserver' in window) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          img.removeAttribute('loading');
          obs.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(function (img) { imgObserver.observe(img); });
  }

  /* ---- Active nav style injection ---- */
  const style = document.createElement('style');
  style.textContent = '.desktop-nav a.active { color: var(--color-primary); } .desktop-nav a.active::after { width: 100%; }';
  document.head.appendChild(style);

  console.log('%c Just Nail\'D It %c nailed it!', 'background:#8E7C93;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px 0 0 4px', 'background:#F7D6E0;color:#72627A;font-weight:bold;padding:4px 8px;border-radius:0 4px 4px 0');

})();
