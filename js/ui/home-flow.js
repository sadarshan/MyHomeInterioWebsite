/* Home page process-flow interaction. */
(function () {
  function initFlow() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var steps = document.querySelectorAll(".s-step");
    if (!steps.length) return;

    if ("IntersectionObserver" in window && !reduce) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      }, { threshold: 0.22, rootMargin: "0px 0px -10% 0px" });
      steps.forEach(function (el) { obs.observe(el); });
    } else {
      steps.forEach(function (el) { el.classList.add("in-view"); });
    }

    var flow = document.getElementById("s-flow");
    var path = flow && flow.querySelector(".s-flow-path");
    var markers = flow ? flow.querySelectorAll(".s-flow-marker") : [];
    if (!flow || !path) return;

    if (reduce) {
      path.style.strokeDashoffset = "0";
      markers.forEach(function (m) { m.classList.add("is-lit"); });
      return;
    }

    var lastProgress = -1;
    var ticking = false;

    function update() {
      var rect = flow.getBoundingClientRect();
      var winH = window.innerHeight;
      var total = rect.height + winH * 0.6;
      var progressed = (winH * 0.85) - rect.top;
      var progress = Math.max(0, Math.min(1, progressed / total));

      if (Math.abs(progress - lastProgress) > 0.001) {
        path.style.strokeDashoffset = String(1 - progress);
        if (markers[0]) markers[0].classList.toggle("is-lit", progress > 0.04);
        if (markers[1]) markers[1].classList.toggle("is-lit", progress > 0.50);
        if (markers[2]) markers[2].classList.toggle("is-lit", progress > 0.96);
        lastProgress = progress;
      }
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    window.addEventListener("resize", function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFlow);
  } else {
    initFlow();
  }
})();
