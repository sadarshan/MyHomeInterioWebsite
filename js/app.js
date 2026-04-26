/* Entry: wire catalog, state, ui, controls, and the renderer redraw loop. */
(function () {
  function updateCanvasHint(state) {
    const hint = document.querySelector(".canvas-hint");
    if (!hint) return;
    const sel = state.modules.find(m => m.id === state.selection);
    if (!sel) {
      hint.textContent = "Drag modules from Library. Click a module to edit materials. Delete to remove.";
      return;
    }
    const label = MK.modules.label(sel);
    hint.textContent = `${label} selected — change finish, countertop, backsplash, rotate or remove from Properties.`;
  }

  function init() {
    MK.state.catalog = MK.catalog;
    const params = new URLSearchParams(window.location.search);
    const presetFromUrl = params.get("preset");
    const packFromUrl = params.get("pack");
    const freshFromUrl = params.get("fresh") === "1";

    /* Defaults from catalog */
    MK.state.room.widthIn = MK.catalog.room.defaultWidthIn;
    MK.state.room.depthIn = MK.catalog.room.defaultDepthIn;
    MK.state.room.counterHeightIn = MK.catalog.room.defaultCounterHeightIn;
    MK.state.room.wallFinishId = MK.catalog.room.defaultWallFinishId;
    MK.state.room.floorFinishId = MK.catalog.room.defaultFloorFinishId;
    MK.syncRoomColors();

    /* Restore persisted state if present */
    if (!freshFromUrl) MK.persistence.autoLoad();
    MK.ensureCatalogDefaults();

    /* If still no modules, seed with the default preset */
    if (!MK.state.modules || MK.state.modules.length === 0) {
      MK.state.modules = MK.presets.build(MK.state.preset, MK.state.room);
    }

    /* Mount UI */
    MK.toolbar.mount("#toolbar");
    MK.inspector.mount("#inspector");
    MK.paintTrail.attach(".paint-layer");

    /* Renderer */
    const svg = document.getElementById("scene");
    MK.renderer.draw(svg, MK.state);
    MK.controls.attach(svg);
    updateCanvasHint(MK.state);

    if (presetFromUrl && MK.catalog.presets[presetFromUrl]) {
      MK.state.preset = presetFromUrl;
      MK.replaceModules(MK.presets.build(presetFromUrl, MK.state.room));
    }
    if (packFromUrl) {
      MK.applyStylePack(packFromUrl);
    }

    /* Subscribe redraw + autosave. Tag "canvas" so this fires for every
     * notify, including the canvas-only ones during slider drags. */
    MK.subscribe((s) => {
      MK.renderer.draw(svg, s);
      updateCanvasHint(s);
      MK.persistence.autoSave();
    }, "canvas");

    /* CTA scroll */
    const cta = document.querySelector(".cta");
    if (cta) cta.addEventListener("click", () => {
      const t = document.getElementById("studio");
      if (t) t.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
