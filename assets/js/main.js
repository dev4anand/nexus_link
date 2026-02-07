
// Main JavaScript for Nexus Link Website

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Theme First to prevent flash
    initThemeToggle();

    // Initialize standard interactions
    initNavbarScroll();
    initScrollAnimations();

    // Canvas Background Animation
    initBackgroundAnimation();

    // Init Swiper
    initSwiper();

    // Init Mobile Menu Close on Click
    initMobileMenuClose();
});

// Theme Toggle Logic
function initThemeToggle() {
    const toggleBtns = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
    const html = document.documentElement;
    const LOCAl_STORAGE_KEY = 'nexus-theme';

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem(LOCAl_STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }

    // Toggle Event
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem(LOCAl_STORAGE_KEY, newTheme);

            // Re-init background to change particle colors
            initBackgroundAnimation();
        });
    });
}

// Navbar Scroll Effect
function initNavbarScroll() {
    const header = document.querySelector('.glass-header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}


// Intersection Observer for Scroll Animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-scroll, .animate-up').forEach(el => observer.observe(el));
}


// Swiper Initialization
function initSwiper() {
    if (typeof Swiper !== 'undefined') {
        new Swiper(".mySwiper", {
            spaceBetween: 0,
            centeredSlides: true,
            effect: "fade",
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
        });
    }
}


// Background Canvas Animation (Adapts to Theme)
let canvasAnimationId;

function initBackgroundAnimation() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';

    // Stop previous loop
    if (canvasAnimationId) cancelAnimationFrame(canvasAnimationId);

    let width, height;
    let particles = [];

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2;

            // Colors based on theme
            if (isDark) {
                this.color = Math.random() > 0.5 ? 'rgba(0, 243, 255, 0.3)' : 'rgba(112, 0, 255, 0.3)';
            } else {
                this.color = Math.random() > 0.5 ? 'rgba(0, 123, 255, 0.3)' : 'rgba(102, 16, 242, 0.3)';
            }
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        resize();
        particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        canvasAnimationId = requestAnimationFrame(animate);
    }

    window.removeEventListener('resize', resize);
    window.addEventListener('resize', resize);
    init();
    animate();
}

// Mobile Menu Auto-Close Fix
// Mobile Menu Scroll-then-Close Fix
function initMobileMenuClose() {
    const offcanvasEl = document.getElementById('offcanvasNavbarLight');
    if (!offcanvasEl) return;

    const navLinks = offcanvasEl.querySelectorAll('.nav-link');
    // We don't need to create a new instance if we just want to get the existing one later

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Only handle anchor links
            if (href && href.startsWith('#')) {
                e.preventDefault();

                const targetId = href.substring(1);
                // Handle "Home" link which might be just "#" or "#top"
                const targetEl = targetId ? document.getElementById(targetId) : document.body; // Default to top if empty hash

                if (targetEl) {
                    // 1. Scroll to the section
                    targetEl.scrollIntoView({ behavior: 'smooth' });

                    // 2. Close the offcanvas after a slight delay to allow scroll to start/user to see movement
                    // The user specifically requested "INTIALLY SCROLL TO THE SECTION THEN CLOSE THE NAV BAR"
                    setTimeout(() => {
                        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                        if (bsOffcanvas) {
                            bsOffcanvas.hide();
                        }
                    }, 500); // 500ms delay
                }
            } else if (href === '#') {
                // Handle "Home" link if it's just "#"
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => {
                    const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
                    if (bsOffcanvas) {
                        bsOffcanvas.hide();
                    }
                }, 500);
            }
        });
    });
}
