window.MK = window.MK || {};

MK.inspector = (function () {
  let mounted = null;

  function mount(rootSelector) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    mounted = root;
    render();
    MK.subscribe(render);
  }

  function render() {
    if (!mounted || !MK.state.catalog) return;
    const sel = MK.selectedModule();
    const room = MK.state.room;
    const cat = MK.state.catalog;

    const swatches = (list, currentId, kind, labelPrefix) => list.map(s => `
      <button class="swatch material-swatch ${currentId === s.id ? "active" : ""}"
            style="--swatch:${s.hex}"
            aria-label="${escapeAttr((labelPrefix || "Material") + " " + s.label)}"
            title="${escapeAttr(s.label)} (${escapeAttr(s.texture)})"
            data-id="${escapeAttr(s.id)}" data-kind="${escapeAttr(kind)}">
        <span class="material-label">${escapeHtml(s.label)}</span>
        <span class="material-meta">${escapeHtml(s.texture)}</span>
      </button>
    `).join("");

    if (sel) {
      const finish = cat.materials.cabinetFinish;
      const counter = cat.materials.countertop;
      const backsplash = cat.materials.backsplash;

      mounted.innerHTML = `
        <div class="panel-title-wrap">
          <h3>${escapeHtml(MK.modules.label(sel))}</h3>
          <p class="panel-subtitle">Material Studio controls</p>
        </div>

        <h4>Cabinet finish</h4>
        <div class="swatch-grid studio-grid">
          ${swatches(finish, sel.finishId, "module-finish", "Cabinet finish")}
        </div>

        <h4>Countertop</h4>
        <div class="swatch-grid studio-grid">
          ${swatches(counter, sel.countertopId, "module-countertop", "Countertop")}
        </div>

        <h4>Backsplash</h4>
        <div class="swatch-grid studio-grid">
          ${swatches(backsplash, sel.backsplashId, "module-backsplash", "Backsplash")}
        </div>

        ${MK.modules.canHostOverhead(sel) ? `
          <div class="toggle-row">
            <label>Overhead cabinet above</label>
            <span class="toggle ${sel.hasOverhead ? "on" : ""}" role="switch" tabindex="0" aria-checked="${sel.hasOverhead}" data-action="toggle-overhead"></span>
          </div>
        ` : ""}

        <h4>Module actions</h4>
        <div class="action-grid">
          <button class="preset-chip action-chip" data-action="rotate">Rotate 90°</button>
          <button class="preset-chip action-chip danger" data-action="delete">Remove module</button>
        </div>
        <p class="empty-hint">Tip: apply style packs from Library for rapid concept variants.</p>
      `;
    } else {
      mounted.innerHTML = `
        <div class="panel-title-wrap">
          <h3>Properties</h3>
          <p class="panel-subtitle">Room surfaces and dimensions</p>
        </div>

        <h4>Wall finish</h4>
        <div class="swatch-grid studio-grid">${swatches(cat.materials.wall, room.wallFinishId, "room-wall", "Wall finish")}</div>

        <h4>Floor finish</h4>
        <div class="swatch-grid studio-grid">${swatches(cat.materials.floor, room.floorFinishId, "room-floor", "Floor finish")}</div>

        <h4>Dimensions</h4>
        <div class="slider-row">
          <label>Width <span class="val">${(room.widthIn/12).toFixed(1)}′</span></label>
          <input type="range" min="${cat.room.minWidthIn}" max="${cat.room.maxWidthIn}" step="6" value="${room.widthIn}" data-room="widthIn" aria-label="Room width">
        </div>
        <div class="slider-row">
          <label>Depth <span class="val">${(room.depthIn/12).toFixed(1)}′</span></label>
          <input type="range" min="${cat.room.minDepthIn}" max="${cat.room.maxDepthIn}" step="6" value="${room.depthIn}" data-room="depthIn" aria-label="Room depth">
        </div>
        <div class="slider-row">
          <label>Counter height <span class="val">${room.counterHeightIn}″</span></label>
          <input type="range" min="${cat.room.minCounterHeightIn}" max="${cat.room.maxCounterHeightIn}" step="1" value="${room.counterHeightIn}" data-room="counterHeightIn" aria-label="Counter height">
        </div>

        <h4>Overhead & chimney</h4>
        <div class="toggle-row">
          <label>Show overhead row</label>
          <span class="toggle ${MK.state.showOverheads ? "on" : ""}" role="switch" tabindex="0" aria-checked="${MK.state.showOverheads}" data-action="toggle-row-overhead"></span>
        </div>
        <div class="toggle-row">
          <label>Show chimney</label>
          <span class="toggle ${MK.state.showChimney ? "on" : ""}" role="switch" tabindex="0" aria-checked="${MK.state.showChimney}" data-action="toggle-row-chimney"></span>
        </div>

        <p class="empty-hint">Select a module to tune finish, countertop and backsplash.</p>
      `;
    }

    wire();
  }

  function wire() {
    /* Material swatches */
    mounted.querySelectorAll(".swatch[data-kind]").forEach(s => {
      const apply = () => {
        const kind = s.dataset.kind;
        const id = s.dataset.id;
        if (kind === "module-finish") {
          const m = MK.selectedModule();
          if (m) { m.finishId = id; MK.modules.normalize(m); MK.notify(); }
        } else if (kind === "module-countertop") {
          const m = MK.selectedModule();
          if (m) { m.countertopId = id; MK.modules.normalize(m); MK.notify(); }
        } else if (kind === "module-backsplash") {
          const m = MK.selectedModule();
          if (m) { m.backsplashId = id; MK.modules.normalize(m); MK.notify(); }
        } else if (kind === "room-wall") {
          MK.state.room.wallFinishId = id;
          MK.syncRoomColors();
          MK.notify();
        } else if (kind === "room-floor") {
          MK.state.room.floorFinishId = id;
          MK.syncRoomColors();
          MK.notify();
        }
      };
      s.addEventListener("click", apply);
      s.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); apply(); } });
    });

    /* Sliders — during input, notify in "canvas" scope so the inspector
     * isn't rebuilt mid-drag. On release ("change"), do a full notify so
     * the displayed val refreshes. */
    mounted.querySelectorAll("input[data-room]").forEach(inp => {
      const apply = (scope) => {
        const k = inp.dataset.room;
        MK.state.room[k] = Number(inp.value);
        for (const m of MK.state.modules) {
          const dims = MK.modules.dims(m);
          const c = MK.grid.clampToRoom(m.x, m.y, dims.wIn, dims.dIn, MK.state.room);
          m.x = c.x; m.y = c.y;
        }
        /* Update the displayed val text in place so the user sees feedback. */
        const valEl = inp.parentElement.querySelector(".val");
        if (valEl) {
          if (k === "counterHeightIn") valEl.textContent = inp.value + "″";
          else valEl.textContent = (Number(inp.value) / 12).toFixed(1) + "′";
        }
        MK.notify({ scope });
      };
      inp.addEventListener("input",  () => apply("canvas"));
      inp.addEventListener("change", () => apply("all"));
    });

    /* Toggles */
    const wireToggle = (sel, fn) => {
      const el = mounted.querySelector(sel);
      if (!el) return;
      const flip = () => fn();
      el.addEventListener("click", flip);
      el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
    };
    wireToggle('[data-action="toggle-overhead"]', () => {
      const m = MK.selectedModule(); if (m) { m.hasOverhead = !m.hasOverhead; MK.notify(); }
    });
    wireToggle('[data-action="toggle-row-overhead"]', () => {
      MK.state.showOverheads = !MK.state.showOverheads; MK.notify();
    });
    wireToggle('[data-action="toggle-row-chimney"]', () => {
      MK.state.showChimney = !MK.state.showChimney; MK.notify();
    });

    /* Action buttons */
    const rot = mounted.querySelector('[data-action="rotate"]');
    if (rot) rot.addEventListener("click", () => {
      const m = MK.selectedModule(); if (!m) return;
      m.rotation = (m.rotation + 90) % 360;
      MK.modules.normalize(m);
      const dims = MK.modules.dims(m);
      const c = MK.grid.clampToRoom(m.x, m.y, dims.wIn, dims.dIn, MK.state.room);
      m.x = c.x; m.y = c.y;
      MK.notify();
    });
    const del = mounted.querySelector('[data-action="delete"]');
    if (del) del.addEventListener("click", () => {
      if (MK.state.selection) MK.removeModule(MK.state.selection);
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  return { mount };
})();
