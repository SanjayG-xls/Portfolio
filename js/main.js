/**
 * Main Controller — Apple Infinite Zoom & Lenis Smooth Scroll
 * Portfolio of Sanjay — Electronic Engineering & Hardware
 */

document.addEventListener('DOMContentLoaded', () => {
  const handwritingEl = document.querySelector('.handwriting');
  const heroSvg = document.querySelector('.hero-screen svg.hello__svg');
  const heroScreen = document.querySelector('#hero');
  const contentSection = document.querySelector('#content');
  const siteSidebar = document.querySelector('.site-sidebar');
  const mainCanvas = document.querySelector('.main-canvas');
  let isReplaying = false;

  // 1. Initial Calligraphy Draw Trigger on Page Load
  if (handwritingEl) {
    handwritingEl.classList.add('is-drawing');
  }

  // Calligraphy Replay Function (5.2s duration)
  function replayHelloAnimation() {
    if (!handwritingEl || isReplaying) return;
    isReplaying = true;

    handwritingEl.classList.remove('is-drawing');
    // Force DOM reflow to restart CSS stroke-dashoffset animation
    void handwritingEl.offsetWidth;
    handwritingEl.classList.add('is-drawing');

    // Debounce to match the 5.2s stroke duration
    setTimeout(() => {
      isReplaying = false;
    }, 5500);
  }

  // Click SVG directly to replay manually
  if (heroSvg) {
    heroSvg.style.cursor = 'pointer';
    heroSvg.setAttribute('title', 'Click to replay animation');
    heroSvg.addEventListener('click', replayHelloAnimation);
  }

  // =========================================================================
  // 2. Lenis Smooth Scroll Engine (Quartic Luxury Inertia)
  // =========================================================================
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.65, // Extended deceleration for luxury, floaty inertia
      easing: (t) => 1 - Math.pow(1 - t, 4), // Quartic ease-out: buttery smooth glide
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85, // Damps sudden wheel notches for continuous glide
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Synchronize Lenis with GSAP 60fps ticker
    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Smooth Anchor Navigation via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const targetEl = document.querySelector(href);
          if (targetEl) {
            e.preventDefault();
            lenis.scrollTo(targetEl, {
              offset: href === '#hero' ? 0 : -20,
              duration: 1.3,
            });
          }
        }
      });
    });
  }

  // =========================================================================
  // 3. GSAP & ScrollTrigger: Apple Infinite Zoom / Fly-Through Transition
  // =========================================================================
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
    }

    if (heroScreen && heroSvg && contentSection) {
      // Set initial hidden & offset states for the split entrance
      gsap.set(contentSection, { opacity: 0, y: 30 });
      if (siteSidebar) gsap.set(siteSidebar, { x: -80, opacity: 0 });
      if (mainCanvas) gsap.set(mainCanvas, { x: 80, opacity: 0 });

      // Unified Apple Zoom & Split-Entrance Timeline
      const zoomTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: '+=110%',
          pin: true,
          pinSpacing: false,
          scrub: 0.8,
        },
      });

      // 1. Zoom hero SVG toward camera through the central letter loop
      zoomTimeline.to(
        heroSvg,
        {
          scale: 26,
          transformOrigin: '48% 54%',
          ease: 'power2.in',
          duration: 0.65,
        },
        0
      );

      // 2. Fade out the SVG as it expands beyond screen bounds
      zoomTimeline.to(
        heroSvg,
        {
          opacity: 0,
          ease: 'power1.in',
          duration: 0.35,
        },
        0.3
      );

      // 3. Content section fades in smoothly just before hello fully finishes
      zoomTimeline.to(
        contentSection,
        {
          opacity: 1,
          y: 0,
          ease: 'power2.out',
          duration: 0.55,
        },
        0.45
      );

      // 4. Sidebar glides out smoothly from the left side
      if (siteSidebar) {
        zoomTimeline.to(
          siteSidebar,
          {
            x: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.55,
          },
          0.48
        );
      }

      // 5. Main Canvas glides in smoothly from the right side
      if (mainCanvas) {
        zoomTimeline.to(
          mainCanvas,
          {
            x: 0,
            opacity: 1,
            ease: 'power2.out',
            duration: 0.55,
          },
          0.48
        );
      }

      // Replay Hello animation when scrolling back to the very top
      let hasLeftTop = false;

      ScrollTrigger.create({
        trigger: '#hero',
        start: 'top top',
        end: '+=40%',
        onLeave: () => {
          hasLeftTop = true;
        },
        onEnterBack: () => {
          if (hasLeftTop) {
            hasLeftTop = false;
            replayHelloAnimation();
          }
        },
      });
    }
  } else {
    // Fallback scroll listener if GSAP is unavailable
    let hasScrolledDown = false;
    window.addEventListener(
      'scroll',
      () => {
        const scrollPos = window.scrollY || document.documentElement.scrollTop;
        if (scrollPos > 300) {
          hasScrolledDown = true;
        }
        if (scrollPos <= 15 && hasScrolledDown) {
          hasScrolledDown = false;
          replayHelloAnimation();
        }
      },
      { passive: true }
    );
  }
});
