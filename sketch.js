let heliosLattice = [];
let cnv;
let heliosMeta = {
  spacing: 1,
  depthMid: 1,
  depthScale: 1
};
const TOTAL_VELA_COUNT = 212;
const VELA_MASS_MIN = 1;
const VELA_MASS_MAX = 100;
const BACKGROUND_COLOR = [255, 50];
const SUN_MASS = 10;
const HELIOS_ROWS = 4;
const HELIOS_COLS = 4;
const HELIOS_DEPTH = 4;
const HELIOS_YAW_SPEED = 0.0012;
const HELIOS_PITCH_SPEED = 0.0009;
const VELA_COUNT_PER_SUN = Math.floor(TOTAL_VELA_COUNT / (HELIOS_ROWS * HELIOS_COLS));


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
  heliosLattice = createHeliosLattice(HELIOS_ROWS, HELIOS_COLS, HELIOS_DEPTH);
}


function draw() {
  background(...BACKGROUND_COLOR);
  for (let layer of heliosLattice) {
    for (let row of layer) {
      for (let system of row) {
        updateHeliosSystem(system);
      }
    }
  }
}


function windowResized() {
  applyPixelDensity();
  resizeCanvas(windowWidth, windowHeight);
  heliosLattice = createHeliosLattice(HELIOS_ROWS, HELIOS_COLS, HELIOS_DEPTH);
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
        row.push(createHeliosSystem(bounds, VELA_COUNT_PER_SUN, sunX, sunY, z));
      }
      layer.push(row);
    }
    lattice.push(layer);
  }
  return lattice;
}

function createHeliosSystem(bounds, velaCount, sunX, sunY, zIndex) {
  let sun = new Vela(sunX, sunY, 0, 0, SUN_MASS, true);
  let velas = [];
  let weightField = createWeightField(4, 4, 4);
  let voxelW = bounds.w / weightField.dims.x;
  let voxelH = bounds.h / weightField.dims.y;
  for (let i = 0; i < velaCount; i++) {
    let voxel = pickWeightedVoxel(weightField);
    let x = bounds.x + voxel.x * voxelW + random(voxelW);
    let y = bounds.y + voxel.y * voxelH + random(voxelH);
    let v = p5.Vector.random2D();
    let m = random(VELA_MASS_MIN, VELA_MASS_MAX);
    velas.push(new Vela(x, y, v.x, v.y, m));
  }
  return { sun, velas, bounds, weightField, zIndex, origin: { x: sunX, y: sunY, z: zIndex } };
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

function updateHeliosSystem(system) {
  system.sun.beginSwell();
  for (let vela of system.velas) {
    system.sun.attract(vela);
    for (let other of system.velas) {
      if (vela !== other) {
        vela.attract(other);
      }
    }
  }
  system.sun.applySwell();
  let transform = computeHeliosTransform(system);
  push();
  translate(transform.screenX, transform.screenY);
  if (transform.scale !== 1) scale(transform.scale);
  translate(-system.origin.x, -system.origin.y);
  let prevAlpha = drawingContext.globalAlpha;
  drawingContext.globalAlpha = prevAlpha * transform.alpha;
  system.sun.show();
  for (let vela of system.velas) {
    vela.update();
    vela.showTrail();
    vela.show();
  }
  drawingContext.globalAlpha = prevAlpha;
  pop();
}

function computeHeliosTransform(system) {
  let centerX = width / 2;
  let centerY = height / 2;
  let x0 = system.origin.x - centerX;
  let y0 = system.origin.y - centerY;
  let z0 = (system.origin.z - heliosMeta.depthMid) * heliosMeta.spacing;
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
  return { screenX, screenY, scale: perspective, alpha };
}
