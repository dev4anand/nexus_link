/**
 * NEXUS LINK — Shared Navigation & Global UI JS
 * Includes theme toggle (dark/light) logic
 */

(function () {
  'use strict';

  // ── Apply saved theme ASAP (before DOMContentLoaded) to avoid flash ──
  (function () {
    var saved = localStorage.getItem('nexuslink-theme');
    document.documentElement.setAttribute('data-theme', saved || 'light');
  })();

  document.addEventListener('DOMContentLoaded', function () {

    // ── Navbar Scroll Effect ──
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      });
    }

    // ── Active Nav Link ──
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || (currentPath === '' && href === 'index.html'))) {
        link.classList.add('active');
      }
    });

    // ── Mobile Menu ──
    const hamburger  = document.querySelector('.nav-hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuClose  = document.querySelector('.mobile-menu-close');

    if (hamburger && mobileMenu) {
      const menuLinks = mobileMenu.querySelectorAll('a');

      const setMenuOpen = (open) => {
        mobileMenu.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';

        if (open) {
          menuLinks.forEach((a, i) => {
            a.style.animationDelay = `${i * 0.07}s`;
          });
        }
      };

      const closeFn = () => setMenuOpen(false);
      const isOpen = () => mobileMenu.classList.contains('open');

      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-controls', mobileMenu.id || 'mobile-menu');
      hamburger.addEventListener('click', () => setMenuOpen(!isOpen()));

      if (menuClose) {
        menuClose.textContent = 'X';
        menuClose.setAttribute('aria-label', 'Close menu');
        menuClose.addEventListener('click', closeFn);
      }

      menuLinks.forEach(a => a.addEventListener('click', closeFn));
      mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) closeFn();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) closeFn();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 1024 && isOpen()) closeFn();
      });
    }

    // ── Theme Toggle ──
    const html = document.documentElement;
    const STORAGE_KEY = 'nexuslink-theme';

    function applyTheme(theme) {
      html.setAttribute('data-theme', theme);
      localStorage.setItem(STORAGE_KEY, theme);
    }

    // Wire every .theme-toggle button on the page
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme') || 'light';
        applyTheme(current === 'light' ? 'dark' : 'light');
      });
    });

    // ── Scroll Reveal ──
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ── Counter Animation ──
    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const prefix = el.getAttribute('data-prefix') || '';
      const duration = 2000;
      const start = performance.now();

      function update(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(eased * target) + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            animateCounter(e.target);
            counterObserver.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

    // ── Scroll To Top ──
    const scrollTopBtn = document.getElementById('scroll-top');
    if (scrollTopBtn) {
      window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
      });
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ── Smooth hash links ──
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const id = this.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  });
})();
