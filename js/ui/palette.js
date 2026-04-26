/* Cursor paint trail — subtle painterly dots that follow the pointer over the
 * designer canvas and fade out. Mounted on the .paint-layer overlay. */
window.MK = window.MK || {};

MK.paintTrail = (function () {
  let layer = null;
  const COLORS = ["#8FB0A0", "#C9A98A", "#AFC4CF", "#C5D3C4", "#D7C1AB"];
  let last = 0;
  const MIN_GAP_MS = 32;

  function attach(layerSelector) {
    layer = document.querySelector(layerSelector);
    if (!layer) return;
    const host = layer.parentElement;
    host.addEventListener("mousemove", onMove);
  }

  function onMove(e) {
    const now = performance.now();
    if (now - last < MIN_GAP_MS) return;
    last = now;
    if (!layer) return;
    const rect = layer.getBoundingClientRect();
    const x = e.clientX - rect.left, y = e.clientY - rect.top;
    const dot = document.createElement("div");
    dot.className = "paint-dot";
    dot.style.left = (x - 7) + "px";
    dot.style.top  = (y - 7) + "px";
    dot.style.background = COLORS[Math.floor(Math.random() * COLORS.length)];
    layer.appendChild(dot);
    setTimeout(() => dot.remove(), 720);
  }

  return { attach };
})();
