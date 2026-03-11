/**
 * NEXUS LINK — Home Page JS
 */

document.addEventListener('DOMContentLoaded', function () {
  // Hero text typewriter effect
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.opacity = '1';
  }
  
  // Parallax on hero background
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroBg.style.transform = `scale(1.05) translateY(${scrolled * 0.15}px)`;
    });
  }
});
