window.MK = window.MK || {};

MK.presets = (function () {
  function fit(mod, room) {
    const dims = MK.modules.dims(mod);
    if (dims.wIn > room.widthIn || dims.dIn > room.depthIn) return null;
    const c = MK.grid.clampToRoom(mod.x, mod.y, dims.wIn, dims.dIn, room);
    mod.x = c.x;
    mod.y = c.y;
    return mod;
  }

  function C(type, x, y, rotation) {
    const m = MK.modules.create(type, x, y);
    m.rotation = rotation || 0;
    return m;
  }

  function withStyle(mods, style) {
    if (!style) return mods;
    for (const m of mods) {
      if (style.cabinetFinish) m.finishId = style.cabinetFinish;
      if (style.countertop) m.countertopId = style.countertop;
      if (style.backsplash) m.backsplashId = style.backsplash;
      MK.modules.normalize(m);
    }
    return mods;
  }

  function build(name, room) {
    const wIn = room.widthIn, dIn = room.depthIn;
    const packs = MK.state.catalog && MK.state.catalog.stylePacks;
    const pack = packs && (packs.find(p => p.id === "sunlit_gallery") || packs[0]);
    const packDefaults = pack ? pack.defaults : null;
    let out = [];

    if (name === "straight") {
      out = [
        C("fridge", 0, 0),
        C("cabinet", 36, 0),
        C("sink", 60, 0),
        C("cabinet", 90, 0),
        C("stove", 114, 0),
        C("oven", Math.max(0, wIn - 30), 0)
      ];
    }

    if (name === "L") {
      out = [
        C("fridge",  0,            0),
        C("cabinet", 36,           0),
        C("stove",   60,           0),
        C("cabinet", 90,           0),
        C("sink",    Math.max(0, wIn - 30), 0)
      ];
      const left = [
        C("cabinet", 0, 30, 90),
        C("dishwasher", 0, 54, 90),
        C("cabinet", 0, 78, 90)
      ];
      out = out.concat(left);
    }

    if (name === "U") {
      const back = [
        C("fridge",  0,             0),
        C("cabinet", 36,            0),
        C("sink",    60,            0),
        C("cabinet", 90,            0),
        C("stove",   Math.max(0, wIn - 30), 0)
      ];
      const left = [
        C("cabinet",   0, 30, 90),
        C("dishwasher",0, 54, 90),
        C("cabinet",   0, 78, 90)
      ];
      const right = [
        C("cabinet", wIn - 24, 30, 270),
        C("oven",    wIn - 24, 54, 270),
        C("cabinet", wIn - 24, 78, 270)
      ];
      out = back.concat(left, right);
    }

    if (name === "parallel") {
      const back = [
        C("fridge", 0, 0),
        C("cabinet", 36, 0),
        C("sink", 60, 0),
        C("cabinet", 90, 0),
        C("dishwasher", Math.max(0, wIn - 24), 0)
      ];
      const front = [
        C("cabinet", 0, dIn - 24, 180),
        C("stove", 30, dIn - 24, 180),
        C("cabinet", 60, dIn - 24, 180),
        C("oven", 90, dIn - 24, 180),
        C("cabinet", Math.max(0, wIn - 24), dIn - 24, 180)
      ];
      out = back.concat(front);
    }

    if (name === "island") {
      const back = [
        C("fridge", 0, 0),
        C("cabinet", 36, 0),
        C("sink", 60, 0),
        C("stove", Math.max(0, wIn - 30), 0)
      ];
      const islandY = Math.max(36, Math.round(dIn * 0.44));
      const islandStart = Math.max(12, Math.round((wIn - 84) * 0.5));
      const island = [
        C("cabinet", islandStart, islandY, 180),
        C("cabinet", islandStart + 24, islandY, 180),
        C("oven", islandStart + 48, islandY, 180),
        C("cabinet", islandStart + 78, islandY, 180)
      ];
      out = back.concat(island);
    }

    if (name === "peninsula") {
      const back = [
        C("fridge", 0, 0),
        C("cabinet", 36, 0),
        C("sink", 60, 0),
        C("cabinet", 90, 0),
        C("stove", Math.max(0, wIn - 30), 0)
      ];
      const side = [
        C("cabinet", wIn - 24, 30, 270),
        C("dishwasher", wIn - 24, 54, 270),
        C("cabinet", wIn - 24, 78, 270)
      ];
      const penY = Math.max(30, Math.round(dIn * 0.62));
      const peninsula = [
        C("cabinet", Math.max(0, wIn - 48), penY, 180),
        C("oven", Math.max(0, wIn - 78), penY, 180),
        C("cabinet", Math.max(0, wIn - 108), penY, 180)
      ];
      out = back.concat(side, peninsula);
    }

    if (name === "gShape") {
      const back = [
        C("fridge", 0, 0),
        C("cabinet", 36, 0),
        C("sink", 60, 0),
        C("cabinet", 90, 0),
        C("stove", Math.max(0, wIn - 30), 0)
      ];
      const left = [
        C("cabinet", 0, 30, 90),
        C("dishwasher", 0, 54, 90),
        C("cabinet", 0, 78, 90)
      ];
      const right = [
        C("cabinet", wIn - 24, 30, 270),
        C("oven", wIn - 24, 54, 270)
      ];
      const bridgeY = Math.max(36, Math.round(dIn * 0.66));
      const bridge = [
        C("cabinet", 24, bridgeY, 180),
        C("cabinet", 48, bridgeY, 180),
        C("cabinet", 72, bridgeY, 180)
      ];
      out = back.concat(left, right, bridge);
    }

    out = withStyle(out, packDefaults);
    return out.map(m => fit(m, room)).filter(Boolean);
  }

  return { build };
})();
