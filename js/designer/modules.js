window.MK = window.MK || {};

MK.modules = (function () {
  function spec(type) {
    const c = MK.state.catalog;
    if (!c) throw new Error("catalog not loaded");
    const s = c.modules[type];
    if (!s) throw new Error("unknown module type: " + type);
    return s;
  }

  function materialList(kind) {
    const c = MK.state.catalog;
    if (!c || !c.materials || !Array.isArray(c.materials[kind])) return [];
    return c.materials[kind];
  }

  function material(kind, id, fallbackId) {
    const list = materialList(kind);
    if (!list.length) return null;
    return list.find(m => m.id === id) || list.find(m => m.id === fallbackId) || list[0];
  }

  function materialHex(kind, id, fallbackId, fallbackHex = "#C9CBD0") {
    const found = material(kind, id, fallbackId);
    return found ? found.hex : fallbackHex;
  }

  function defaultMaterialId(kind) {
    const list = materialList(kind);
    return list[0] ? list[0].id : null;
  }

  function rgbFromHex(hex) {
    const h = String(hex || "").replace("#", "");
    if (h.length !== 3 && h.length !== 6) return null;
    const raw = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const n = parseInt(raw, 16);
    if (Number.isNaN(n)) return null;
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }

  function closestMaterialId(kind, hex) {
    const target = rgbFromHex(hex);
    const list = materialList(kind);
    if (!target || !list.length) return defaultMaterialId(kind);
    let best = list[0];
    let bestDist = Infinity;
    for (const m of list) {
      const c = rgbFromHex(m.hex);
      if (!c) continue;
      const d = (target.r - c.r) ** 2 + (target.g - c.g) ** 2 + (target.b - c.b) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = m;
      }
    }
    return best.id;
  }

  function create(type, xIn = 0, yIn = 0) {
    const s = spec(type);
    const finishId = s.defaultFinishId || defaultMaterialId("cabinetFinish");
    const countertopId = s.defaultCountertopId || defaultMaterialId("countertop");
    const backsplashId = s.defaultBacksplashId || defaultMaterialId("backsplash");
    return {
      id: MK.uid(),
      type,
      x: xIn, y: yIn,
      rotation: 0,
      finishId,
      countertopId,
      backsplashId,
      /* Kept for backward compatibility with older snapshots/render paths. */
      color: materialHex("cabinetFinish", finishId, defaultMaterialId("cabinetFinish")),
      hasOverhead: s.canHostOverhead && (type === "cabinet" || type === "sink" || type === "oven" || type === "dishwasher")
    };
  }

  function normalize(mod) {
    const s = spec(mod.type);
    const finishId = mod.finishId || s.defaultFinishId || closestMaterialId("cabinetFinish", mod.color);
    const countertopId = mod.countertopId || s.defaultCountertopId || defaultMaterialId("countertop");
    const backsplashId = mod.backsplashId || s.defaultBacksplashId || defaultMaterialId("backsplash");
    mod.finishId = finishId;
    mod.countertopId = countertopId;
    mod.backsplashId = backsplashId;
    mod.color = materialHex("cabinetFinish", finishId, s.defaultFinishId, mod.color || "#C9CBD0");
    if (typeof mod.rotation !== "number") mod.rotation = 0;
    if (typeof mod.hasOverhead !== "boolean") {
      mod.hasOverhead = s.canHostOverhead && (mod.type === "cabinet" || mod.type === "sink" || mod.type === "oven" || mod.type === "dishwasher");
    }
    return mod;
  }

  function dims(mod) {
    const s = spec(mod.type);
    if (mod.rotation % 180 === 0) return { wIn: s.widthIn, dIn: s.depthIn };
    return { wIn: s.depthIn, dIn: s.widthIn };
  }

  function canHostChimney(mod) { return spec(mod.type).canHostChimney; }
  function canHostOverhead(mod) { return spec(mod.type).canHostOverhead; }
  function label(mod) { return spec(mod.type).label; }

  return {
    spec,
    create,
    normalize,
    dims,
    canHostChimney,
    canHostOverhead,
    label,
    materialList,
    material,
    materialHex,
    defaultMaterialId,
    closestMaterialId
  };
})();
