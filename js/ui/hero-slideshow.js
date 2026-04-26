(function () {
  'use strict';

  var IMAGES = [
    'assets/hero/slideshow/k01.jpeg',
    'assets/hero/slideshow/k02.jpeg',
    'assets/hero/slideshow/k03.jpeg',
    'assets/hero/slideshow/k04.jpeg',
    'assets/hero/slideshow/k05.jpeg',
    'assets/hero/slideshow/k06.jpeg',
    'assets/hero/slideshow/k07.jpeg',
    'assets/hero/slideshow/k08.jpeg',
    'assets/hero/slideshow/k09.jpeg',
    'assets/hero/slideshow/k10.jpeg',
    'assets/hero/slideshow/k11.jpeg',
    'assets/hero/slideshow/k12.jpeg',
    'assets/hero/slideshow/k13.jpeg',
    'assets/hero/slideshow/k14.jpeg',
    'assets/hero/slideshow/k15.jpeg',
    'assets/hero/slideshow/k16.jpeg'
  ];

  var WIPE_MS = 1000;
  var HOLD_MS = 3000;
  var CYCLE_MS = WIPE_MS + HOLD_MS;

  function init() {
    var oldEl = document.querySelector('[data-hero-old]');
    var newEl = document.querySelector('[data-hero-new]');
    var barEl = document.querySelector('[data-hero-bar]');
    if (!oldEl || !newEl || !barEl) return;

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return;

    IMAGES.forEach(function (src) { var img = new Image(); img.src = src; });

    var idx = 1;
    var prevIdx = 0;
    oldEl.style.backgroundImage = "url('" + IMAGES[prevIdx] + "')";
    newEl.style.backgroundImage = "url('" + IMAGES[idx] + "')";
    newEl.style.clipPath = 'inset(0 100% 0 0)';
    newEl.style.webkitClipPath = 'inset(0 100% 0 0)';
    barEl.style.opacity = '0';

    var startTs = performance.now();
    var rafId = 0;

    function setProgress(p) {
      var pct = p * 100;
      var clip = 'inset(0 ' + (100 - pct) + '% 0 0)';
      newEl.style.clipPath = clip;
      newEl.style.webkitClipPath = clip;
      barEl.style.left = pct + '%';
      barEl.style.opacity = (p > 0 && p < 1) ? '1' : '0';
    }

    function tick(t) {
      var elapsed = t - startTs;
      if (elapsed >= CYCLE_MS) {
        prevIdx = idx;
        idx = (idx + 1) % IMAGES.length;
        startTs = t;
        oldEl.style.backgroundImage = "url('" + IMAGES[prevIdx] + "')";
        newEl.style.backgroundImage = "url('" + IMAGES[idx] + "')";
        setProgress(0);
      } else if (elapsed <= WIPE_MS) {
        var t01 = elapsed / WIPE_MS;
        var eased = t01 < 0.5
          ? 2 * t01 * t01
          : 1 - Math.pow(-2 * t01 + 2, 2) / 2;
        setProgress(eased);
      } else {
        setProgress(1);
      }
      rafId = requestAnimationFrame(tick);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      } else if (!rafId) {
        startTs = performance.now();
        rafId = requestAnimationFrame(tick);
      }
    });

    rafId = requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
