let heliosLattice = [];
let heliosSystems = [];
let velas = [];
let cnv;
let heliosMeta = {
  spacing: 1,
  depthMid: 1,
  depthScale: 1,
  startX: 0,
  startY: 0
};

const TOTAL_VELA_COUNT = 212;
const VELA_MASS_MIN = 100;
const VELA_MASS_MAX = 1000;
const BACKGROUND_COLOR = [255, 8];
const SUN_MASS = 1;
const HELIOS_ROWS = 4;
const HELIOS_COLS = 4;
const HELIOS_DEPTH = 4;
const HELIOS_YAW_SPEED = 0.00012;
const HELIOS_PITCH_SPEED = 0.00009;
const VELA_NEIGHBOR_RADIUS = 100;
const VELA_NEIGHBOR_RADIUS_SQ = VELA_NEIGHBOR_RADIUS * VELA_NEIGHBOR_RADIUS;
const VELA_HASH_CELL_SIZE = VELA_NEIGHBOR_RADIUS;
const SUN_FIELD_FALLOFF = 0.00002;
const SUN_MAGNETIC_PULL = 5;
const SUN_MAGNETIC_BIAS = 0.55;
const SUN_MAGNETIC_SIGN = 0.75;
const SUN_TUBE_PULL = 2.5;
const SUN_SWIRL_STRENGTH = 1.8;
const SUN_BRIDGE_FLOW = 1.5;
const MATRIX_NODE_LOCK = 2.8;
const MATRIX_AXIS_LOCK = 2.2;
const MATRIX_LAYER_LOCK = 3.1;
const MATRIX_CAGE_STIFFNESS = 0.04;
const MATRIX_CAGE_MARGIN = 0.42;
const TRAIL_TARGET_PX = 1;
const TRAIL_MAX_PX = 1.5;
const TRAIL_SPEED_FOR_MAX = 24;
const TRAIL_WIDTH_LERP = 0.34;
const TRAIL_ALPHA = 120;
const VELA_INITIAL_SPEED = 0.12;

function setup() {
  applyPixelDensity();
  cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('z-index', '0');
  cnv.style('position', 'fixed');
  cnv.style('top', '0');
  cnv.style('left', '0');
  cnv.style('pointer-events', 'none');
  background(255);
  initializeHelios();
}

function draw() {
  background(...BACKGROUND_COLOR);
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
  let spatialGrid = buildVelaSpatialGrid(velas, VELA_HASH_CELL_SIZE);

  for (let system of heliosSystems) {
    system.sun.beginSwell();
  }

  for (let vela of velas) {
    applySunLensingForce(vela);
    let neighbors = findNearbyVelas(vela, spatialGrid, VELA_HASH_CELL_SIZE);
    for (let other of neighbors) {
      if (vela !== other && squaredDistance3D(vela.pos, other.pos) <= VELA_NEIGHBOR_RADIUS_SQ) {
        vela.attract(other);
      }
    }
  }

  for (let system of heliosSystems) {
    system.sun.applySwell();
  }

  for (let vela of velas) {
    vela.update();
  }
}

function applySunLensingForce(vela) {
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
  let nearestStrength = SUN_MAGNETIC_PULL / (1 + nearestSq * SUN_FIELD_FALLOFF);
  let poleMatch = vela.polarity * nearest.polarity;
  let magneticScale = SUN_MAGNETIC_BIAS + (poleMatch < 0 ? SUN_MAGNETIC_SIGN : -SUN_MAGNETIC_SIGN);
  toNearest.setMag(nearestStrength * magneticScale);
  vela.applyForce(toNearest);

  if (!second) {
    applyMatrixConfinementForce(vela, nearest, nearestSq);
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
    let tubeStrength = SUN_TUBE_PULL * lens * (pairOpposite ? 1.2 : 0.55);
    tubeVector.setMag(tubeStrength);
    vela.applyForce(tubeVector);
  }

  let bridgeDir = bridge.copy().normalize();
  let radial = p5.Vector.sub(closestPoint, vela.pos);
  if (radial.magSq() > 0) {
    let radialDir = radial.copy().normalize();
    let swirl = bridgeDir.cross(radialDir);
    if (swirl.magSq() > 0) {
      let centerBoost = 1 - abs(t - 0.5) * 2;
      let swirlSign = nearest.polarity * second.polarity * vela.polarity;
      swirl.setMag(SUN_SWIRL_STRENGTH * lens * centerBoost * swirlSign);
      vela.applyForce(swirl);
    }
  }

  let distA = sqrt(nearestSq);
  let distB = sqrt(secondSq);
  let handoff = (distA - distB) / max(distA + distB, 0.0001);
  let bridgeFlow = bridgeDir.mult(-handoff * SUN_BRIDGE_FLOW * lens);
  vela.applyForce(bridgeFlow);

  applyMatrixConfinementForce(vela, nearest, nearestSq);
}

function applyMatrixConfinementForce(vela, nearestSystem, nearestSq) {
  if (!nearestSystem) return;

  let spacing = heliosMeta.spacing;
  let zStart = -heliosMeta.depthMid * spacing;

  let gridX = nearestGridValue(vela.pos.x, heliosMeta.startX, spacing, HELIOS_COLS);
  let gridY = nearestGridValue(vela.pos.y, heliosMeta.startY, spacing, HELIOS_ROWS);
  let gridZ = nearestGridValue(vela.pos.z, zStart, spacing, HELIOS_DEPTH);

  let nodePull = p5.Vector.sub(nearestSystem.sun.pos, vela.pos);
  if (nodePull.magSq() > 0) {
    let nodeStrength = MATRIX_NODE_LOCK / (1 + nearestSq * SUN_FIELD_FALLOFF * 1.5);
    nodePull.setMag(nodeStrength);
    vela.applyForce(nodePull);
  }

  let axisTarget = createVector(gridX, gridY, gridZ);
  let axisPull = p5.Vector.sub(axisTarget, vela.pos);
  let axisSq = axisPull.magSq();
  if (axisSq > 0) {
    let axisStrength = MATRIX_AXIS_LOCK / (1 + axisSq * SUN_FIELD_FALLOFF * 1.5);
    axisPull.setMag(axisStrength);
    vela.applyForce(axisPull);
  }

  let layerDelta = gridZ - vela.pos.z;
  vela.applyForce(createVector(0, 0, layerDelta * MATRIX_LAYER_LOCK * 0.02));

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
  if (cageForce.magSq() > 0) vela.applyForce(cageForce);
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
  let yaw = millis() * HELIOS_YAW_SPEED;
  let pitch = millis() * HELIOS_PITCH_SPEED;
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

  for (let system of heliosSystems) {
    let projection = projectWorldPoint(system.sun.pos.x, system.sun.pos.y, system.sun.pos.z);
    renderables.push({ body: system.sun, projection });
  }

  for (let vela of velas) {
    drawProjectedTrail(vela);
    let projection = projectWorldPoint(vela.pos.x, vela.pos.y, vela.pos.z);
    renderables.push({ body: vela, projection });
  }

  renderables.sort((a, b) => a.projection.depth - b.projection.depth);
  for (let entry of renderables) {
    drawProjectedBody(entry.body, entry.projection);
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
  stroke(255, TRAIL_ALPHA * currProjection.alpha);
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
    stroke(0, body.sunAlpha);
    strokeWeight(1);
    //noFill();
  } else {
    noStroke();
    fill(0);
  }
  ellipse(0, 0, body.r * 2);
  drawingContext.globalAlpha = prevAlpha;
  pop();
}
