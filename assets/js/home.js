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

    // Improve autoplay reliability on mobile browsers.
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.playsInline = true;
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('webkit-playsinline', '');

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
          // If source truly cannot be loaded, fallback; otherwise allow later retries.
          if (heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            applyFallback();
          }
        });
      } else if (heroVideo.paused) {
        if (heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
          applyFallback();
        }
      }
    };

    heroVideo.addEventListener('error', applyFallback);
    heroVideo.addEventListener('stalled', () => {
      if (!fallbackApplied) {
        window.setTimeout(() => {
          if (!fallbackApplied && heroVideo.paused) {
            tryPlayVideo();
          }
        }, 600);
      }
    });
    heroVideo.addEventListener('abort', () => {
      if (!fallbackApplied && heroVideo.paused) {
        tryPlayVideo();
      }
    });

    heroVideo.addEventListener('canplay', () => {
      tryPlayVideo();
    });

    window.setTimeout(() => {
      if (heroVideo.readyState === 0 && heroVideo.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        applyFallback();
        return;
      }
      if (heroVideo.paused) {
        tryPlayVideo();
      }
    }, 7000);

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
