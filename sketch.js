let heliosLattice = [];
let heliosSystems = [];
let velas = [];
let cnv;
let heliosMeta = {
  spacing: 1,
  depthMid: 1,
  depthScale: 1
};
const TOTAL_VELA_COUNT = 212;
const VELA_MASS_MIN = 1;
const VELA_MASS_MAX = 42;
const BACKGROUND_COLOR = [255, 50];
const SUN_MASS = 100;
const HELIOS_ROWS = 4;
const HELIOS_COLS = 4;
const HELIOS_DEPTH = 4;
const HELIOS_YAW_SPEED = 0.000012;
const HELIOS_PITCH_SPEED = 0.000009;


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
        row.push(createHeliosSystem(bounds, sunX, sunY, z));
      }
      layer.push(row);
    }
    lattice.push(layer);
  }
  return lattice;
}

function createHeliosSystem(bounds, sunX, sunY, zIndex) {
  let zWorld = (zIndex - heliosMeta.depthMid) * heliosMeta.spacing;
  let sun = new Vela(sunX, sunY, 0, 0, SUN_MASS, true, zWorld, 0);
  return { sun, bounds, zIndex, origin: { x: sunX, y: sunY, z: zWorld } };
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
    let m = random(VELA_MASS_MIN, VELA_MASS_MAX);
    allVelas.push(new Vela(x, y, v.x, v.y, m, false, z, v.z));
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
  for (let system of heliosSystems) {
    system.sun.beginSwell();
  }

  for (let vela of velas) {
    for (let system of heliosSystems) {
      system.sun.attract(vela);
    }
    for (let other of velas) {
      if (vela !== other) {
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
  stroke(255, currProjection.alpha);
  strokeWeight(100 * currProjection.scale);
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
    noFill();
  } else {
    noStroke();
    fill(0);
  }
  ellipse(0, 0, body.r * 2);
  drawingContext.globalAlpha = prevAlpha;
  pop();
}
