/* Home page interactive 3D showcase scenes. */
(function () {
  const PRESETS = ["L", "island", "parallel"];
  let activePackId = "sunlit_gallery";

  function buildRoom() {
    return {
      widthIn: MK.catalog.room.defaultWidthIn,
      depthIn: MK.catalog.room.defaultDepthIn,
      counterHeightIn: MK.catalog.room.defaultCounterHeightIn,
      wallFinishId: MK.catalog.room.defaultWallFinishId,
      floorFinishId: MK.catalog.room.defaultFloorFinishId,
      wallColor: "#F3EFE7",
      floorColor: "#D4AC82"
    };
  }

  function applyPackToState(state, packId) {
    const pack = MK.catalog.stylePacks.find(p => p.id === packId) || MK.catalog.stylePacks[0];
    if (!pack) return;
    const d = pack.defaults || {};
    state.room.wallFinishId = d.wall || state.room.wallFinishId;
    state.room.floorFinishId = d.floor || state.room.floorFinishId;
    state.room.wallColor = MK.modules.materialHex("wall", state.room.wallFinishId, MK.catalog.room.defaultWallFinishId, "#F3EFE7");
    state.room.floorColor = MK.modules.materialHex("floor", state.room.floorFinishId, MK.catalog.room.defaultFloorFinishId, "#D4AC82");
    for (const m of state.modules) {
      if (d.cabinetFinish) m.finishId = d.cabinetFinish;
      if (d.countertop) m.countertopId = d.countertop;
      if (d.backsplash) m.backsplashId = d.backsplash;
      MK.modules.normalize(m);
    }
  }

  function buildPreviewState(preset, packId) {
    const room = buildRoom();
    const modules = MK.presets.build(preset, room).map(m => ({ ...m }));
    const state = {
      room,
      preset,
      modules,
      selection: null,
      showOverheads: true,
      showChimney: true
    };
    applyPackToState(state, packId);
    return state;
  }

  function drawAll() {
    for (const preset of PRESETS) {
      const svg = document.getElementById(`home-scene-${preset}`);
      if (!svg) continue;
      const state = buildPreviewState(preset, activePackId);
      MK.renderer.draw(svg, state);
    }
  }

  function updateStudioLinks() {
    document.querySelectorAll(".kitchen-card").forEach(card => {
      const preset = card.dataset.preset;
      const link = card.querySelector(".open-studio-link");
      if (!preset || !link) return;
      link.href = `studio.html?fresh=1&preset=${encodeURIComponent(preset)}&pack=${encodeURIComponent(activePackId)}`;
    });
  }

  function wirePackButtons() {
    function markActive(activeBtn) {
      document.querySelectorAll(".showcase-pack").forEach(b => {
        const isActive = b === activeBtn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", String(isActive));
      });
    }

    document.querySelectorAll(".showcase-pack").forEach(btn => {
      btn.addEventListener("click", () => {
        activePackId = btn.dataset.pack || activePackId;
        markActive(btn);
        drawAll();
        updateStudioLinks();
      });
    });
  }

  function wireCardTilt() {
    document.querySelectorAll(".kitchen-card").forEach(card => {
      let moving = false;
      card.addEventListener("pointerdown", () => { moving = true; });
      window.addEventListener("pointerup", () => {
        moving = false;
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
      card.addEventListener("pointermove", (e) => {
        if (!moving) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (0.5 - y) * 4;
        const ry = (x - 0.5) * 6;
        card.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        card.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      });
    });
  }

  function init() {
    MK.state.catalog = MK.catalog;
    MK.ensureCatalogDefaults();
    wirePackButtons();
    wireCardTilt();
    drawAll();
    updateStudioLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
