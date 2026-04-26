window.MK = window.MK || {};

MK.renderer = (function () {
  const NS = "http://www.w3.org/2000/svg";
  const TOEKICK_IN = 4;

  function el(tag, attrs = {}, kids = []) {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      n.setAttribute(k, String(v));
    }
    for (const k of kids) if (k) n.appendChild(k);
    return n;
  }

  function shade(hex, amt) {
    const h = String(hex || "").replace("#", "");
    const raw = h.length === 3 ? h.split("").map(c => c + c).join("") : h;
    const num = parseInt(raw || "000000", 16);
    let r = (num >> 16) & 255;
    let g = (num >> 8) & 255;
    let b = num & 255;
    r = Math.max(0, Math.min(255, Math.round(r + amt)));
    g = Math.max(0, Math.min(255, Math.round(g + amt)));
    b = Math.max(0, Math.min(255, Math.round(b + amt)));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }

  function isoBox(xIn, yIn, zIn, wIn, dIn, hIn, color, opts = {}) {
    const p = MK.grid.project;
    const A = p(xIn, yIn, zIn);
    const B = p(xIn + wIn, yIn, zIn);
    const C = p(xIn + wIn, yIn + dIn, zIn);
    const D = p(xIn, yIn + dIn, zIn);
    const Ah = p(xIn, yIn, zIn + hIn);
    const Bh = p(xIn + wIn, yIn, zIn + hIn);
    const Ch = p(xIn + wIn, yIn + dIn, zIn + hIn);
    const Dh = p(xIn, yIn + dIn, zIn + hIn);

    const top = `${Ah.x},${Ah.y} ${Bh.x},${Bh.y} ${Ch.x},${Ch.y} ${Dh.x},${Dh.y}`;
    const right = `${Bh.x},${Bh.y} ${B.x},${B.y} ${C.x},${C.y} ${Ch.x},${Ch.y}`;
    const front = `${Dh.x},${Dh.y} ${Ch.x},${Ch.y} ${C.x},${C.y} ${D.x},${D.y}`;

    const stroke = opts.stroke || "#5A5047";
    const sw = opts.strokeWidth || 1.35;

    return el("g", { class: opts.cls || "module", "data-id": opts.id || null }, [
      el("polygon", { class: "face right body", points: right, fill: shade(color, -28), stroke, "stroke-width": sw, filter: "url(#painterly)" }),
      el("polygon", { class: "face front body", points: front, fill: shade(color, -14), stroke, "stroke-width": sw, filter: "url(#painterly)" }),
      el("polygon", { class: "face top body", points: top, fill: color, stroke, "stroke-width": sw, filter: "url(#painterly)" })
    ]);
  }

  function defs() {
    return el("defs", {}, [
      el("linearGradient", { id: "roomGlow", x1: "0%", y1: "0%", x2: "100%", y2: "100%" }, [
        el("stop", { offset: "0%", "stop-color": "rgba(255,255,255,0.26)" }),
        el("stop", { offset: "100%", "stop-color": "rgba(0,0,0,0.12)" })
      ]),
      el("filter", { id: "painterly", x: "-6%", y: "-6%", width: "112%", height: "112%" }, [
        el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.85", numOctaves: "2", seed: "9", result: "noise" }),
        el("feDisplacementMap", { in: "SourceGraphic", in2: "noise", scale: "1.2", xChannelSelector: "R", yChannelSelector: "G" })
      ])
    ]);
  }

  function room(state) {
    const r = state.room;
    const p = MK.grid.project;
    const A = p(0, 0, 0);
    const B = p(r.widthIn, 0, 0);
    const C = p(r.widthIn, r.depthIn, 0);
    const D = p(0, r.depthIn, 0);
    const wallH = 108;
    const ATop = p(0, 0, wallH);
    const BTop = p(r.widthIn, 0, wallH);
    const DTop = p(0, r.depthIn, wallH);

    return el("g", { class: "room" }, [
      el("polygon", {
        class: "floor",
        points: `${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y} ${D.x},${D.y}`,
        fill: r.floorColor,
        stroke: "#6A6258",
        "stroke-width": "1.2",
        filter: "url(#painterly)"
      }),
      el("polygon", {
        class: "wall back",
        points: `${A.x},${A.y} ${B.x},${B.y} ${BTop.x},${BTop.y} ${ATop.x},${ATop.y}`,
        fill: shade(r.wallColor, -5),
        stroke: "#6A6258",
        "stroke-width": "1.2",
        filter: "url(#painterly)"
      }),
      el("polygon", {
        class: "wall left",
        points: `${A.x},${A.y} ${D.x},${D.y} ${DTop.x},${DTop.y} ${ATop.x},${ATop.y}`,
        fill: r.wallColor,
        stroke: "#6A6258",
        "stroke-width": "1.2",
        filter: "url(#painterly)"
      })
    ]);
  }

  function backsplash(mod, state) {
    if (!mod.backsplashId) return null;
    const bsColor = MK.modules.materialHex("backsplash", mod.backsplashId, MK.modules.defaultMaterialId("backsplash"), "#D7CEBF");
    const { wIn, dIn } = MK.modules.dims(mod);
    const z0 = state.room.counterHeightIn + 1.5;
    const h = 16;

    const pieces = [];
    const touchesBackWall = mod.y <= 0.001;
    const touchesLeftWall = mod.x <= 0.001;
    if (touchesBackWall) {
      pieces.push(isoBox(mod.x, 0, z0, wIn, 2, h, bsColor, { cls: "backsplash" }));
    }
    if (touchesLeftWall) {
      pieces.push(isoBox(0, mod.y, z0, 2, dIn, h, bsColor, { cls: "backsplash" }));
    }
    if (!pieces.length) return null;
    return el("g", { class: "backsplash-wrap" }, pieces);
  }

  function moduleNode(mod, state) {
    const normalized = MK.modules.normalize(mod);
    const { wIn, dIn } = MK.modules.dims(normalized);
    const counter = state.room.counterHeightIn;
    const baseH = counter - 1.5;
    const isStove = normalized.type === "stove";
    const isFridge = normalized.type === "fridge";

    const finishColor = MK.modules.materialHex("cabinetFinish", normalized.finishId, MK.modules.defaultMaterialId("cabinetFinish"), normalized.color || "#C9CBD0");
    const counterColor = MK.modules.materialHex("countertop", normalized.countertopId, MK.modules.defaultMaterialId("countertop"), "#D8D3CB");

    const z0 = TOEKICK_IN;
    const selected = state.selection === normalized.id;

    const toe = isoBox(normalized.x + 1.5, normalized.y, 0, wIn - 3, dIn, z0, shade(finishColor, -22), { cls: "toekick" });

    const body = isoBox(normalized.x, normalized.y, z0, wIn, dIn, baseH - z0, finishColor, {
      id: normalized.id,
      cls: "module" + (selected ? " selected" : "")
    });

    const topPlateH = isStove ? 0.5 : 1.5;
    const topColor = isStove ? shade(counterColor, -24) : counterColor;
    const top = isoBox(normalized.x, normalized.y, baseH, wIn, dIn, topPlateH, topColor, { cls: "counter" });

    let tallTop = null;
    if (isFridge) {
      const tallH = 72 - baseH;
      tallTop = isoBox(normalized.x, normalized.y, baseH + topPlateH, wIn, dIn, tallH, finishColor, { cls: "tallbody" });
    }

    let burners = null;
    if (isStove) {
      const burnerR = 4;
      const cx1 = normalized.x + wIn * 0.30;
      const cx2 = normalized.x + wIn * 0.70;
      const cy1 = normalized.y + dIn * 0.30;
      const cy2 = normalized.y + dIn * 0.70;
      const z = baseH + topPlateH;
      const pts = [[cx1, cy1], [cx2, cy1], [cx1, cy2], [cx2, cy2]];
      burners = el("g", { class: "burners" }, pts.map(([px, py]) => {
        const c = MK.grid.project(px, py, z);
        return el("circle", {
          cx: c.x,
          cy: c.y,
          r: burnerR,
          fill: "#6E727A",
          stroke: "#4B5058",
          "stroke-width": 1
        });
      }));
    }

    let basin = null;
    if (normalized.type === "sink") {
      basin = isoBox(normalized.x + 3, normalized.y + 3, baseH + topPlateH - 2.5, wIn - 6, dIn - 6, 2.5, "#778089", { cls: "basin" });
    }

    return el("g", { class: "module-wrap", "data-id": normalized.id }, [toe, body, tallTop, top, burners, basin]);
  }

  function overhead(mod, state) {
    if (!state.showOverheads) return null;
    if (!MK.modules.canHostOverhead(mod)) return null;
    if (mod.hasOverhead === false) return null;
    if (mod.type === "fridge" || mod.type === "stove") return null;

    const { wIn } = MK.modules.dims(mod);
    const color = MK.modules.materialHex("cabinetFinish", mod.finishId, MK.modules.defaultMaterialId("cabinetFinish"), "#E2D8C7");
    const z0 = state.room.counterHeightIn + 18;
    return isoBox(mod.x, mod.y, z0, wIn, 12, 30, shade(color, -6), { cls: "overhead" });
  }

  function chimney(mod, state) {
    if (!state.showChimney) return null;
    if (!MK.modules.canHostChimney(mod)) return null;
    const { wIn } = MK.modules.dims(mod);
    const z0 = state.room.counterHeightIn + 18;
    const w = wIn - 6;
    const trunk = isoBox(mod.x + 3, mod.y + 4, z0, w, 14, 18, "#8B9097", { cls: "chimney-hood" });
    const stack = isoBox(mod.x + (wIn / 2) - 5, mod.y + 4, z0 + 18, 10, 10, 26, "#A2A7AE", { cls: "chimney-stack" });
    return el("g", { class: "chimney" }, [trunk, stack]);
  }

  function build(state) {
    const sorted = state.modules.slice().sort((a, b) => (a.y + a.x) - (b.y + b.x));
    const sceneKids = [defs(), room(state)];

    for (const m of sorted) {
      const bs = backsplash(m, state);
      if (bs) sceneKids.push(bs);
      sceneKids.push(moduleNode(m, state));
    }

    for (const m of sorted) {
      const o = overhead(m, state);
      if (o) sceneKids.push(o);
      const c = chimney(m, state);
      if (c) sceneKids.push(c);
    }

    return el("g", { class: "scene" }, sceneKids);
  }

  function viewBoxFor(state) {
    const r = state.room;
    const corners = [
      [0, 0, 0], [r.widthIn, 0, 0], [r.widthIn, r.depthIn, 0], [0, r.depthIn, 0],
      [0, 0, 108], [r.widthIn, 0, 108]
    ];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [x, y, z] of corners) {
      const p = MK.grid.project(x, y, z);
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }
    const pad = 46;
    return `${minX - pad} ${minY - pad} ${(maxX - minX) + pad * 2} ${(maxY - minY) + pad * 2}`;
  }

  function draw(svg, state) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    svg.setAttribute("viewBox", viewBoxFor(state));
    svg.setAttribute("class", "iso");
    svg.appendChild(build(state));
  }

  return { draw, isoBox, viewBoxFor };
})();
