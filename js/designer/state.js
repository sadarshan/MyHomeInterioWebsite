window.MK = window.MK || {};

MK.state = {
  catalog: null,
  room: {
    widthIn: 144, depthIn: 120, counterHeightIn: 36,
    wallColor: "#F7F1E3",
    floorColor: "#C9A36A",
    wallFinishId: null,
    floorFinishId: null
  },
  preset: "L",
  modules: [],
  selection: null,
  showOverheads: true,
  showChimney: true
};

MK._subs = [];
/* opts.scope: "all" (default) re-renders every subscriber; "canvas" only the
 * subscribers tagged "canvas" — used while a slider is being dragged so the
 * inspector itself isn't rebuilt out from under the user's mouse. */
MK.subscribe = (fn, tag = "all") => { MK._subs.push({ fn, tag }); };
MK.notify = (opts = {}) => {
  const scope = opts.scope || "all";
  for (const s of MK._subs) {
    if (scope === "all" || s.tag === "canvas") s.fn(MK.state);
  }
};

MK.uid = (() => { let n = 1; return () => "m" + (n++); })();

MK.syncRoomColors = () => {
  if (!MK.state.catalog || !MK.state.catalog.materials) return;
  const wallHex = MK.modules.materialHex("wall", MK.state.room.wallFinishId, MK.state.catalog.room.defaultWallFinishId, MK.state.room.wallColor || "#F7F1E3");
  const floorHex = MK.modules.materialHex("floor", MK.state.room.floorFinishId, MK.state.catalog.room.defaultFloorFinishId, MK.state.room.floorColor || "#C9A36A");
  MK.state.room.wallColor = wallHex;
  MK.state.room.floorColor = floorHex;
};

MK.ensureCatalogDefaults = () => {
  const cat = MK.state.catalog;
  if (!cat || !MK.modules) return;
  MK.state.room.wallFinishId = MK.state.room.wallFinishId
    || MK.modules.closestMaterialId("wall", MK.state.room.wallColor)
    || cat.room.defaultWallFinishId
    || MK.modules.defaultMaterialId("wall");
  MK.state.room.floorFinishId = MK.state.room.floorFinishId
    || MK.modules.closestMaterialId("floor", MK.state.room.floorColor)
    || cat.room.defaultFloorFinishId
    || MK.modules.defaultMaterialId("floor");
  MK.syncRoomColors();
  MK.state.modules = MK.state.modules.map(m => MK.modules.normalize(m));
};

MK.setState = (patch) => {
  Object.assign(MK.state, patch);
  MK.notify();
};

MK.replaceModules = (mods) => {
  MK.state.modules = mods.map(m => MK.modules.normalize(m));
  MK.state.selection = null;
  MK.notify();
};

MK.upsertModule = (mod) => {
  const normalized = MK.modules.normalize(mod);
  const i = MK.state.modules.findIndex(m => m.id === mod.id);
  if (i === -1) MK.state.modules.push(normalized);
  else MK.state.modules[i] = normalized;
  MK.notify();
};

MK.removeModule = (id) => {
  MK.state.modules = MK.state.modules.filter(m => m.id !== id);
  if (MK.state.selection === id) MK.state.selection = null;
  MK.notify();
};

MK.select = (id) => {
  MK.state.selection = id;
  MK.notify();
};

MK.selectedModule = () => {
  return MK.state.modules.find(m => m.id === MK.state.selection) || null;
};

MK.applyStylePack = (packId) => {
  const packs = (MK.state.catalog && MK.state.catalog.stylePacks) || [];
  const pack = packs.find(p => p.id === packId);
  if (!pack) return false;
  const d = pack.defaults || {};

  MK.state.room.wallFinishId = d.wall || MK.state.room.wallFinishId;
  MK.state.room.floorFinishId = d.floor || MK.state.room.floorFinishId;
  MK.syncRoomColors();

  for (const m of MK.state.modules) {
    if (d.cabinetFinish) m.finishId = d.cabinetFinish;
    if (d.countertop) m.countertopId = d.countertop;
    if (d.backsplash) m.backsplashId = d.backsplash;
    MK.modules.normalize(m);
  }
  MK.notify();
  return true;
};
