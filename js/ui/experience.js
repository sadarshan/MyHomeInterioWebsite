/* Immersive UI layer using frontend plugins:
 * - Lenis for smooth scrolling
 * - GSAP + ScrollTrigger for reveal/parallax motion */
(function () {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initLenis() {
    if (reduceMotion || typeof window.Lenis !== "function") return;
    const lenis = new window.Lenis({
      lerp: 0.08,
      smoothWheel: true,
      wheelMultiplier: 1.05
    });
    function raf(time) {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    }
    window.requestAnimationFrame(raf);
  }

  function initGsap() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    if (document.querySelector(".kitchen-card")) {
      window.gsap.from(".kitchen-card", {
        y: 28,
        opacity: 0,
        stagger: 0.12,
        duration: 0.78,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#showcase",
          start: "top 78%"
        }
      });
    }

    if (document.querySelector(".designer .panel")) {
      window.gsap.from(".designer .panel", {
        y: 22,
        opacity: 0,
        duration: 0.62,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: "#studio",
          start: "top 76%"
        }
      });
    }

    window.gsap.to(".ambient-a", {
      yPercent: 7,
      xPercent: -3,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.2
      }
    });

    window.gsap.to(".ambient-b", {
      yPercent: -6,
      xPercent: 4,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1.4
      }
    });
  }

  function init() {
    initLenis();
    initGsap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
