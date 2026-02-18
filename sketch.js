let heliosLattice = [];
let heliosSystems = [];
let velas = [];
let velaRelations = [];
let relationEchoes = new Map();
let cnv;
let heliosMeta = {
  spacing: 1,
  depthMid: 1,
  depthScale: 1,
  startX: 0,
  startY: 0
};

const VELA_GROUPS = [
  { name: 'Import Modules', count: 9 },
  { name: 'The Library', count: 4 },
  { name: 'The Archive', count: 50 },
  { name: 'The Stacks', count: 10 },
  { name: 'The Something', count: 2 },
  { name: 'A.Lion', count: 6 },
  { name: 'The Ovel Node', count: 7 },
  { name: 'Pæce', count: 3 },
  { name: 'The Ritual', count: 15 },
  { name: 'RWL', count: 33 },
  { name: 'Hært', count: 40 },
  { name: 'The Void Architecture', count: 43 }
];
const VELA_GROUP_COLORS = {
  'The Library': [255, 0, 0],
  'The Archive': [0, 87, 255],
  'The Stacks': [0, 176, 80],
  'The Something': [255, 140, 0],
  'A.Lion': [128, 0, 255],
  'The Ovel Node': [0, 128, 128],
  'Pæce': [255, 215, 0],
  'The Ritual': [139, 0, 0],
  'RWL': [255, 20, 147],
  'Hært': [0, 206, 209],
  'The Void Architecture': [75, 0, 130],
  'Import Modules': [34, 139, 34]
};
const TOTAL_VELA_COUNT = VELA_GROUPS.reduce((sum, group) => sum + group.count, 0);
const VELA_MASS_MIN = 8;
const VELA_MASS_MAX = 16;
const BACKGROUND_DAY = [255, 255, 255];
const SUN_MASS = 2;
const HELIOS_ROWS = 4;
const HELIOS_COLS = 4;
const HELIOS_DEPTH = 4;
const CAMERA_DEPTH_MULTIPLIER = 5.4;
const CAMERA_PERSPECTIVE_MIN = 0.82;
const CAMERA_PERSPECTIVE_MAX = 1.18;
const TIME_SPEED_FACTOR = 0.25;
const HELIOS_YAW_SPEED = 0.0003;
const HELIOS_PITCH_SPEED = 0.0002;
const VELA_NEIGHBOR_RADIUS = 100;
const VELA_NEIGHBOR_RADIUS_SQ = VELA_NEIGHBOR_RADIUS * VELA_NEIGHBOR_RADIUS;
const VELA_HASH_CELL_SIZE = VELA_NEIGHBOR_RADIUS;
const VELA_RELATION_RADIUS = 150;
const VELA_RELATION_RADIUS_SQ = VELA_RELATION_RADIUS * VELA_RELATION_RADIUS;
const VELA_RELATION_MAX_TOTAL = 7200;
const VELA_RELATION_MIN_STRENGTH = 0.012;
const VELA_RELATION_SPRING = .019;
const VELA_RELATION_TARGET_DISTANCE = 42;
const VELA_RELATION_TARGET_SWING = 26;
const VELA_RELATION_BRAID_FORCE = 0.018;
const VELA_RELATION_VELOCITY_DAMPING = 0.024;
const VELA_RELATION_LINE_ALPHA = 245;
const VELA_RELATION_PULSE_RATE = 0.0055;
const VELA_RELATION_PHASE_RATE = 0.0027;
const VELA_RELATION_DRAW_MAX_LENGTH = 264;
const VELA_RELATION_DECAY_HALF_LIFE_MS = 18000;
const VELA_RELATION_RESIDUAL_FLOOR = 0.03;
const VELA_RELATION_BLEND = 0.38;
const SUN_FIELD_FALLOFF = 0.00002;
const SUN_FORCE_SCALE = 0.42;
const SUN_MAGNETIC_PULL = 2.6;
const SUN_MAGNETIC_BIAS = 0.55;
const SUN_MAGNETIC_SIGN = 0.75;
const SUN_TUBE_PULL = 1.0;
const SUN_SWIRL_STRENGTH = 0.8;
const SUN_BRIDGE_FLOW = 0.68;
const MATRIX_FORCE_SCALE = 0.32;
const MATRIX_NODE_LOCK = 1.0;
const MATRIX_AXIS_LOCK = 0.9;
const MATRIX_LAYER_LOCK = 1.15;
const MATRIX_CAGE_MARGIN = 0.62;
const MATRIX_SOFTBODY_INFLUENCE = 0.45;
const MATRIX_SOFTBODY_SPRING = 0.11;
const MATRIX_SOFTBODY_DAMPING = 0.3;
const MATRIX_SOFTBODY_OUTSIDE_MULT = 5.2;
const MATRIX_SOFTBODY_MAX_FORCE = 3.6;
const QUANTUM_REORIENTATION_STRENGTH = .8;
const QUANTUM_REORIENTATION_RATE = 0.0016;
const QUANTUM_POLARITY_PHASE = 1.0472;
const TRAIL_TARGET_PX = 1;
const TRAIL_MAX_PX = 1.5;
const TRAIL_SPEED_FOR_MAX = 24;
const TRAIL_WIDTH_LERP = 0.34;
const TRAIL_ALPHA = 182;
const TRAIL_WARM_DAY = [255, 96, 0];
const TRAIL_COOL_DAY = [0, 212, 255];
const BODY_WARM_DAY = [255, 144, 0];
const BODY_COOL_DAY = [0, 240, 255];
const SUN_STROKE_DAY = [255, 255, 255];
const GUIDE_WARM_DAY = [255, 64, 48];
const GUIDE_COOL_DAY = [0, 136, 255];
const GUIDE_LAYER_DAY = [0, 255, 128];
const GUIDE_ARC_SWAY_RATE = 0.0018;
const GUIDE_ARC_SWAY_PIXELS = 14;
const GUIDE_CENTER_WINDOW_RADIUS = 0.28;
const GUIDE_CENTER_SNAP_STEP = 16;
const GUIDE_CENTER_SNAP_BLEND = 0.42;
const GUIDE_CENTER_CLICK_THRESHOLD = 0.22;
const RELATION_ARC_SWAY_RATE = 0.0022;
const RELATION_ARC_SWAY_PIXELS = 8;
const GUIDE_NODE_DENSITY_NORM = 1.4;
const GUIDE_SCALE_SMOOTHING = 0.34;
const SCAFFOLD_RED = [205, 205, 205];
const SCAFFOLD_EDGE_ALPHA = 148;
const SCAFFOLD_INSET_ALPHA = 98;
const SCAFFOLD_STRUT_ALPHA = 76;
const VELA_INITIAL_SPEED = 1.12;
const CAPTURE_DURATION_MS = 60000;
const CAPTURE_FILENAME = 'matrix-cube-capture';
const CAPTURE_FPS = 30;
const VIDEO_CAPTURE_FORMATS = [
  { mimeType: 'video/mp4;codecs=avc1' },
  { mimeType: 'video/mp4;codecs=h264' },
  { mimeType: 'video/mp4' }
];
const CAPTURE_DURATION_SECONDS = CAPTURE_DURATION_MS / 1000;
const MOBILE_LAYOUT_MAX_WIDTH = 900;
const MOBILE_CENTER_FIT_WIDTH_RATIO = 0.94;
const MOBILE_CENTER_FIT_HEIGHT_RATIO = 0.9;
const MOBILE_REPO_SQUARE_MIN = 42;
const MOBILE_REPO_SQUARE_ABSOLUTE_MIN = 28;
const MOBILE_REPO_SQUARE_TIGHT_RATIO = 0.78;
const DRAG_ROTATION_SENSITIVITY = 0.005;
const DRAG_PITCH_LIMIT = Math.PI * 0.43;

let runtimeTimeSpeed = TIME_SPEED_FACTOR;
let runtimeQuantumStrength = QUANTUM_REORIENTATION_STRENGTH;
let quantumIsolationMode = false;
let isCapturingVideo = false;
let captureProgressBar = null;
let captureProgressFill = null;
let captureProgressLabel = null;
let captureProgressStatus = null;
let captureHideTimer = null;
let visualTheme = null;
let centerLogoElement = null;
let relationEchoLastRefreshMs = null;
let rotationDragState = {
  active: false,
  pointerId: null,
  lastX: 0,
  lastY: 0
};
let rotationYawOffset = 0;
let rotationPitchOffset = 0;
let interactionHandlersBound = false;
let guideXScale = [];
let guideYScale = [];
let guideZScale = [];

function setup() {
  applyPixelDensity();
  centerLogoElement = document.getElementById('centerLogo');
  cnv = createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  cnv.position(0, 0);
  cnv.style('z-index', '0');
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('pointer-events', 'none');
  bindInteractionHandlers();
  refreshVisualTheme();
  background(...visualTheme.background);
  initializeHelios();
}

function draw() {
  refreshVisualTheme();
  background(...visualTheme.background);
  updateHeliosPhysics();
  drawHeliosSystems();
}

function windowResized() {
  applyPixelDensity();
  resizeCanvas(windowWidth, windowHeight);
  initializeHelios();
}

function initializeHelios() {
  heliosLattice = createHeliosLattice(HELIOS_ROWS, HELIOS_COLS, HELIOS_DEPTH);
  heliosSystems = flattenLattice(heliosLattice);
  let spawnField = createWeightField(HELIOS_COLS, HELIOS_ROWS, HELIOS_DEPTH);
  velas = createDistributedVelas(heliosLattice, spawnField, VELA_GROUPS);
  resetGuideScales();
  relationEchoes.clear();
  relationEchoLastRefreshMs = null;
}

function refreshVisualTheme() {
  visualTheme = createVisualTheme();
  syncLogoTheme();
}

function syncLogoTheme() {
  if (!centerLogoElement) return;
  centerLogoElement.style.setProperty('--logo-invert', (205 / 255).toFixed(3));
}

function createVisualTheme() {
  return {
    dayFactor: 1,
    background: [...BACKGROUND_DAY],
    trailWarm: [...TRAIL_WARM_DAY],
    trailCool: [...TRAIL_COOL_DAY],
    bodyWarm: [...BODY_WARM_DAY],
    bodyCool: [...BODY_COOL_DAY],
    sunStroke: [...SUN_STROKE_DAY],
    guideWarm: [...GUIDE_WARM_DAY],
    guideCool: [...GUIDE_COOL_DAY],
    guideLayer: [...GUIDE_LAYER_DAY]
  };
}

function applyPixelDensity() {
  const dpr = window.devicePixelRatio || 1;
  pixelDensity(Math.min(dpr, 2));
}

function createHeliosLattice(rows, cols, depth) {
  let lattice = [];
  let spacing = computeLatticeSpacing(rows, cols);
  heliosMeta.spacing = spacing;
  heliosMeta.depthMid = (depth - 1) / 2;
  heliosMeta.depthScale = spacing * CAMERA_DEPTH_MULTIPLIER;
  let totalSpanX = spacing * (cols - 1);
  let totalSpanY = spacing * (rows - 1);
  let startX = (width - totalSpanX) / 2;
  let startY = (height - totalSpanY) / 2;
  heliosMeta.startX = startX;
  heliosMeta.startY = startY;
  for (let z = 0; z < depth; z++) {
    let layer = [];
    for (let r = 0; r < rows; r++) {
      let row = [];
      for (let c = 0; c < cols; c++) {
        let sunX = startX + c * spacing;
        let sunY = startY + r * spacing;
        let bounds = {
          x: sunX - spacing / 2,
          y: sunY - spacing / 2,
          w: spacing,
          h: spacing
        };
        row.push(createHeliosSystem(bounds, sunX, sunY, z, r, c));
      }
      layer.push(row);
    }
    lattice.push(layer);
  }
  return lattice;
}

function computeLatticeSpacing(rows, cols) {
  let baseSpacing = Math.min(width / (cols + 1), height / (rows + 1));
  if (!isMobileViewport()) {
    return baseSpacing;
  }

  // Fit the center scaffold square to viewport width on mobile while
  // allowing each lattice cell ("repo square") to resize with available space.
  let cageSpanCols = (cols - 1) + MATRIX_CAGE_MARGIN * 2;
  let cageSpanRows = (rows - 1) + MATRIX_CAGE_MARGIN * 2;
  let widthFitSpacing = (width * MOBILE_CENTER_FIT_WIDTH_RATIO) / cageSpanCols;
  let heightFitSpacing = (height * MOBILE_CENTER_FIT_HEIGHT_RATIO) / cageSpanRows;
  let fitSpacing = Math.min(widthFitSpacing, heightFitSpacing);
  let maxSpacing = baseSpacing * 1.35;
  let perCellSpace = Math.min(
    (width * MOBILE_CENTER_FIT_WIDTH_RATIO) / cols,
    (height * MOBILE_CENTER_FIT_HEIGHT_RATIO) / rows
  );
  let adaptiveMinSpacing = constrain(
    perCellSpace * MOBILE_REPO_SQUARE_TIGHT_RATIO,
    MOBILE_REPO_SQUARE_ABSOLUTE_MIN,
    MOBILE_REPO_SQUARE_MIN
  );

  return constrain(fitSpacing, adaptiveMinSpacing, maxSpacing);
}

function isMobileViewport() {
  return width <= MOBILE_LAYOUT_MAX_WIDTH;
}

function createHeliosSystem(bounds, sunX, sunY, zIndex, rowIndex, colIndex) {
  let zWorld = (zIndex - heliosMeta.depthMid) * heliosMeta.spacing;
  let polarity = ((rowIndex + colIndex + zIndex) % 2 === 0) ? 1 : -1;
  let sun = new Vela(sunX, sunY, 0, 0, SUN_MASS, true, zWorld, 0, polarity);
  return {
    sun,
    bounds,
    zIndex,
    rowIndex,
    colIndex,
    polarity,
    origin: { x: sunX, y: sunY, z: zWorld }
  };
}

function flattenLattice(lattice) {
  let flat = [];
  for (let layer of lattice) {
    for (let row of layer) {
      for (let system of row) {
        flat.push(system);
      }
    }
  }
  return flat;
}

function createDistributedVelas(lattice, field, groups) {
  let allVelas = [];
  let zJitter = heliosMeta.spacing * 0.5;
  for (let group of groups) {
    for (let i = 0; i < group.count; i++) {
      let voxel = pickWeightedVoxel(field);
      let system = lattice[voxel.z][voxel.y][voxel.x];
      let x = random(system.bounds.x, system.bounds.x + system.bounds.w);
      let y = random(system.bounds.y, system.bounds.y + system.bounds.h);
      let z = system.origin.z + random(-zJitter, zJitter);
      let v = p5.Vector.random3D();
      v.mult(VELA_INITIAL_SPEED);
      let m = random(VELA_MASS_MIN, VELA_MASS_MAX);
      let polarity = random() > 0.5 ? 1 : -1;
      let vela = new Vela(x, y, v.x, v.y, m, false, z, v.z, polarity);
      vela.groupName = group.name;
      vela.groupColor = VELA_GROUP_COLORS[group.name] || null;
      allVelas.push(vela);
    }
  }
  return allVelas;
}

function createWeightField(xCount, yCount, zCount) {
  let weights = [];
  let total = 0;
  for (let z = 0; z < zCount; z++) {
    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        let w = random(0.1, 1);
        total += w;
        weights.push(w);
      }
    }
  }
  return {
    dims: { x: xCount, y: yCount, z: zCount },
    weights,
    total
  };
}

function pickWeightedVoxel(field) {
  let target = random(field.total);
  let accum = 0;
  for (let i = 0; i < field.weights.length; i++) {
    accum += field.weights[i];
    if (accum >= target) {
      let x = i % field.dims.x;
      let y = Math.floor(i / field.dims.x) % field.dims.y;
      let z = Math.floor(i / (field.dims.x * field.dims.y));
      return { x, y, z };
    }
  }
  return { x: 0, y: 0, z: 0 };
}

function updateHeliosPhysics() {
  let timeScale = simulationTimeScale();
  let spatialGrid = buildVelaSpatialGrid(velas, VELA_HASH_CELL_SIZE);
  let indexByVela = new Map();
  let seenPairs = new Set();
  velaRelations = [];
  for (let i = 0; i < velas.length; i++) {
    indexByVela.set(velas[i], i);
  }

  for (let system of heliosSystems) {
    system.sun.beginSwell();
  }

  for (let i = 0; i < velas.length; i++) {
    let vela = velas[i];
    applySunLensingForce(vela, timeScale, !quantumIsolationMode);
    if (!quantumIsolationMode) {
      let neighbors = findNearbyVelas(vela, spatialGrid, VELA_HASH_CELL_SIZE);
      for (let other of neighbors) {
        let dSq = squaredDistance3D(vela.pos, other.pos);
        if (vela !== other && dSq <= VELA_NEIGHBOR_RADIUS_SQ) {
          vela.attract(other, timeScale);
        }
        if (vela !== other && dSq <= VELA_RELATION_RADIUS_SQ) {
          let j = indexByVela.get(other);
          if (j !== undefined && j > i) {
            registerVelaRelation(vela, other, dSq, timeScale, seenPairs, i, j);
          }
        }
      }
    }
  }

  if (velaRelations.length > VELA_RELATION_MAX_TOTAL) {
    velaRelations.sort((a, b) => b.strength - a.strength);
    velaRelations = velaRelations.slice(0, VELA_RELATION_MAX_TOTAL);
  }

  refreshRelationEchoes();

  for (let system of heliosSystems) {
    system.sun.applySwell();
  }

  for (let vela of velas) {
    vela.update(timeScale);
  }
  updateGuideScales();
}

function resetGuideScales() {
  guideXScale = Array.from(
    { length: HELIOS_DEPTH },
    () => Array.from(
      { length: HELIOS_ROWS },
      () => new Array(max(0, HELIOS_COLS - 1)).fill(0)
    )
  );
  guideYScale = Array.from(
    { length: HELIOS_DEPTH },
    () => Array.from(
      { length: max(0, HELIOS_ROWS - 1) },
      () => new Array(HELIOS_COLS).fill(0)
    )
  );
  guideZScale = Array.from(
    { length: max(0, HELIOS_DEPTH - 1) },
    () => Array.from(
      { length: HELIOS_ROWS },
      () => new Array(HELIOS_COLS).fill(0)
    )
  );
}

function updateGuideScales() {
  if (guideXScale.length === 0 && guideYScale.length === 0 && guideZScale.length === 0) return;
  let spacing = heliosMeta.spacing;
  let zStart = -heliosMeta.depthMid * spacing;
  let nodeDensity = Array.from(
    { length: HELIOS_DEPTH },
    () => Array.from(
      { length: HELIOS_ROWS },
      () => new Array(HELIOS_COLS).fill(0)
    )
  );

  for (let vela of velas) {
    let fx = (vela.pos.x - heliosMeta.startX) / spacing;
    let fy = (vela.pos.y - heliosMeta.startY) / spacing;
    let fz = (vela.pos.z - zStart) / spacing;
    let x0 = Math.floor(fx);
    let y0 = Math.floor(fy);
    let z0 = Math.floor(fz);
    let tx = fx - x0;
    let ty = fy - y0;
    let tz = fz - z0;

    for (let dz = 0; dz <= 1; dz++) {
      for (let dy = 0; dy <= 1; dy++) {
        for (let dx = 0; dx <= 1; dx++) {
          let ix = x0 + dx;
          let iy = y0 + dy;
          let iz = z0 + dz;
          if (ix < 0 || ix >= HELIOS_COLS) continue;
          if (iy < 0 || iy >= HELIOS_ROWS) continue;
          if (iz < 0 || iz >= HELIOS_DEPTH) continue;
          let wx = dx === 0 ? (1 - tx) : tx;
          let wy = dy === 0 ? (1 - ty) : ty;
          let wz = dz === 0 ? (1 - tz) : tz;
          nodeDensity[iz][iy][ix] += wx * wy * wz;
        }
      }
    }
  }

  for (let z = 0; z < HELIOS_DEPTH; z++) {
    for (let row = 0; row < HELIOS_ROWS; row++) {
      for (let col = 0; col < HELIOS_COLS - 1; col++) {
        let density = (nodeDensity[z][row][col] + nodeDensity[z][row][col + 1]) * 0.5;
        let target = constrain(density / GUIDE_NODE_DENSITY_NORM, 0, 1);
        guideXScale[z][row][col] = lerp(guideXScale[z][row][col], target, GUIDE_SCALE_SMOOTHING);
      }
    }
  }

  for (let z = 0; z < HELIOS_DEPTH; z++) {
    for (let row = 0; row < HELIOS_ROWS - 1; row++) {
      for (let col = 0; col < HELIOS_COLS; col++) {
        let density = (nodeDensity[z][row][col] + nodeDensity[z][row + 1][col]) * 0.5;
        let target = constrain(density / GUIDE_NODE_DENSITY_NORM, 0, 1);
        guideYScale[z][row][col] = lerp(guideYScale[z][row][col], target, GUIDE_SCALE_SMOOTHING);
      }
    }
  }

  for (let z = 0; z < HELIOS_DEPTH - 1; z++) {
    for (let row = 0; row < HELIOS_ROWS; row++) {
      for (let col = 0; col < HELIOS_COLS; col++) {
        let density = (nodeDensity[z][row][col] + nodeDensity[z + 1][row][col]) * 0.5;
        let target = constrain(density / GUIDE_NODE_DENSITY_NORM, 0, 1);
        guideZScale[z][row][col] = lerp(guideZScale[z][row][col], target, GUIDE_SCALE_SMOOTHING);
      }
    }
  }
}

function applySunLensingForce(vela, timeScale = 1, enableConfinement = true) {
  let nearest = null;
  let second = null;
  let nearestSq = Infinity;
  let secondSq = Infinity;

  for (let system of heliosSystems) {
    let toSun = p5.Vector.sub(system.sun.pos, vela.pos);
    let dSq = toSun.magSq();
    system.sun.registerInfluence(dSq, vela.mass);
    if (dSq < nearestSq) {
      second = nearest;
      secondSq = nearestSq;
      nearest = system;
      nearestSq = dSq;
    } else if (dSq < secondSq) {
      second = system;
      secondSq = dSq;
    }
  }

  if (!nearest) return;

  let toNearest = p5.Vector.sub(nearest.sun.pos, vela.pos);
  if (toNearest.magSq() > 0) {
    let toNearestDir = toNearest.copy().normalize();
    let toNearestReoriented = applyQuantumReorientation(toNearestDir, vela);
    toNearest = p5.Vector.mult(toNearestReoriented, toNearest.mag());
  }
  let nearestStrength = SUN_MAGNETIC_PULL / (1 + nearestSq * SUN_FIELD_FALLOFF);
  let poleMatch = vela.polarity * nearest.polarity;
  let magneticScale = SUN_MAGNETIC_BIAS + (poleMatch < 0 ? SUN_MAGNETIC_SIGN : -SUN_MAGNETIC_SIGN);
  toNearest.setMag(nearestStrength * magneticScale * SUN_FORCE_SCALE * timeScale);
  vela.applyForce(toNearest);

  if (!second) {
    if (enableConfinement) {
      applyMatrixConfinementForce(vela, nearest, nearestSq, timeScale);
    }
    return;
  }

  let bridge = p5.Vector.sub(second.sun.pos, nearest.sun.pos);
  let bridgeMagSq = bridge.magSq();
  if (bridgeMagSq === 0) return;

  let velaFromA = p5.Vector.sub(vela.pos, nearest.sun.pos);
  let t = p5.Vector.dot(velaFromA, bridge) / bridgeMagSq;
  t = constrain(t, 0, 1);

  let closestPoint = p5.Vector.add(nearest.sun.pos, p5.Vector.mult(bridge, t));
  let tubeVector = p5.Vector.sub(closestPoint, vela.pos);
  let avgSq = (nearestSq + secondSq) * 0.5;
  let lens = 1 / (1 + avgSq * SUN_FIELD_FALLOFF * 1.5);

  if (tubeVector.magSq() > 0) {
    let pairOpposite = nearest.polarity * second.polarity < 0;
    let tubeStrength = SUN_TUBE_PULL * lens * (pairOpposite ? 1.2 : 0.55) * SUN_FORCE_SCALE * timeScale;
    tubeVector.setMag(tubeStrength);
    vela.applyForce(tubeVector);
  }

  let bridgeDir = bridge.copy().normalize();
  let bridgeDirReoriented = applyQuantumReorientation(bridgeDir, vela);
  let radial = p5.Vector.sub(closestPoint, vela.pos);
  if (radial.magSq() > 0) {
    let radialDir = radial.copy().normalize();
    let swirl = bridgeDirReoriented.cross(radialDir);
    if (swirl.magSq() > 0) {
      let centerBoost = 1 - abs(t - 0.5) * 2;
      let swirlSign = nearest.polarity * second.polarity * vela.polarity;
      swirl.setMag(SUN_SWIRL_STRENGTH * lens * centerBoost * swirlSign * SUN_FORCE_SCALE * timeScale);
      vela.applyForce(swirl);
    }
  }

  let distA = sqrt(nearestSq);
  let distB = sqrt(secondSq);
  let handoff = (distA - distB) / max(distA + distB, 0.0001);
  let bridgeFlow = bridgeDirReoriented.mult(-handoff * SUN_BRIDGE_FLOW * lens * SUN_FORCE_SCALE * timeScale);
  vela.applyForce(bridgeFlow);

  if (enableConfinement) {
    applyMatrixConfinementForce(vela, nearest, nearestSq, timeScale);
  }
}

function applyMatrixConfinementForce(vela, nearestSystem, nearestSq, timeScale = 1) {
  if (!nearestSystem) return;

  let spacing = heliosMeta.spacing;
  let zStart = -heliosMeta.depthMid * spacing;

  let gridX = nearestGridValue(vela.pos.x, heliosMeta.startX, spacing, HELIOS_COLS);
  let gridY = nearestGridValue(vela.pos.y, heliosMeta.startY, spacing, HELIOS_ROWS);
  let gridZ = nearestGridValue(vela.pos.z, zStart, spacing, HELIOS_DEPTH);

  let nodePull = p5.Vector.sub(nearestSystem.sun.pos, vela.pos);
  if (nodePull.magSq() > 0) {
    let nodeStrength = (MATRIX_NODE_LOCK / (1 + nearestSq * SUN_FIELD_FALLOFF * 1.5)) * MATRIX_FORCE_SCALE * timeScale;
    nodePull.setMag(nodeStrength);
    vela.applyForce(nodePull);
  }

  let axisTarget = createVector(gridX, gridY, gridZ);
  let axisPull = p5.Vector.sub(axisTarget, vela.pos);
  let axisSq = axisPull.magSq();
  if (axisSq > 0) {
    let axisStrength = (MATRIX_AXIS_LOCK / (1 + axisSq * SUN_FIELD_FALLOFF * 1.5)) * MATRIX_FORCE_SCALE * timeScale;
    axisPull.setMag(axisStrength);
    vela.applyForce(axisPull);
  }

  let layerDelta = gridZ - vela.pos.z;
  vela.applyForce(createVector(0, 0, layerDelta * MATRIX_LAYER_LOCK * 0.02 * MATRIX_FORCE_SCALE * timeScale));

  let cageBounds = getMatrixCageBounds();
  let minX = cageBounds.minX;
  let maxX = cageBounds.maxX;
  let minY = cageBounds.minY;
  let maxY = cageBounds.maxY;
  let minZ = cageBounds.minZ;
  let maxZ = cageBounds.maxZ;

  let cageForce = computeSoftBodyCageForce(vela, minX, maxX, minY, maxY, minZ, maxZ, spacing);
  if (cageForce.magSq() > 0) {
    if (cageForce.magSq() > MATRIX_SOFTBODY_MAX_FORCE * MATRIX_SOFTBODY_MAX_FORCE) {
      cageForce.setMag(MATRIX_SOFTBODY_MAX_FORCE);
    }
    cageForce.mult(MATRIX_FORCE_SCALE * timeScale);
    vela.applyForce(cageForce);
  }
}

function computeSoftBodyCageForce(vela, minX, maxX, minY, maxY, minZ, maxZ, spacing) {
  let influence = max(spacing * MATRIX_SOFTBODY_INFLUENCE, 1);
  let cageForce = createVector(0, 0, 0);

  applySoftBodyFaceForce(cageForce, vela.pos.x - minX, vela.vel.x, 1, influence);
  applySoftBodyFaceForce(cageForce, maxX - vela.pos.x, -vela.vel.x, -1, influence);
  applySoftBodyFaceForce(cageForce, vela.pos.y - minY, vela.vel.y, 1, influence, 'y');
  applySoftBodyFaceForce(cageForce, maxY - vela.pos.y, -vela.vel.y, -1, influence, 'y');
  applySoftBodyFaceForce(cageForce, vela.pos.z - minZ, vela.vel.z, 1, influence, 'z');
  applySoftBodyFaceForce(cageForce, maxZ - vela.pos.z, -vela.vel.z, -1, influence, 'z');

  return cageForce;
}

function applySoftBodyFaceForce(outForce, signedDistance, normalVelocity, directionSign, influence, axis = 'x') {
  if (signedDistance >= influence) return;

  let compression = 1 - (signedDistance / influence);
  let outside = signedDistance < 0 ? 1 + ((-signedDistance) / influence) : 1;
  let springForce = compression * MATRIX_SOFTBODY_SPRING * outside * (signedDistance < 0 ? MATRIX_SOFTBODY_OUTSIDE_MULT : 1);
  let dampingForce = max(0, -normalVelocity) * MATRIX_SOFTBODY_DAMPING;
  let totalForce = (springForce + dampingForce) * directionSign;

  if (axis === 'x') outForce.x += totalForce;
  if (axis === 'y') outForce.y += totalForce;
  if (axis === 'z') outForce.z += totalForce;
}

function applyQuantumReorientation(baseDirection, vela) {
  let phase = simulationTimeMs() * QUANTUM_REORIENTATION_RATE + (vela.polarity * QUANTUM_POLARITY_PHASE);
  let shift = Math.sin(phase) * runtimeQuantumStrength;
  if (shift === 0) return baseDirection;

  let seedAxis = createVector(0.33, 0.77, 0.53);
  let ortho = baseDirection.copy().cross(seedAxis);
  if (ortho.magSq() < 0.000001) {
    ortho = baseDirection.copy().cross(createVector(0.12, 0.98, 0.14));
  }
  if (ortho.magSq() < 0.000001) return baseDirection;

  ortho.normalize();
  let aligned = p5.Vector.mult(baseDirection, 1 - abs(shift));
  let displaced = p5.Vector.mult(ortho, shift);
  let blended = p5.Vector.add(aligned, displaced);
  if (blended.magSq() === 0) return baseDirection;
  blended.normalize();
  return blended;
}

function registerVelaRelation(a, b, dSq, timeScale, seenPairs, i, j) {
  let pairKey = `${i}:${j}`;
  if (seenPairs.has(pairKey)) return;
  seenPairs.add(pairKey);

  let d = sqrt(max(dSq, 0.0001));
  let aVel = a.vel.copy();
  let bVel = b.vel.copy();
  let aSpeed = aVel.mag();
  let bSpeed = bVel.mag();
  let velDot = 0;
  if (aSpeed > 0.0001 && bSpeed > 0.0001) {
    velDot = aVel.normalize().dot(bVel.normalize());
  }

  let proximity = 1 - (dSq / VELA_RELATION_RADIUS_SQ);
  let polarityAffinity = a.polarity === b.polarity ? 1 : 0.68;
  let phase = sin(simulationTimeMs() * VELA_RELATION_PHASE_RATE + (i + j) * 0.07);
  let coherence = ((velDot + 1) * 0.5) * polarityAffinity;
  let strength = proximity * coherence * (0.65 + 0.35 * abs(phase));
  if (strength < VELA_RELATION_MIN_STRENGTH) return;

  let dir = p5.Vector.sub(b.pos, a.pos);
  if (dir.magSq() < 0.000001) return;
  dir.normalize();

  let targetDistance = VELA_RELATION_TARGET_DISTANCE + phase * VELA_RELATION_TARGET_SWING;
  let springMag = (d - targetDistance) * VELA_RELATION_SPRING * strength * timeScale;
  let springForce = dir.copy().mult(springMag);
  a.applyForce(springForce);
  b.applyForce(springForce.copy().mult(-1));

  let relativeVelocity = p5.Vector.sub(b.vel, a.vel);
  let alongLinkVelocity = p5.Vector.dot(relativeVelocity, dir);
  let dampingForce = dir.copy().mult(alongLinkVelocity * VELA_RELATION_VELOCITY_DAMPING * strength * timeScale);
  a.applyForce(dampingForce);
  b.applyForce(dampingForce.copy().mult(-1));

  let braidAxis = createVector(0, 0, 1);
  let tangent = dir.copy().cross(braidAxis);
  if (tangent.magSq() < 0.000001) tangent = dir.copy().cross(createVector(0, 1, 0));
  if (tangent.magSq() > 0.000001) {
    tangent.normalize();
    let braidMag = VELA_RELATION_BRAID_FORCE * phase * strength * timeScale;
    let braidForce = tangent.mult(braidMag);
    a.applyForce(braidForce);
    b.applyForce(braidForce.copy().mult(-1));
  }

  velaRelations.push({
    key: pairKey,
    a,
    b,
    strength,
    seed: (i * 73856093) ^ (j * 19349663)
  });
}

function refreshRelationEchoes() {
  let now = simulationTimeMs();
  if (relationEchoLastRefreshMs === null) relationEchoLastRefreshMs = now;
  let deltaMs = max(0, now - relationEchoLastRefreshMs);
  relationEchoLastRefreshMs = now;
  let decay = pow(0.5, deltaMs / VELA_RELATION_DECAY_HALF_LIFE_MS);
  let activeKeys = new Set();

  for (let relation of velaRelations) {
    activeKeys.add(relation.key);
    let existing = relationEchoes.get(relation.key);
    if (existing) {
      existing.a = relation.a;
      existing.b = relation.b;
      existing.seed = relation.seed;
      existing.lastSeenMs = now;
      existing.strength = lerp(existing.strength, relation.strength, VELA_RELATION_BLEND);
    } else {
      relationEchoes.set(relation.key, {
        key: relation.key,
        a: relation.a,
        b: relation.b,
        seed: relation.seed,
        strength: max(relation.strength, VELA_RELATION_RESIDUAL_FLOOR),
        lastSeenMs: now
      });
    }
  }

  for (let [key, echo] of relationEchoes.entries()) {
    if (activeKeys.has(key)) continue;
    echo.strength = max(echo.strength * decay, VELA_RELATION_RESIDUAL_FLOOR);
  }
}

function simulationTimeMs() {
  return millis() * runtimeTimeSpeed;
}

function simulationTimeScale() {
  return constrain(runtimeTimeSpeed, 0.1, 2.5);
}

function bindInteractionHandlers() {
  if (interactionHandlersBound) return;
  interactionHandlersBound = true;
  document.body.style.touchAction = 'none';

  window.addEventListener('mousedown', event => {
    beginRotationDrag(event.clientX, event.clientY, 'mouse');
  });

  window.addEventListener('mousemove', event => {
    updateRotationDrag(event.clientX, event.clientY, 'mouse');
  });

  window.addEventListener('mouseup', () => {
    endRotationDrag('mouse');
  });

  window.addEventListener('mouseleave', () => {
    endRotationDrag('mouse');
  });

  window.addEventListener('touchstart', event => {
    if (!event.changedTouches || event.changedTouches.length === 0) return;
    let touch = event.changedTouches[0];
    beginRotationDrag(touch.clientX, touch.clientY, touch.identifier);
    event.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', event => {
    if (!rotationDragState.active) return;
    for (let touch of event.changedTouches) {
      if (touch.identifier === rotationDragState.pointerId) {
        updateRotationDrag(touch.clientX, touch.clientY, touch.identifier);
        event.preventDefault();
        break;
      }
    }
  }, { passive: false });

  window.addEventListener('touchend', event => {
    for (let touch of event.changedTouches) {
      if (touch.identifier === rotationDragState.pointerId) {
        endRotationDrag(touch.identifier);
        break;
      }
    }
  });

  window.addEventListener('touchcancel', event => {
    for (let touch of event.changedTouches) {
      if (touch.identifier === rotationDragState.pointerId) {
        endRotationDrag(touch.identifier);
        break;
      }
    }
  });
}

function beginRotationDrag(clientX, clientY, pointerId) {
  rotationDragState.active = true;
  rotationDragState.pointerId = pointerId;
  rotationDragState.lastX = clientX;
  rotationDragState.lastY = clientY;
}

function updateRotationDrag(clientX, clientY, pointerId) {
  if (!rotationDragState.active) return;
  if (rotationDragState.pointerId !== pointerId) return;
  let dx = clientX - rotationDragState.lastX;
  let dy = clientY - rotationDragState.lastY;
  rotationDragState.lastX = clientX;
  rotationDragState.lastY = clientY;

  rotationYawOffset += dx * DRAG_ROTATION_SENSITIVITY;
  rotationPitchOffset -= dy * DRAG_ROTATION_SENSITIVITY;
  rotationPitchOffset = constrain(rotationPitchOffset, -DRAG_PITCH_LIMIT, DRAG_PITCH_LIMIT);
}

function endRotationDrag(pointerId) {
  if (!rotationDragState.active) return;
  if (rotationDragState.pointerId !== pointerId) return;
  rotationDragState.active = false;
  rotationDragState.pointerId = null;
}

function keyPressed() {
  if (key === 'g' || key === 'G') captureMov();
}

async function captureMov() {
  if (isCapturingVideo) return;
  isCapturingVideo = true;
  showCaptureProgress('Preparing capture...', 0, 'Starting recorder');
  let progressIntervalId = null;
  let recordStartMs = 0;
  try {
    if (!cnv || !cnv.elt || typeof cnv.elt.captureStream !== 'function') {
      showCaptureProgress('Capture unavailable', 1, 'Canvas capture is unsupported');
      scheduleHideCaptureProgress();
      console.error('Video capture is not supported: canvas captureStream is unavailable.');
      return;
    }
    if (typeof MediaRecorder === 'undefined') {
      showCaptureProgress('Capture unavailable', 1, 'MediaRecorder is unsupported');
      scheduleHideCaptureProgress();
      console.error('Video capture is not supported: MediaRecorder is unavailable.');
      return;
    }

    const stream = cnv.elt.captureStream(CAPTURE_FPS);
    const selectedFormat = pickSupportedVideoFormat();
    if (!selectedFormat) {
      showCaptureProgress('Capture unavailable', 1, 'MP4 recording is unsupported in this browser');
      scheduleHideCaptureProgress();
      stream.getTracks().forEach(track => track.stop());
      console.error('MP4 capture is not supported by this browser.');
      return;
    }
    let recorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: selectedFormat.mimeType });
    } catch (error) {
      showCaptureProgress('Capture failed', 1, 'Unable to start recorder');
      scheduleHideCaptureProgress();
      console.error('Unable to start video recorder:', error);
      stream.getTracks().forEach(track => track.stop());
      return;
    }

    const chunks = [];
    recorder.ondataavailable = event => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };

    const recordingFinished = new Promise(resolve => {
      recorder.onstop = resolve;
    });

    recordStartMs = performance.now();
    showCaptureProgress(`Recording ${CAPTURE_DURATION_SECONDS}s...`, 0, '0%');
    progressIntervalId = setInterval(() => {
      let elapsed = performance.now() - recordStartMs;
      let progress = constrain(elapsed / CAPTURE_DURATION_MS, 0, 0.96);
      let percent = Math.round(progress * 100);
      showCaptureProgress(`Recording ${CAPTURE_DURATION_SECONDS}s...`, progress, `${percent}%`);
    }, 100);

    recorder.start(250);
    setTimeout(() => {
      if (recorder.state !== 'inactive') recorder.stop();
    }, CAPTURE_DURATION_MS);

    await recordingFinished;
    if (progressIntervalId) clearInterval(progressIntervalId);
    stream.getTracks().forEach(track => track.stop());
    showCaptureProgress('Finalizing video...', 0.98, 'Packaging file');

    if (!chunks.length) {
      showCaptureProgress('Capture failed', 1, 'No video data generated');
      scheduleHideCaptureProgress();
      console.error('Video capture produced no video data.');
      return;
    }

    const blobType = selectedFormat.mimeType;
    const blob = new Blob(chunks, { type: blobType });
    downloadBlob(blob, `${CAPTURE_FILENAME}.mp4`);
    showCaptureProgress('Capture complete', 1, 'Saved .mp4');
    scheduleHideCaptureProgress();
  } catch (error) {
    showCaptureProgress('Capture failed', 1, 'See console for details');
    scheduleHideCaptureProgress();
    console.error('Video capture failed:', error);
  } finally {
    if (progressIntervalId) clearInterval(progressIntervalId);
    isCapturingVideo = false;
  }
}

function pickSupportedVideoFormat() {
  for (let format of VIDEO_CAPTURE_FORMATS) {
    if (MediaRecorder.isTypeSupported(format.mimeType)) return format;
  }
  return null;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function showCaptureProgress(label, progress = 0, status = '') {
  ensureCaptureProgressUi();
  if (!captureProgressBar || !captureProgressFill || !captureProgressLabel || !captureProgressStatus) return;

  if (captureHideTimer) {
    clearTimeout(captureHideTimer);
    captureHideTimer = null;
  }
  captureProgressBar.classList.add('is-visible');
  captureProgressLabel.textContent = label;
  captureProgressStatus.textContent = status;
  captureProgressFill.style.width = `${constrain(progress, 0, 1) * 100}%`;
}

function scheduleHideCaptureProgress(delayMs = 2000) {
  if (captureHideTimer) clearTimeout(captureHideTimer);
  captureHideTimer = setTimeout(() => {
    if (!captureProgressBar) return;
    captureProgressBar.classList.remove('is-visible');
    captureHideTimer = null;
  }, delayMs);
}

function ensureCaptureProgressUi() {
  if (captureProgressBar) return;

  captureProgressBar = document.createElement('div');
  captureProgressBar.id = 'captureProgress';

  let textWrap = document.createElement('div');
  textWrap.className = 'captureProgressText';

  captureProgressLabel = document.createElement('div');
  captureProgressLabel.className = 'captureProgressLabel';

  captureProgressStatus = document.createElement('div');
  captureProgressStatus.className = 'captureProgressStatus';

  let track = document.createElement('div');
  track.className = 'captureProgressTrack';

  captureProgressFill = document.createElement('div');
  captureProgressFill.className = 'captureProgressFill';

  track.appendChild(captureProgressFill);
  textWrap.appendChild(captureProgressLabel);
  textWrap.appendChild(captureProgressStatus);
  captureProgressBar.appendChild(textWrap);
  captureProgressBar.appendChild(track);
  document.body.appendChild(captureProgressBar);
}

function nearestGridValue(value, start, step, count) {
  let index = Math.round((value - start) / step);
  index = constrain(index, 0, count - 1);
  return start + index * step;
}

function buildVelaSpatialGrid(items, cellSize) {
  let grid = new Map();
  for (let body of items) {
    let key = hashGridCell(body.pos.x, body.pos.y, body.pos.z, cellSize);
    if (!grid.has(key)) {
      grid.set(key, []);
    }
    grid.get(key).push(body);
  }
  return grid;
}

function findNearbyVelas(vela, grid, cellSize) {
  let results = [];
  let baseX = Math.floor(vela.pos.x / cellSize);
  let baseY = Math.floor(vela.pos.y / cellSize);
  let baseZ = Math.floor(vela.pos.z / cellSize);
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        let key = gridCellKey(baseX + dx, baseY + dy, baseZ + dz);
        let cellItems = grid.get(key);
        if (cellItems) {
          results.push(...cellItems);
        }
      }
    }
  }
  return results;
}

function hashGridCell(x, y, z, cellSize) {
  let gx = Math.floor(x / cellSize);
  let gy = Math.floor(y / cellSize);
  let gz = Math.floor(z / cellSize);
  return gridCellKey(gx, gy, gz);
}

function gridCellKey(gx, gy, gz) {
  return `${gx},${gy},${gz}`;
}

function squaredDistance3D(a, b) {
  let dx = a.x - b.x;
  let dy = a.y - b.y;
  let dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

function projectWorldPoint(x, y, z) {
  let centerX = width / 2;
  let centerY = height / 2;
  let x0 = x - centerX;
  let y0 = y - centerY;
  let z0 = z;
  let t = simulationTimeMs();
  let yaw = t * HELIOS_YAW_SPEED + rotationYawOffset;
  let pitch = t * HELIOS_PITCH_SPEED + rotationPitchOffset;
  let cosY = Math.cos(yaw);
  let sinY = Math.sin(yaw);
  let cosP = Math.cos(pitch);
  let sinP = Math.sin(pitch);
  let x1 = x0 * cosY + z0 * sinY;
  let z1 = -x0 * sinY + z0 * cosY;
  let y2 = y0 * cosP - z1 * sinP;
  let z2 = y0 * sinP + z1 * cosP;
  let depthScale = heliosMeta.depthScale || 1;
  let perspective = depthScale / (depthScale - z2);
  perspective = constrain(perspective, CAMERA_PERSPECTIVE_MIN, CAMERA_PERSPECTIVE_MAX);
  let screenX = centerX + x1 * perspective;
  let screenY = centerY + y2 * perspective;
  let alpha = constrain(1 - (z2 / (depthScale * 2.5)), 0.5, 1);
  return { screenX, screenY, scale: perspective, alpha, depth: z2 };
}

function drawHeliosSystems() {
  let renderables = [];
  let projectionByVela = new Map();
  let projectionBySystem = new Map();

  for (let system of heliosSystems) {
    let projection = projectWorldPoint(system.sun.pos.x, system.sun.pos.y, system.sun.pos.z);
    projectionBySystem.set(system, projection);
    renderables.push({ body: system.sun, projection });
  }

  drawScaffoldCube();
  drawLatticeGuides(projectionBySystem);

  for (let vela of velas) {
    drawProjectedTrail(vela);
    let projection = projectWorldPoint(vela.pos.x, vela.pos.y, vela.pos.z);
    projectionByVela.set(vela, projection);
    renderables.push({ body: vela, projection });
  }

  drawVelaRelations(projectionByVela);

  renderables.sort((a, b) => a.projection.depth - b.projection.depth);
  for (let entry of renderables) {
    drawProjectedBody(entry.body, entry.projection);
  }
}

function drawScaffoldCube() {
  let bounds = getMatrixCageBounds();
  let corners = cubeCornersFromBounds(bounds);
  let projected = new Map();
  for (let [key, corner] of corners.entries()) {
    projected.set(key, projectWorldPoint(corner.x, corner.y, corner.z));
  }

  let center = {
    x: (bounds.minX + bounds.maxX) * 0.5,
    y: (bounds.minY + bounds.maxY) * 0.5,
    z: (bounds.minZ + bounds.maxZ) * 0.5
  };
  let insetCorners = new Map();
  let insetFactor = 0.14;
  for (let [key, corner] of corners.entries()) {
    let inset = {
      x: lerp(corner.x, center.x, insetFactor),
      y: lerp(corner.y, center.y, insetFactor),
      z: lerp(corner.z, center.z, insetFactor)
    };
    insetCorners.set(key, projectWorldPoint(inset.x, inset.y, inset.z));
  }

  drawCubeEdges(projected, SCAFFOLD_EDGE_ALPHA, 1.4);
  drawCubeEdges(insetCorners, SCAFFOLD_INSET_ALPHA, 1.05);
  drawCubeStruts(projected, insetCorners);
}

function getMatrixCageBounds() {
  let spacing = heliosMeta.spacing;
  let zStart = -heliosMeta.depthMid * spacing;
  return {
    minX: heliosMeta.startX - spacing * MATRIX_CAGE_MARGIN,
    maxX: heliosMeta.startX + spacing * (HELIOS_COLS - 1 + MATRIX_CAGE_MARGIN),
    minY: heliosMeta.startY - spacing * MATRIX_CAGE_MARGIN,
    maxY: heliosMeta.startY + spacing * (HELIOS_ROWS - 1 + MATRIX_CAGE_MARGIN),
    minZ: zStart - spacing * MATRIX_CAGE_MARGIN,
    maxZ: zStart + spacing * (HELIOS_DEPTH - 1 + MATRIX_CAGE_MARGIN)
  };
}

function cubeCornersFromBounds(bounds) {
  return new Map([
    ['nbl', { x: bounds.minX, y: bounds.minY, z: bounds.minZ }],
    ['nbr', { x: bounds.maxX, y: bounds.minY, z: bounds.minZ }],
    ['ntl', { x: bounds.minX, y: bounds.maxY, z: bounds.minZ }],
    ['ntr', { x: bounds.maxX, y: bounds.maxY, z: bounds.minZ }],
    ['fbl', { x: bounds.minX, y: bounds.minY, z: bounds.maxZ }],
    ['fbr', { x: bounds.maxX, y: bounds.minY, z: bounds.maxZ }],
    ['ftl', { x: bounds.minX, y: bounds.maxY, z: bounds.maxZ }],
    ['ftr', { x: bounds.maxX, y: bounds.maxY, z: bounds.maxZ }]
  ]);
}

function cubeEdgePairs() {
  return [
    ['nbl', 'nbr'], ['nbr', 'ntr'], ['ntr', 'ntl'], ['ntl', 'nbl'],
    ['fbl', 'fbr'], ['fbr', 'ftr'], ['ftr', 'ftl'], ['ftl', 'fbl'],
    ['nbl', 'fbl'], ['nbr', 'fbr'], ['ntl', 'ftl'], ['ntr', 'ftr']
  ];
}

function drawCubeEdges(projectedCorners, alphaBase, weightBase) {
  for (let pair of cubeEdgePairs()) {
    let a = projectedCorners.get(pair[0]);
    let b = projectedCorners.get(pair[1]);
    if (!a || !b) continue;
    let edgeAlpha = alphaBase * ((a.alpha + b.alpha) * 0.5);
    let edgeWeight = weightBase * ((a.scale + b.scale) * 0.5);
    stroke(SCAFFOLD_RED[0], SCAFFOLD_RED[1], SCAFFOLD_RED[2], edgeAlpha);
    strokeWeight(edgeWeight);
    line(a.screenX, a.screenY, b.screenX, b.screenY);
  }
}

function drawCubeStruts(outerCorners, innerCorners) {
  for (let [key, outer] of outerCorners.entries()) {
    let inner = innerCorners.get(key);
    if (!inner) continue;
    let alpha = SCAFFOLD_STRUT_ALPHA * ((outer.alpha + inner.alpha) * 0.5);
    let weight = 0.75 * ((outer.scale + inner.scale) * 0.5);
    stroke(SCAFFOLD_RED[0], SCAFFOLD_RED[1], SCAFFOLD_RED[2], alpha);
    strokeWeight(weight);
    line(outer.screenX, outer.screenY, inner.screenX, inner.screenY);
  }
}

function drawLatticeGuides(projectionBySystem) {
  for (let z = 0; z < HELIOS_DEPTH; z++) {
    let layerNorm = HELIOS_DEPTH > 1 ? z / (HELIOS_DEPTH - 1) : 0.5;
    for (let r = 0; r < HELIOS_ROWS; r++) {
      for (let c = 0; c < HELIOS_COLS; c++) {
        let system = heliosLattice[z][r][c];
        let from = projectionBySystem.get(system);
        if (!from) continue;

        if (c + 1 < HELIOS_COLS) {
          let strength = 0.24 + guideXScale[z][r][c] * 1.34;
          let to = projectionBySystem.get(heliosLattice[z][r][c + 1]);
          let seed = (z * 92821) ^ (r * 68917) ^ (c * 2833) ^ 41;
          drawGuideSegment(from, to, layerNorm, false, seed, strength);
        }
        if (r + 1 < HELIOS_ROWS) {
          let strength = 0.24 + guideYScale[z][r][c] * 1.34;
          let to = projectionBySystem.get(heliosLattice[z][r + 1][c]);
          let seed = (z * 11789) ^ (r * 52183) ^ (c * 3643) ^ 73;
          drawGuideSegment(from, to, layerNorm, false, seed, strength);
        }
        if (z + 1 < HELIOS_DEPTH) {
          let strength = 0.24 + guideZScale[z][r][c] * 1.34;
          let to = projectionBySystem.get(heliosLattice[z + 1][r][c]);
          let seed = (z * 45613) ^ (r * 19391) ^ (c * 8191) ^ 101;
          drawGuideSegment(from, to, layerNorm, true, seed, strength);
        }
      }
    }
  }
}

function drawGuideSegment(aProj, bProj, layerNorm, isDepthBridge = false, seed = 0, strength = 1) {
  if (!aProj || !bProj) return;
  let snappedA = applyCenterWindowGuideSnap(aProj, seed * 1.31 + 7);
  let snappedB = applyCenterWindowGuideSnap(bProj, seed * 0.79 + 19);
  let dx = snappedB.screenX - snappedA.screenX;
  let dy = snappedB.screenY - snappedA.screenY;
  let length = sqrt(dx * dx + dy * dy);
  if (length < 2) return;

  let alphaBase = isDepthBridge ? 46 : 58;
  let alpha = alphaBase * ((aProj.alpha + bProj.alpha) * 0.5) * (0.8 + layerNorm * 0.35) * strength;
  let weight = isDepthBridge ? 0.9 : 1.1;
  weight *= (aProj.scale + bProj.scale) * 0.5;
  weight *= 0.75 + strength * 0.65;
  let lineColor = SCAFFOLD_RED;

  stroke(lineColor[0], lineColor[1], lineColor[2], alpha);
  strokeWeight(weight);
  noFill();

  if (!isDepthBridge) {
    line(snappedA.screenX, snappedA.screenY, snappedB.screenX, snappedB.screenY);
    return;
  }

  let midX = (snappedA.screenX + snappedB.screenX) * 0.5;
  let midY = (snappedA.screenY + snappedB.screenY) * 0.5;
  let nx = -dy / length;
  let ny = dx / length;
  let swayPhase = simulationTimeMs() * GUIDE_ARC_SWAY_RATE + seed * 0.00037;
  let sway = sin(swayPhase) * GUIDE_ARC_SWAY_PIXELS * (0.45 + layerNorm * 0.9);
  let bow = (min(24, length * 0.18) * (0.4 + layerNorm * 0.9)) + sway;
  beginShape();
  vertex(snappedA.screenX, snappedA.screenY);
  quadraticVertex(midX + nx * bow, midY + ny * bow, snappedB.screenX, snappedB.screenY);
  endShape();
}

function applyCenterWindowGuideSnap(proj, seed = 0) {
  let centerX = width * 0.5;
  let centerY = height * 0.5;
  let localX = proj.screenX - centerX;
  let localY = proj.screenY - centerY;
  let radial = sqrt(localX * localX + localY * localY);
  let windowRadius = min(width, height) * GUIDE_CENTER_WINDOW_RADIUS;
  if (windowRadius <= 0) return proj;

  let zoneT = 1 - constrain((radial - windowRadius * 0.2) / (windowRadius * 0.95), 0, 1);
  if (zoneT <= 0.001) return proj;

  let quantX = Math.round(localX / GUIDE_CENTER_SNAP_STEP) * GUIDE_CENTER_SNAP_STEP;
  let quantY = Math.round(localY / GUIDE_CENTER_SNAP_STEP) * GUIDE_CENTER_SNAP_STEP;
  let clickThreshold = GUIDE_CENTER_SNAP_STEP * (GUIDE_CENTER_CLICK_THRESHOLD + zoneT * 0.2);
  let blend = GUIDE_CENTER_SNAP_BLEND * zoneT;
  let xInfluence = 1 - constrain(abs(quantX - localX) / max(clickThreshold, 0.0001), 0, 1);
  let yInfluence = 1 - constrain(abs(quantY - localY) / max(clickThreshold, 0.0001), 0, 1);
  let snappedX = lerp(localX, quantX, blend * xInfluence);
  let snappedY = lerp(localY, quantY, blend * yInfluence);

  return {
    ...proj,
    screenX: centerX + snappedX,
    screenY: centerY + snappedY
  };
}

function drawVelaRelations(projectionByVela) {
  for (let relation of relationEchoes.values()) {
    let relationStrength = relation.strength;
    if (relationStrength <= 0.004) continue;

    let aProj = projectionByVela.get(relation.a);
    let bProj = projectionByVela.get(relation.b);
    if (!aProj || !bProj) continue;
    if (abs(aProj.screenX - bProj.screenX) > width / 2) continue;
    if (abs(aProj.screenY - bProj.screenY) > height / 2) continue;

    let pulse = 0.5 + 0.5 * sin(simulationTimeMs() * VELA_RELATION_PULSE_RATE + relation.seed * 0.0001);
    let alpha = VELA_RELATION_LINE_ALPHA * relationStrength * pulse * ((aProj.alpha + bProj.alpha) * 0.5);
    let weight = (0.45 + relationStrength * 1.6) * ((aProj.scale + bProj.scale) * 0.5);
    let dx = bProj.screenX - aProj.screenX;
    let dy = bProj.screenY - aProj.screenY;
    let length = sqrt(dx * dx + dy * dy);
    if (length < 0.0001) continue;
    let drawLength = min(length, VELA_RELATION_DRAW_MAX_LENGTH);
    let half = drawLength * 0.5;
    let ux = dx / length;
    let uy = dy / length;
    let midX = (aProj.screenX + bProj.screenX) * 0.5;
    let midY = (aProj.screenY + bProj.screenY) * 0.5;
    let startX = midX - ux * half;
    let startY = midY - uy * half;
    let endX = midX + ux * half;
    let endY = midY + uy * half;

    let nx = -uy;
    let ny = ux;
    let bendDirection = (relation.seed % 2 === 0) ? 1 : -1;
    let bendBase = min(drawLength * 0.33, 18) * (0.45 + relationStrength * 1.05) * bendDirection;
    let swayPhase = simulationTimeMs() * RELATION_ARC_SWAY_RATE + relation.seed * 0.00021;
    let sway = sin(swayPhase) * RELATION_ARC_SWAY_PIXELS * (0.35 + relationStrength * 0.75);
    let bend = bendBase + sway;
    let cx = midX + nx * bend;
    let cy = midY + ny * bend;

    let relationColor = relation.a.groupColor || (relation.a.polarity > 0 ? visualTheme.bodyWarm : visualTheme.bodyCool);
    noStroke();
    fill(relationColor[0], relationColor[1], relationColor[2], alpha * 0.24);
    beginShape();
    vertex(startX, startY);
    quadraticVertex(cx, cy, endX, endY);
    endShape(CLOSE);

    stroke(relationColor[0], relationColor[1], relationColor[2], alpha);
    strokeWeight(weight);
    noFill();
    beginShape();
    vertex(startX, startY);
    quadraticVertex(cx, cy, endX, endY);
    endShape();

    if (relationStrength > 0.18) {
      noStroke();
      fill(relationColor[0], relationColor[1], relationColor[2], alpha * 0.72);
      ellipse(cx, cy, 1.1 + relationStrength * 2.3);
    }
  }
}

function drawProjectedTrail(vela) {
  let prevProjection = projectWorldPoint(vela.prev.x, vela.prev.y, vela.prev.z);
  let currProjection = projectWorldPoint(vela.pos.x, vela.pos.y, vela.pos.z);
  if (abs(currProjection.screenX - prevProjection.screenX) > width / 2) return;
  if (abs(currProjection.screenY - prevProjection.screenY) > height / 2) return;
  let segmentLength = dist(
    prevProjection.screenX,
    prevProjection.screenY,
    currProjection.screenX,
    currProjection.screenY
  );
  let speedNorm = constrain(segmentLength / TRAIL_SPEED_FOR_MAX, 0, 1);
  let speedTaper = speedNorm * speedNorm * speedNorm;
  let depthBoost = map(currProjection.scale, 0.7, 1.3, 0.95, 1.08, true);
  let targetWidth = lerp(TRAIL_TARGET_PX, TRAIL_MAX_PX, speedTaper) * depthBoost;
  if (vela.trailWidthPx === undefined) vela.trailWidthPx = TRAIL_MAX_PX;
  vela.trailWidthPx = lerp(vela.trailWidthPx, targetWidth, TRAIL_WIDTH_LERP);
  let colorMix = vela.groupColor || (vela.polarity > 0 ? visualTheme.trailWarm : visualTheme.trailCool);
  stroke(colorMix[0], colorMix[1], colorMix[2], TRAIL_ALPHA * currProjection.alpha);
  strokeWeight(max(TRAIL_TARGET_PX, vela.trailWidthPx));
  line(
    prevProjection.screenX,
    prevProjection.screenY,
    currProjection.screenX,
    currProjection.screenY
  );
}

function drawProjectedBody(body, projection) {
  push();
  translate(projection.screenX, projection.screenY);
  if (projection.scale !== 1) scale(projection.scale);
  let prevAlpha = drawingContext.globalAlpha;
  drawingContext.globalAlpha = prevAlpha * projection.alpha;
  if (body.isSun) {
    let scaleAmount = max(0, body.r - body.baseR);
    let scaleNorm = constrain(scaleAmount / max(body.baseR, 0.0001), 0, 1);
    let sunScaleAlpha = body.sunAlpha * (1 - scaleNorm * 0.65);
    stroke(visualTheme.sunStroke[0], visualTheme.sunStroke[1], visualTheme.sunStroke[2], sunScaleAlpha);
    strokeWeight(1);
    noFill();
  } else {
    let bodyColor = body.groupColor || (body.polarity > 0 ? visualTheme.bodyWarm : visualTheme.bodyCool);
    stroke(bodyColor[0], bodyColor[1], bodyColor[2]);
    strokeWeight(1);
    fill(0, 0, 0);
  }
  ellipse(0, 0, body.r * 2);
  drawingContext.globalAlpha = prevAlpha;
  pop();
}
