// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

    // Register GSAP Plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initial Loader
    const tlLoader = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove('loading');
            document.body.classList.add('loaded');
            initAnimations();
        }
    });

    tlLoader.to('.loader-bar', { width: '100%', duration: 1.5, ease: 'power2.inOut' })
        .to('.loader-text', { opacity: 0, duration: 0.5, delay: 0.5 })
        .to('.preloader', { y: '-100%', duration: 1, ease: 'expo.inOut' });

    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    const storedTheme = localStorage.getItem('theme') || 'dark';

    if (storedTheme) {
        html.setAttribute('data-theme', storedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Menu Overlay
    const menuTrigger = document.querySelector('.menu-trigger');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-link');

    let isMenuOpen = false;

    menuTrigger.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        menuOverlay.classList.toggle('active');

        const lines = document.querySelectorAll('.line');
        if (isMenuOpen) {
            gsap.to(lines[0], { rotate: 45, y: 4, duration: 0.3 });
            gsap.to(lines[1], { rotate: -45, y: -4, duration: 0.3 });

            gsap.fromTo(menuLinks,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, staggered: 0.1, duration: 0.5, delay: 0.3 }
            );
        } else {
            gsap.to(lines[0], { rotate: 0, y: 0, duration: 0.3 });
            gsap.to(lines[1], { rotate: 0, y: 0, duration: 0.3 });
        }
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            isMenuOpen = false;
            menuOverlay.classList.remove('active');
            const lines = document.querySelectorAll('.line');
            gsap.to(lines[0], { rotate: 0, y: 0, duration: 0.3 });
            gsap.to(lines[1], { rotate: 0, y: 0, duration: 0.3 });
        });
    });

    function initAnimations() {

        // Navbar Scroll Effect
        ScrollTrigger.create({
            start: 'top -80',
            end: 99999,
            toggleClass: { className: 'scrolled', targets: '.navbar' }
        });

        // Hero Text Reveal
        const heroTl = gsap.timeline();
        heroTl.from('.reveal-text', {
            y: 100,
            opacity: 0,
            duration: 1,
            stagger: 0.2,
            ease: 'power3.out'
        })
            .from('.reveal-text-p', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.5')
            .from('.hero-cta', {
                y: 20,
                opacity: 0,
                duration: 0.8,
                ease: 'power2.out'
            }, '-=0.6');

        // About Section
        gsap.utils.toArray('.fade-up').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });
        });

        // Counter Animation
        gsap.utils.toArray('.stat-box').forEach(box => {
            const countEl = box.querySelector('.count');
            const targetCount = countEl.getAttribute('data-count');

            ScrollTrigger.create({
                trigger: box,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    gsap.to(countEl, {
                        innerText: targetCount,
                        duration: 2,
                        snap: { innerText: 1 },
                        ease: 'power1.inOut'
                    });
                }
            });
        });

        // Horizontal Scroll for Services
        // Horizontal Scroll for Services (Desktop Only)
        ScrollTrigger.matchMedia({
            "(min-width: 769px)": function () {
                const servicesSection = document.querySelector('.services-section');
                const track = document.querySelector('.services-track');

                // Reset styling that might have been changed by mobile
                track.style.transform = "none";

                let scrollTween = gsap.to(track, {
                    x: () => -(track.scrollWidth - window.innerWidth),
                    ease: 'none',
                    scrollTrigger: {
                        trigger: servicesSection,
                        start: 'top top',
                        end: () => "+=" + (track.scrollWidth - window.innerWidth),
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                });
            }
        });

        // Projects Parallax
        gsap.utils.toArray('.project-row').forEach(row => {
            const img = row.querySelector('img');

            gsap.to(img, {
                yPercent: 20, // Move image down within container
                ease: 'none',
                scrollTrigger: {
                    trigger: row,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true
                }
            });
        });

    }

});
