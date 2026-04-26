/* Catalog: module specs, material studio, style packs, and presets.
 * Authored as JS (not JSON) so the site loads cleanly from `file://`
 * without a local server. Same shape as a JSON manifest. */
window.MK = window.MK || {};

MK.catalog = {
  gridInches: 6,
  room: {
    minWidthIn: 96, maxWidthIn: 216,
    minDepthIn: 96, maxDepthIn: 168,
    defaultWidthIn: 156, defaultDepthIn: 126,
    minCounterHeightIn: 30, maxCounterHeightIn: 40,
    defaultCounterHeightIn: 36,
    defaultWallFinishId: "wall_linen_milk",
    defaultFloorFinishId: "floor_honey_oak"
  },
  materials: {
    cabinetFinish: [
      { id: "cab_lacquer_almond", label: "Almond Lacquer", hex: "#F1EAE0", texture: "lacquer" },
      { id: "cab_walnut_smoke", label: "Smoked Walnut", hex: "#87684F", texture: "wood-grain" },
      { id: "cab_sand_matte", label: "Sand Matte", hex: "#D9C7B2", texture: "matte" },
      { id: "cab_sage_mist", label: "Sage Mist", hex: "#A8B9A7", texture: "matte" },
      { id: "cab_rose_clay", label: "Rose Clay", hex: "#C89C96", texture: "matte" },
      { id: "cab_mist_blue", label: "Mist Blue", hex: "#A5B4C2", texture: "silk" },
      { id: "cab_slate_matte", label: "Slate Mist", hex: "#78838B", texture: "matte" },
      { id: "cab_midnight_ink", label: "Deep Ink Blue", hex: "#5E6B78", texture: "eggshell" }
    ],
    countertop: [
      { id: "ct_ivory_quartz", label: "Ivory Quartz", hex: "#F2ECE3", texture: "stone" },
      { id: "ct_linen_marble", label: "Linen Marble", hex: "#E2DCD3", texture: "veined" },
      { id: "ct_travertine_cream", label: "Cream Travertine", hex: "#D4C2AA", texture: "stone" },
      { id: "ct_sandstone", label: "Sanded Beige", hex: "#CDB89D", texture: "sand" },
      { id: "ct_cloud_concrete", label: "Cloud Concrete", hex: "#BCC1C4", texture: "concrete" },
      { id: "ct_dove_terrazzo", label: "Dove Terrazzo", hex: "#D6D3CC", texture: "terrazzo" },
      { id: "ct_rose_quartz", label: "Rose Quartz", hex: "#D9C5BB", texture: "stone" },
      { id: "ct_smoke_stone", label: "Smoke Stone", hex: "#8A9098", texture: "stone" }
    ],
    backsplash: [
      { id: "bs_pearl_glass", label: "Pearl Glass", hex: "#EEF2F1", texture: "glass" },
      { id: "bs_sage_subway", label: "Sage Subway", hex: "#B9C9BF", texture: "tile" },
      { id: "bs_linen_tile", label: "Linen Tile", hex: "#E1D6C8", texture: "tile" },
      { id: "bs_clay_kitkat", label: "Clay Kit-Kat", hex: "#C8A48F", texture: "ribbed" },
      { id: "bs_aqua_mosaic", label: "Aqua Mosaic", hex: "#8DBAB5", texture: "mosaic" },
      { id: "bs_ivory_kitkat", label: "Ivory Kit-Kat", hex: "#E9E0D3", texture: "ribbed" },
      { id: "bs_cement_grid", label: "Cement Grid", hex: "#BFC4C5", texture: "cement" },
      { id: "bs_dusk_tile", label: "Dusk Tile", hex: "#9097A1", texture: "tile" }
    ],
    wall: [
      { id: "wall_porcelain_mist", label: "Porcelain Mist", hex: "#F3EFE7", texture: "limewash" },
      { id: "wall_sage_cloud", label: "Sage Cloud", hex: "#DEE6DD", texture: "matte" },
      { id: "wall_linen_milk", label: "Linen Milk", hex: "#F5F1E8", texture: "limewash" },
      { id: "wall_dawn_blush", label: "Dawn Blush", hex: "#EEDDD5", texture: "matte" },
      { id: "wall_horizon_blue", label: "Horizon Blue", hex: "#D8E5ED", texture: "matte" },
      { id: "wall_oat_cream", label: "Oat Cream", hex: "#EEE4D2", texture: "limewash" },
      { id: "wall_soft_taupe", label: "Soft Taupe", hex: "#D7CCC0", texture: "matte" },
      { id: "wall_silver_haze", label: "Silver Haze", hex: "#C5CCD2", texture: "matte" }
    ],
    floor: [
      { id: "floor_natural_oak", label: "Natural Oak", hex: "#C59B73", texture: "wood-grain" },
      { id: "floor_honey_oak", label: "Honey Oak", hex: "#D4AC82", texture: "wood-grain" },
      { id: "floor_ashwood", label: "Ash Wood", hex: "#B59C80", texture: "wood-grain" },
      { id: "floor_limestone", label: "Limestone", hex: "#DDD3C4", texture: "stone" },
      { id: "floor_dove_stone", label: "Dove Stone", hex: "#B8B8B0", texture: "stone" },
      { id: "floor_walnut_dark", label: "Dark Walnut", hex: "#8A654A", texture: "wood-grain" },
      { id: "floor_slate_stone", label: "Slate Stone", hex: "#7B8791", texture: "stone" },
      { id: "floor_charcoal", label: "Mist Cement", hex: "#969CA3", texture: "cement" }
    ]
  },
  stylePacks: [
    {
      id: "sunlit_gallery",
      label: "Sunlit Gallery",
      defaults: {
        cabinetFinish: "cab_sand_matte",
        countertop: "ct_travertine_cream",
        backsplash: "bs_ivory_kitkat",
        wall: "wall_linen_milk",
        floor: "floor_honey_oak"
      }
    },
    {
      id: "organic_sage",
      label: "Organic Sage",
      defaults: {
        cabinetFinish: "cab_sage_mist",
        countertop: "ct_linen_marble",
        backsplash: "bs_sage_subway",
        wall: "wall_sage_cloud",
        floor: "floor_natural_oak"
      }
    },
    {
      id: "soft_minimal",
      label: "Soft Minimal",
      defaults: {
        cabinetFinish: "cab_lacquer_almond",
        countertop: "ct_ivory_quartz",
        backsplash: "bs_pearl_glass",
        wall: "wall_porcelain_mist",
        floor: "floor_limestone"
      }
    },
    {
      id: "warm_natural",
      label: "Warm Natural",
      defaults: {
        cabinetFinish: "cab_walnut_smoke",
        countertop: "ct_sandstone",
        backsplash: "bs_linen_tile",
        wall: "wall_oat_cream",
        floor: "floor_honey_oak"
      }
    },
    {
      id: "modern_luxe",
      label: "Modern Luxe",
      defaults: {
        cabinetFinish: "cab_mist_blue",
        countertop: "ct_dove_terrazzo",
        backsplash: "bs_aqua_mosaic",
        wall: "wall_horizon_blue",
        floor: "floor_dove_stone"
      }
    },
    {
      id: "bold_boutique",
      label: "Bold Boutique",
      defaults: {
        cabinetFinish: "cab_rose_clay",
        countertop: "ct_rose_quartz",
        backsplash: "bs_clay_kitkat",
        wall: "wall_dawn_blush",
        floor: "floor_walnut_dark"
      }
    }
  ],
  modules: {
    cabinet: {
      label: "Cabinet",
      widthIn: 24, depthIn: 24,
      defaultFinishId: "cab_sand_matte",
      defaultCountertopId: "ct_ivory_quartz",
      defaultBacksplashId: "bs_linen_tile",
      canHostOverhead: true, canHostChimney: false, icon: "cabinet"
    },
    sink: {
      label: "Sink",
      widthIn: 30, depthIn: 24,
      defaultFinishId: "cab_lacquer_almond",
      defaultCountertopId: "ct_linen_marble",
      defaultBacksplashId: "bs_pearl_glass",
      canHostOverhead: true, canHostChimney: false, icon: "sink"
    },
    stove: {
      label: "Stove",
      widthIn: 30, depthIn: 24,
      defaultFinishId: "cab_sage_mist",
      defaultCountertopId: "ct_cloud_concrete",
      defaultBacksplashId: "bs_pearl_glass",
      canHostOverhead: false, canHostChimney: true, icon: "stove"
    },
    oven: {
      label: "Oven",
      widthIn: 30, depthIn: 24,
      defaultFinishId: "cab_mist_blue",
      defaultCountertopId: "ct_travertine_cream",
      defaultBacksplashId: "bs_ivory_kitkat",
      canHostOverhead: true, canHostChimney: false, icon: "oven"
    },
    fridge: {
      label: "Refrigerator",
      widthIn: 36, depthIn: 30,
      defaultFinishId: "cab_lacquer_almond",
      defaultCountertopId: "ct_linen_marble",
      defaultBacksplashId: "bs_sage_subway",
      canHostOverhead: false, canHostChimney: false, icon: "fridge"
    },
    dishwasher: {
      label: "Dishwasher",
      widthIn: 24, depthIn: 24,
      defaultFinishId: "cab_sand_matte",
      defaultCountertopId: "ct_ivory_quartz",
      defaultBacksplashId: "bs_linen_tile",
      canHostOverhead: true, canHostChimney: false, icon: "dishwasher"
    }
  },
  presets: {
    straight:  { label: "Straight" },
    L:         { label: "L-shape" },
    U:         { label: "U-shape" },
    parallel:  { label: "Parallel" },
    island:    { label: "Island" },
    peninsula: { label: "Peninsula" },
    gShape:    { label: "G-shape" }
  }
};
