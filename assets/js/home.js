/**
 * NEXUS LINK — Home Page JS
 */

document.addEventListener('DOMContentLoaded', function () {
  // Hero text typewriter effect
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.style.opacity = '1';
  }

  // Background parallax for hero media
  const heroLayers = Array.from(document.querySelectorAll('.hero-bg, .hero-video'));
  if (heroLayers.length > 0) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const y = scrolled * 0.06;
      heroLayers.forEach((layer) => {
        layer.style.transform = `scale(1.02) translateY(${y}px)`;
      });
    });
  }

  // Hero background video: play smoothly, fallback to base gradient if autoplay/playback fails
  const hero = document.querySelector('.hero');
  const heroVideo = document.getElementById('hero-video');

  if (hero && heroVideo) {
    let fallbackApplied = false;

    const applyFallback = () => {
      if (fallbackApplied) return;
      fallbackApplied = true;
      hero.classList.add('video-fallback');
      heroVideo.pause();
      heroVideo.currentTime = 0;
    };

    const tryPlayVideo = () => {
      if (fallbackApplied || !heroVideo) return;
      const playPromise = heroVideo.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          applyFallback();
        });
      } else if (heroVideo.paused) {
        applyFallback();
      }
    };

    heroVideo.addEventListener('error', applyFallback);
    heroVideo.addEventListener('stalled', applyFallback);
    heroVideo.addEventListener('abort', applyFallback);

    heroVideo.addEventListener('canplay', () => {
      tryPlayVideo();
    });

    window.setTimeout(() => {
      if (heroVideo.paused || heroVideo.readyState < 2) {
        applyFallback();
      }
    }, 2500);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        heroVideo.pause();
        return;
      }

      if (!fallbackApplied) {
        tryPlayVideo();
      }
    });

    tryPlayVideo();
  }
});
