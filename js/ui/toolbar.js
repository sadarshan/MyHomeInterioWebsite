window.MK = window.MK || {};

MK.toolbar = (function () {
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
    const cat = MK.state.catalog;
    const presets = Object.entries(cat.presets);
    const mods = Object.entries(cat.modules);
    const packs = Array.isArray(cat.stylePacks) ? cat.stylePacks : [];
    const saves = MK.persistence.listSaves();

    mounted.innerHTML = `
      <div class="panel-title-wrap">
        <h3>Library</h3>
        <p class="panel-subtitle">Layouts, style packs, modules</p>
      </div>

      <h4>Layout templates</h4>
      <div class="preset-grid" role="tablist" aria-label="Kitchen layout presets">
        ${presets.map(([k, v]) => `
          <button class="preset-chip ${MK.state.preset === k ? "active" : ""}" data-preset="${k}" role="tab" aria-selected="${MK.state.preset === k}">
            ${escapeHtml(v.label)}
          </button>
        `).join("")}
      </div>

      <h4>Style packs</h4>
      <div class="style-pack-grid">
        ${packs.map(p => `
          <button class="style-pack-chip" data-pack="${escapeAttr(p.id)}" title="Apply ${escapeAttr(p.label)}">
            <span>${escapeHtml(p.label)}</span>
          </button>
        `).join("")}
      </div>

      <h4>Modules (drag to canvas)</h4>
      <div class="module-grid">
        ${mods.map(([k, v]) => `
          <div class="module-tile" draggable="true" data-type="${k}" title="${escapeHtml(v.label)}">
            ${MK.icons[k] || ""}
            <span>${escapeHtml(v.label)}</span>
          </div>
        `).join("")}
      </div>

      <h4>Save concepts</h4>
      <div class="save-row">
        <input type="text" id="save-name" placeholder="concept name" aria-label="Concept name">
        <button class="primary" data-action="save">Save</button>
      </div>
      <div class="saved-list" aria-label="Saved design concepts">
        ${saves.length === 0 ? `<span class="empty-hint">No saved concepts yet.</span>` : ""}
        ${saves.map(n => `
          <button class="pill" data-load="${escapeAttr(n)}" title="Load ${escapeAttr(n)}">
            <span>${escapeHtml(n)}</span>
            <span class="x" data-del="${escapeAttr(n)}" title="Delete">×</span>
          </button>
        `).join("")}
      </div>
    `;

    mounted.querySelectorAll(".preset-chip").forEach(b => {
      b.addEventListener("click", () => {
        const preset = b.dataset.preset;
        MK.setState({ preset });
        MK.replaceModules(MK.presets.build(preset, MK.state.room));
      });
    });

    mounted.querySelectorAll(".style-pack-chip").forEach(b => {
      b.addEventListener("click", () => {
        MK.applyStylePack(b.dataset.pack);
      });
    });

    mounted.querySelectorAll(".module-tile").forEach(tile => {
      tile.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/mk-module", tile.dataset.type);
        e.dataTransfer.effectAllowed = "copy";
      });
    });

    const saveBtn = mounted.querySelector('[data-action="save"]');
    if (saveBtn) saveBtn.addEventListener("click", () => {
      const inp = mounted.querySelector("#save-name");
      const name = (inp && inp.value || "").trim();
      if (!name) { inp && inp.focus(); return; }
      MK.persistence.saveAs(name);
      inp.value = "";
      render();
    });

    mounted.querySelectorAll("[data-load]").forEach(el => {
      el.addEventListener("click", (ev) => {
        if (ev.target && ev.target.dataset && ev.target.dataset.del) return;
        MK.persistence.load(el.dataset.load);
      });
    });
    mounted.querySelectorAll("[data-del]").forEach(el => {
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        MK.persistence.remove(el.dataset.del);
        render();
      });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function escapeAttr(s) { return escapeHtml(s); }

  return { mount };
})();
