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

const TOTAL_VELA_COUNT = 212;
const VELA_MASS_MIN = 5;
const VELA_MASS_MAX = 10;
const BACKGROUND_DAY = [12, 16, 30];
const BACKGROUND_NIGHT = [0, 0, 0];
const SUN_MASS = 1;
const HELIOS_ROWS = 4;
const HELIOS_COLS = 4;
const HELIOS_DEPTH = 4;
const TIME_SPEED_FACTOR = 0.25;
const HELIOS_YAW_SPEED = 0.000045;
const HELIOS_PITCH_SPEED = 0.00003;
const VELA_NEIGHBOR_RADIUS = 100;
const VELA_NEIGHBOR_RADIUS_SQ = VELA_NEIGHBOR_RADIUS * VELA_NEIGHBOR_RADIUS;
const VELA_HASH_CELL_SIZE = VELA_NEIGHBOR_RADIUS;
const VELA_RELATION_RADIUS = 130;
const VELA_RELATION_RADIUS_SQ = VELA_RELATION_RADIUS * VELA_RELATION_RADIUS;
const VELA_RELATION_MAX_TOTAL = 2200;
const VELA_RELATION_MIN_STRENGTH = 0.06;
const VELA_RELATION_SPRING = .035;
const VELA_RELATION_TARGET_DISTANCE = 42;
const VELA_RELATION_TARGET_SWING = 26;
const VELA_RELATION_BRAID_FORCE = 0.018;
const VELA_RELATION_LINE_ALPHA = 190;
const VELA_RELATION_PULSE_RATE = 0.0055;
const VELA_RELATION_PHASE_RATE = 0.0027;
const VELA_RELATION_DRAW_MAX_LENGTH = 132;
const VELA_RELATION_ECHO_MS = 3400;
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
const MATRIX_AXIS_LOCK = 0.7;
const MATRIX_LAYER_LOCK = 1.0;
const MATRIX_CAGE_STIFFNESS = 0.01;
const MATRIX_CAGE_MARGIN = 0.62;
const QUANTUM_REORIENTATION_STRENGTH = .8;
const QUANTUM_REORIENTATION_RATE = 0.0016;
const QUANTUM_POLARITY_PHASE = 1.0472;
const TRAIL_TARGET_PX = 1;
const TRAIL_MAX_PX = 1.5;
const TRAIL_SPEED_FOR_MAX = 24;
const TRAIL_WIDTH_LERP = 0.34;
const TRAIL_ALPHA = 132;
const TRAIL_WARM_DAY = [255, 193, 120];
const TRAIL_COOL_DAY = [126, 208, 255];
const BODY_WARM_DAY = [255, 220, 166];
const BODY_COOL_DAY = [155, 226, 255];
const SUN_STROKE_DAY = [245, 240, 219];
const GUIDE_WARM_DAY = [255, 171, 129];
const GUIDE_COOL_DAY = [111, 194, 255];
const GUIDE_LAYER_DAY = [156, 235, 192];
const DAY_START_HOUR = 8;
const DAY_END_HOUR = 18;
const NIGHT_START_HOUR = 20;
const NIGHT_END_HOUR = 6;
const GUIDE_ARC_SWAY_RATE = 0.0012;
const GUIDE_ARC_SWAY_PIXELS = 9;
const RELATION_ARC_SWAY_RATE = 0.0022;
const RELATION_ARC_SWAY_PIXELS = 8;
const VELA_INITIAL_SPEED = 1.12;
const CAPTURE_DURATION_MS = 60000;
const CAPTURE_FILENAME = 'helios-lattice-capture';
const CAPTURE_FPS = 30;
const VIDEO_CAPTURE_FORMATS = [
  { mimeType: 'video/mp4;codecs=avc1' },
  { mimeType: 'video/mp4;codecs=h264' },
  { mimeType: 'video/mp4' }
];
const CAPTURE_DURATION_SECONDS = CAPTURE_DURATION_MS / 1000;

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

function setup() {
  applyPixelDensity();
  cnv = createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  cnv.position(0, 0);
  cnv.style('z-index', '0');
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('pointer-events', 'none');
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
  velas = createDistributedVelas(heliosLattice, spawnField, TOTAL_VELA_COUNT);
  relationEchoes.clear();
}

function refreshVisualTheme() {
  let hour = localHourFloat();
  let dayFactor = dayColorFactor(hour);
  visualTheme = createVisualTheme(dayFactor);
}

function localHourFloat() {
  let now = new Date();
  return now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
}

function dayColorFactor(hour) {
  if (hour >= DAY_START_HOUR && hour <= DAY_END_HOUR) return 1;
  if (hour >= NIGHT_START_HOUR || hour <= NIGHT_END_HOUR) return 0;
  if (hour > NIGHT_END_HOUR && hour < DAY_START_HOUR) {
    let t = (hour - NIGHT_END_HOUR) / (DAY_START_HOUR - NIGHT_END_HOUR);
    return smoothstep(t);
  }
  let t = (hour - DAY_END_HOUR) / (NIGHT_START_HOUR - DAY_END_HOUR);
  return 1 - smoothstep(t);
}

function smoothstep(t) {
  let x = constrain(t, 0, 1);
  return x * x * (3 - 2 * x);
}

function createVisualTheme(dayFactor) {
  return {
    dayFactor,
    background: colorByDayFactor(BACKGROUND_DAY, dayFactor, BACKGROUND_NIGHT),
    trailWarm: colorByDayFactor(TRAIL_WARM_DAY, dayFactor),
    trailCool: colorByDayFactor(TRAIL_COOL_DAY, dayFactor),
    bodyWarm: colorByDayFactor(BODY_WARM_DAY, dayFactor),
    bodyCool: colorByDayFactor(BODY_COOL_DAY, dayFactor),
    sunStroke: colorByDayFactor(SUN_STROKE_DAY, dayFactor),
    guideWarm: colorByDayFactor(GUIDE_WARM_DAY, dayFactor),
    guideCool: colorByDayFactor(GUIDE_COOL_DAY, dayFactor),
    guideLayer: colorByDayFactor(GUIDE_LAYER_DAY, dayFactor)
  };
}

function colorByDayFactor(dayRgb, dayFactor, nightOverride = null) {
  let gray = luminance(dayRgb);
  let nightBase = nightOverride || [gray, gray, gray];
  return [
    lerp(nightBase[0], dayRgb[0], dayFactor),
    lerp(nightBase[1], dayRgb[1], dayFactor),
    lerp(nightBase[2], dayRgb[2], dayFactor)
  ];
}

function luminance(rgb) {
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

function applyPixelDensity() {
  const dpr = window.devicePixelRatio || 1;
  pixelDensity(Math.min(dpr, 2));
}

function createHeliosLattice(rows, cols, depth) {
  let lattice = [];
  let spacing = Math.min(width / (cols + 1), height / (rows + 1));
  heliosMeta.spacing = spacing;
  heliosMeta.depthMid = (depth - 1) / 2;
  heliosMeta.depthScale = spacing * 3.5;
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

function createDistributedVelas(lattice, field, count) {
  let allVelas = [];
  let zJitter = heliosMeta.spacing * 0.5;
  for (let i = 0; i < count; i++) {
    let voxel = pickWeightedVoxel(field);
    let system = lattice[voxel.z][voxel.y][voxel.x];
    let x = random(system.bounds.x, system.bounds.x + system.bounds.w);
    let y = random(system.bounds.y, system.bounds.y + system.bounds.h);
    let z = system.origin.z + random(-zJitter, zJitter);
    let v = p5.Vector.random3D();
    v.mult(VELA_INITIAL_SPEED);
    let m = random(VELA_MASS_MIN, VELA_MASS_MAX);
    let polarity = random() > 0.5 ? 1 : -1;
    allVelas.push(new Vela(x, y, v.x, v.y, m, false, z, v.z, polarity));
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

  let minX = heliosMeta.startX - spacing * MATRIX_CAGE_MARGIN;
  let maxX = heliosMeta.startX + spacing * (HELIOS_COLS - 1 + MATRIX_CAGE_MARGIN);
  let minY = heliosMeta.startY - spacing * MATRIX_CAGE_MARGIN;
  let maxY = heliosMeta.startY + spacing * (HELIOS_ROWS - 1 + MATRIX_CAGE_MARGIN);
  let minZ = zStart - spacing * MATRIX_CAGE_MARGIN;
  let maxZ = zStart + spacing * (HELIOS_DEPTH - 1 + MATRIX_CAGE_MARGIN);

  let cageForce = createVector(0, 0, 0);
  if (vela.pos.x < minX) cageForce.x += (minX - vela.pos.x) * MATRIX_CAGE_STIFFNESS;
  if (vela.pos.x > maxX) cageForce.x -= (vela.pos.x - maxX) * MATRIX_CAGE_STIFFNESS;
  if (vela.pos.y < minY) cageForce.y += (minY - vela.pos.y) * MATRIX_CAGE_STIFFNESS;
  if (vela.pos.y > maxY) cageForce.y -= (vela.pos.y - maxY) * MATRIX_CAGE_STIFFNESS;
  if (vela.pos.z < minZ) cageForce.z += (minZ - vela.pos.z) * MATRIX_CAGE_STIFFNESS;
  if (vela.pos.z > maxZ) cageForce.z -= (vela.pos.z - maxZ) * MATRIX_CAGE_STIFFNESS;
  if (cageForce.magSq() > 0) {
    cageForce.mult(MATRIX_FORCE_SCALE * timeScale);
    vela.applyForce(cageForce);
  }
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
        strength: relation.strength,
        lastSeenMs: now
      });
    }
  }

  for (let [key, echo] of relationEchoes.entries()) {
    if (activeKeys.has(key)) continue;
    let ageMs = now - echo.lastSeenMs;
    if (ageMs > VELA_RELATION_ECHO_MS) {
      relationEchoes.delete(key);
    }
  }
}

function simulationTimeMs() {
  return millis() * runtimeTimeSpeed;
}

function simulationTimeScale() {
  return constrain(runtimeTimeSpeed, 0.1, 2.5);
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
  let yaw = t * HELIOS_YAW_SPEED;
  let pitch = t * HELIOS_PITCH_SPEED;
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
  perspective = constrain(perspective, 0.7, 1.3);
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

function drawLatticeGuides(projectionBySystem) {
  for (let z = 0; z < HELIOS_DEPTH; z++) {
    let layerNorm = HELIOS_DEPTH > 1 ? z / (HELIOS_DEPTH - 1) : 0.5;
    for (let r = 0; r < HELIOS_ROWS; r++) {
      for (let c = 0; c < HELIOS_COLS; c++) {
        let system = heliosLattice[z][r][c];
        let from = projectionBySystem.get(system);
        if (!from) continue;

        if (c + 1 < HELIOS_COLS) {
          let to = projectionBySystem.get(heliosLattice[z][r][c + 1]);
          let seed = (z * 92821) ^ (r * 68917) ^ (c * 2833) ^ 41;
          drawGuideSegment(from, to, layerNorm, false, seed);
        }
        if (r + 1 < HELIOS_ROWS) {
          let to = projectionBySystem.get(heliosLattice[z][r + 1][c]);
          let seed = (z * 11789) ^ (r * 52183) ^ (c * 3643) ^ 73;
          drawGuideSegment(from, to, layerNorm, false, seed);
        }
        if (z + 1 < HELIOS_DEPTH) {
          let to = projectionBySystem.get(heliosLattice[z + 1][r][c]);
          let seed = (z * 45613) ^ (r * 19391) ^ (c * 8191) ^ 101;
          drawGuideSegment(from, to, layerNorm, true, seed);
        }
      }
    }
  }
}

function drawGuideSegment(aProj, bProj, layerNorm, isDepthBridge = false, seed = 0) {
  if (!aProj || !bProj) return;
  let dx = bProj.screenX - aProj.screenX;
  let dy = bProj.screenY - aProj.screenY;
  let length = sqrt(dx * dx + dy * dy);
  if (length < 2) return;

  let alphaBase = isDepthBridge ? 46 : 58;
  let alpha = alphaBase * ((aProj.alpha + bProj.alpha) * 0.5) * (0.8 + layerNorm * 0.35);
  let weight = isDepthBridge ? 0.9 : 1.1;
  weight *= (aProj.scale + bProj.scale) * 0.5;
  let lerpT = isDepthBridge ? 0.65 : 0.5;
  let lineColor = isDepthBridge
    ? [
      lerp(visualTheme.guideCool[0], visualTheme.guideLayer[0], lerpT),
      lerp(visualTheme.guideCool[1], visualTheme.guideLayer[1], lerpT),
      lerp(visualTheme.guideCool[2], visualTheme.guideLayer[2], lerpT)
    ]
    : [
      lerp(visualTheme.guideWarm[0], visualTheme.guideCool[0], lerpT),
      lerp(visualTheme.guideWarm[1], visualTheme.guideCool[1], lerpT),
      lerp(visualTheme.guideWarm[2], visualTheme.guideCool[2], lerpT)
    ];

  stroke(lineColor[0], lineColor[1], lineColor[2], alpha);
  strokeWeight(weight);
  noFill();

  if (!isDepthBridge) {
    line(aProj.screenX, aProj.screenY, bProj.screenX, bProj.screenY);
    return;
  }

  let midX = (aProj.screenX + bProj.screenX) * 0.5;
  let midY = (aProj.screenY + bProj.screenY) * 0.5;
  let nx = -dy / length;
  let ny = dx / length;
  let swayPhase = simulationTimeMs() * GUIDE_ARC_SWAY_RATE + seed * 0.00037;
  let sway = sin(swayPhase) * GUIDE_ARC_SWAY_PIXELS * (0.45 + layerNorm * 0.9);
  let bow = (min(24, length * 0.18) * (0.4 + layerNorm * 0.9)) + sway;
  beginShape();
  vertex(aProj.screenX, aProj.screenY);
  quadraticVertex(midX + nx * bow, midY + ny * bow, bProj.screenX, bProj.screenY);
  endShape();
}

function drawVelaRelations(projectionByVela) {
  let now = simulationTimeMs();
  for (let relation of relationEchoes.values()) {
    let ageMs = now - relation.lastSeenMs;
    if (ageMs > VELA_RELATION_ECHO_MS) continue;
    let ageFade = 1 - (ageMs / VELA_RELATION_ECHO_MS);
    let relationStrength = relation.strength * ageFade;
    if (relationStrength <= 0.01) continue;

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

    let samePolarity = relation.a.polarity === relation.b.polarity;
    let relationColor = samePolarity
      ? [
        lerp(visualTheme.trailCool[0], visualTheme.guideCool[0], 0.5),
        lerp(visualTheme.trailCool[1], visualTheme.guideCool[1], 0.5),
        lerp(visualTheme.trailCool[2], visualTheme.guideCool[2], 0.5)
      ]
      : [
        lerp(visualTheme.trailWarm[0], visualTheme.guideWarm[0], 0.5),
        lerp(visualTheme.trailWarm[1], visualTheme.guideWarm[1], 0.5),
        lerp(visualTheme.trailWarm[2], visualTheme.guideWarm[2], 0.5)
      ];
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
  let colorMix = vela.polarity > 0 ? visualTheme.trailWarm : visualTheme.trailCool;
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
    noStroke();
    let bodyColor = body.polarity > 0 ? visualTheme.bodyWarm : visualTheme.bodyCool;
    fill(bodyColor[0], bodyColor[1], bodyColor[2]);
  }
  ellipse(0, 0, body.r * 2);
  drawingContext.globalAlpha = prevAlpha;
  pop();
}
