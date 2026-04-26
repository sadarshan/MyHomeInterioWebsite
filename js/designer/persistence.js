window.MK = window.MK || {};

MK.persistence = (function () {
  const KEY_CURRENT = "mk:current";
  const KEY_INDEX   = "mk:saves";
  const SNAP_VERSION = 2;

  function snapshot() {
    return JSON.parse(JSON.stringify({
      v: SNAP_VERSION,
      room: MK.state.room,
      preset: MK.state.preset,
      modules: MK.state.modules,
      showOverheads: MK.state.showOverheads,
      showChimney: MK.state.showChimney
    }));
  }

  function migrateV1(raw) {
    if (!raw || typeof raw !== "object") return null;
    const room = { ...(raw.room || {}) };
    room.wallFinishId = room.wallFinishId
      || MK.modules.closestMaterialId("wall", room.wallColor)
      || MK.state.catalog.room.defaultWallFinishId
      || MK.modules.defaultMaterialId("wall");
    room.floorFinishId = room.floorFinishId
      || MK.modules.closestMaterialId("floor", room.floorColor)
      || MK.state.catalog.room.defaultFloorFinishId
      || MK.modules.defaultMaterialId("floor");
    room.wallColor = MK.modules.materialHex("wall", room.wallFinishId, MK.state.catalog.room.defaultWallFinishId, room.wallColor || "#F7F1E3");
    room.floorColor = MK.modules.materialHex("floor", room.floorFinishId, MK.state.catalog.room.defaultFloorFinishId, room.floorColor || "#C9A36A");

    const modules = Array.isArray(raw.modules) ? raw.modules.map(m => {
      const n = { ...m };
      n.finishId = n.finishId || MK.modules.closestMaterialId("cabinetFinish", n.color);
      n.countertopId = n.countertopId || MK.modules.defaultMaterialId("countertop");
      n.backsplashId = n.backsplashId || MK.modules.defaultMaterialId("backsplash");
      return MK.modules.normalize(n);
    }) : [];

    return {
      v: SNAP_VERSION,
      room,
      preset: raw.preset || MK.state.preset,
      modules,
      showOverheads: raw.showOverheads !== false,
      showChimney: raw.showChimney !== false
    };
  }

  function migrateSnapshot(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.v === SNAP_VERSION) return raw;
    return migrateV1(raw);
  }

  function restore(raw) {
    const snap = migrateSnapshot(raw);
    if (!snap) return;

    MK.state.room = { ...MK.state.room, ...(snap.room || {}) };
    MK.state.preset = snap.preset || MK.state.preset;
    MK.state.modules = Array.isArray(snap.modules) ? snap.modules.map(m => MK.modules.normalize(m)) : [];
    MK.state.showOverheads = snap.showOverheads !== false;
    MK.state.showChimney = snap.showChimney !== false;
    MK.state.selection = null;
    MK.ensureCatalogDefaults();
    MK.notify();
  }

  function autoSave() {
    try { localStorage.setItem(KEY_CURRENT, JSON.stringify(snapshot())); } catch (e) {}
  }

  function autoLoad() {
    try {
      const raw = localStorage.getItem(KEY_CURRENT);
      if (raw) restore(JSON.parse(raw));
    } catch (e) {}
  }

  function listSaves() {
    try {
      const idx = JSON.parse(localStorage.getItem(KEY_INDEX) || "[]");
      return Array.isArray(idx) ? idx : [];
    } catch (e) { return []; }
  }

  function saveAs(name) {
    const trimmed = (name || "").trim();
    if (!trimmed) return false;
    const idx = listSaves();
    if (!idx.includes(trimmed)) idx.push(trimmed);
    localStorage.setItem(KEY_INDEX, JSON.stringify(idx));
    localStorage.setItem("mk:save:" + trimmed, JSON.stringify(snapshot()));
    return true;
  }

  function load(name) {
    const raw = localStorage.getItem("mk:save:" + name);
    if (!raw) return false;
    restore(JSON.parse(raw));
    return true;
  }

  function remove(name) {
    const idx = listSaves().filter(n => n !== name);
    localStorage.setItem(KEY_INDEX, JSON.stringify(idx));
    localStorage.removeItem("mk:save:" + name);
  }

  return { snapshot, restore, autoSave, autoLoad, listSaves, saveAs, load, remove };
})();
