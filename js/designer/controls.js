window.MK = window.MK || {};

MK.controls = (function () {
  let svg = null;
  let wrap = null;
  let dragging = null; /* { id, dxIn, dyIn } */
  let dragDepth = 0;

  function setDropActive(on) {
    if (!wrap) return;
    if (on) wrap.classList.add("drop-active");
    else wrap.classList.remove("drop-active");
  }

  function attach(svgEl) {
    svg = svgEl;
    wrap = svg.closest(".canvas-wrap");
    svg.addEventListener("mousedown", onDown);
    svg.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    svg.addEventListener("click", onClick);
    window.addEventListener("keydown", onKey);

    /* Drop target for palette tiles */
    svg.addEventListener("dragenter", onDragEnter);
    svg.addEventListener("dragleave", onDragLeave);
    svg.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    });
    svg.addEventListener("drop", onDrop);
  }

  function svgPoint(evt) {
    const pt = svg.createSVGPoint();
    pt.x = evt.clientX; pt.y = evt.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  function moduleAt(target) {
    let n = target;
    while (n && n !== svg) {
      if (n.dataset && n.dataset.id) return n.dataset.id;
      n = n.parentNode;
    }
    return null;
  }

  function onDown(e) {
    const id = moduleAt(e.target);
    if (!id) return;
    const mod = MK.state.modules.find(m => m.id === id);
    if (!mod) return;
    const sp = svgPoint(e);
    const { xIn, yIn } = MK.grid.unproject(sp.x, sp.y);
    dragging = { id, dxIn: xIn - mod.x, dyIn: yIn - mod.y, moved: false };
    MK.select(id);
  }

  function onMove(e) {
    if (!dragging) return;
    const sp = svgPoint(e);
    const { xIn, yIn } = MK.grid.unproject(sp.x, sp.y);
    const mod = MK.state.modules.find(m => m.id === dragging.id);
    if (!mod) { dragging = null; return; }
    const dims = MK.modules.dims(mod);
    const snapped = {
      x: MK.grid.snap(xIn - dragging.dxIn),
      y: MK.grid.snap(yIn - dragging.dyIn)
    };
    const clamped = MK.grid.clampToRoom(snapped.x, snapped.y, dims.wIn, dims.dIn, MK.state.room);
    if (clamped.x !== mod.x || clamped.y !== mod.y) {
      mod.x = clamped.x; mod.y = clamped.y;
      dragging.moved = true;
      /* Canvas-scope during drag so the inspector doesn't rebuild while the
       * user is moving the module; a full notify happens on mouseup. */
      MK.notify({ scope: "canvas" });
    }
  }

  function onUp() {
    if (dragging && dragging.moved) MK.notify();
    dragging = null;
  }

  function onClick(e) {
    if (dragging && dragging.moved) return;
    const id = moduleAt(e.target);
    if (id) MK.select(id);
    else MK.select(null);
  }

  function onKey(e) {
    if (e.key === "Delete" || e.key === "Backspace") {
      if (MK.state.selection) {
        const tag = (e.target && e.target.tagName) || "";
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        MK.removeModule(MK.state.selection);
      }
    }
    if (e.key === "Escape") MK.select(null);
  }

  function onDrop(e) {
    e.preventDefault();
    dragDepth = 0;
    setDropActive(false);
    const type = e.dataTransfer && e.dataTransfer.getData("text/mk-module");
    if (!type) return;
    const sp = svgPoint(e);
    const { xIn, yIn } = MK.grid.unproject(sp.x, sp.y);
    const mod = MK.modules.create(type, MK.grid.snap(xIn), MK.grid.snap(yIn));
    const dims = MK.modules.dims(mod);
    const clamped = MK.grid.clampToRoom(mod.x, mod.y, dims.wIn, dims.dIn, MK.state.room);
    mod.x = clamped.x; mod.y = clamped.y;
    MK.upsertModule(mod);
    MK.select(mod.id);
  }

  function onDragEnter(e) {
    e.preventDefault();
    dragDepth += 1;
    setDropActive(true);
  }

  function onDragLeave(e) {
    e.preventDefault();
    dragDepth = Math.max(0, dragDepth - 1);
    if (dragDepth === 0) setDropActive(false);
  }

  return { attach };
})();
