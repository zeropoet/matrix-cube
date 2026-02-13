const SUN_SCALE = 1;
const SUN_ATTRACT_MIN_SQ = 1000000;
const SUN_ATTRACT_MAX_SQ = 10000000;
const SUN_ATTRACT_G = 10;
const SUN_INFLUENCE_RADIUS = 100;
const SUN_MAX_RADIUS = 10;
const SUN_MIN_RADIUS = 5;
const SUN_FADE_MS = 100;
const SUN_SCALE_LERP = 1.7;
const SUN_ALPHA_LERP = .008;
const VELA_FORCE_WARMUP_FRAMES = 220;
const VELA_TURN_SMOOTHING = .1;
const VELA_VELOCITY_DAMPING = 1;

class Vela {
  constructor(x, y, vx, vy, m, isSun = false, z = 0, vz = 0, polarity = 1) {
    this.pos = createVector(x, y, z);
    this.prev = this.pos.copy();
    this.vel = createVector(vx, vy, vz);
    this.acc = createVector(0, 0, 0);
    this.baseMass = m;
    this.mass = m;
    this.baseR = sqrt(this.baseMass) * (isSun ? SUN_SCALE : 1);
    this.r = this.baseR;
    this.isSun = isSun;
    this.polarity = polarity;
    this.swell = 0;
    this.massSwell = 0;
    this.influencedThisFrame = false;
    this.wasInfluenced = false;
    this.exitStartMs = 0;
    this.exitStartR = this.r;
    this.sunAlpha = 255;
    this.ageFrames = 0;
  }

  beginSwell() {
    if (!this.isSun) return;
    this.swell = 0;
    this.massSwell = 0;
    this.influencedThisFrame = false;
  }

  applyForce(force) {
    if (!this.isSun && this.ageFrames < VELA_FORCE_WARMUP_FRAMES) {
      let t = this.ageFrames / VELA_FORCE_WARMUP_FRAMES;
      let eased = t * t * (3 - 2 * t);
      force = p5.Vector.mult(force, eased);
    }
    let f = p5.Vector.div(force, this.mass);
    this.acc.add(f);
  }

  attract(vela) {
    let force = p5.Vector.sub(this.pos, vela.pos);
    let rawDistanceSq = force.magSq();
    let distanceSq = constrain(rawDistanceSq, SUN_ATTRACT_MIN_SQ, SUN_ATTRACT_MAX_SQ);
    let strength = ((this.mass * vela.mass) / distanceSq) * SUN_ATTRACT_G;
    force.setMag(strength);
    vela.applyForce(force);
    this.registerInfluence(rawDistanceSq, vela.mass);
  }

  registerInfluence(rawDistanceSq, sourceMass) {
    if (!this.isSun) return;
    let d = sqrt(rawDistanceSq);
    let t = 1 - d / SUN_INFLUENCE_RADIUS;
    t = constrain(t, 0, 1);
    if (t > 0) {
      this.swell += sourceMass;
      this.massSwell += sourceMass;
      this.influencedThisFrame = true;
    }
  }

  applySwell() {
    if (!this.isSun) return;
    if (this.influencedThisFrame) {
      this.mass = this.baseMass + this.massSwell;
      let targetR = min(this.baseR + this.swell, SUN_MAX_RADIUS);
      this.r = lerp(this.r, targetR, SUN_SCALE_LERP);
      this.sunAlpha = lerp(this.sunAlpha, 255, SUN_ALPHA_LERP);
      this.wasInfluenced = true;
    } else {
      if (this.wasInfluenced) {
        this.exitStartMs = millis();
        this.exitStartR = this.r;
        this.wasInfluenced = false;
      }
      let t = constrain((millis() - this.exitStartMs) / SUN_FADE_MS, 0, 1);
      let ease = 1 - pow(1 - t, 3);
      this.sunAlpha = lerp(255, 0, ease);
      this.r = lerp(this.exitStartR, SUN_MIN_RADIUS, ease);
    }
  }

  update() {
    this.prev.set(this.pos);
    let desiredVel = p5.Vector.add(this.vel, this.acc);
    this.vel.lerp(desiredVel, VELA_TURN_SMOOTHING);
    this.vel.mult(VELA_VELOCITY_DAMPING);
    this.pos.add(this.vel);
    this.acc.set(0, 0);
    this.ageFrames++;
  }
}
