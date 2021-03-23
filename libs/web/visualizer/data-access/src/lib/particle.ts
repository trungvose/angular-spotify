import { random, sample } from 'lodash-es';
import { ALPHA, COLORS, NUM_BANDS, SCALE, SIZE, SPEED, SPIN, TWO_PI } from './const';

export class Particle {
  x: number;
  y: number;
  level!: number;
  scale!: number;
  alpha!: number;
  speed!: number;
  size!: number;
  spin!: number;
  band!: number;
  // eslint-disable-next-line
  color: any;
  smoothedScale = 0;
  smoothedAlpha = 0;
  decayScale = 0;
  decayAlpha = 0;
  rotation = 0;
  energy = 0;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.reset();
  }

  reset(): number {
    this.level = 1 + Math.floor(random(4));
    this.scale = random(SCALE.MIN, SCALE.MAX);
    this.alpha = random(ALPHA.MIN, ALPHA.MAX);
    this.speed = random(SPEED.MIN, SPEED.MAX);
    this.color = sample(COLORS);
    this.size = random(SIZE.MIN, SIZE.MAX);
    this.spin = random(SPIN.MAX, SPIN.MAX);
    this.band = Math.floor(random(NUM_BANDS));

    if (Math.random() < 0.5) {
      this.spin = -this.spin;
    }

    this.smoothedScale = 0.0;
    this.smoothedAlpha = 0.0;
    this.decayScale = 0.0;
    this.decayAlpha = 0.0;
    this.rotation = random(TWO_PI);
    this.energy = 0.0;

    return this.energy;
  }

  move(): number {
    this.rotation += this.spin;
    this.y -= this.speed * this.level;

    return this.y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const power = Math.exp(this.energy);
    const scale = this.scale * power;
    const alpha = this.alpha * this.energy * 2;

    this.decayScale = Math.max(this.decayScale, scale);
    this.decayAlpha = Math.max(this.decayAlpha, alpha);

    this.smoothedScale += (this.decayScale - this.smoothedScale) * 0.3;
    this.smoothedAlpha += (this.decayAlpha - this.smoothedAlpha) * 0.3;

    this.decayScale *= 0.985;
    this.decayAlpha *= 0.975;

    ctx.save();
    ctx.beginPath();
    ctx.translate(this.x + Math.cos(this.rotation * this.speed) * 250, this.y);
    ctx.rotate(this.rotation);
    ctx.scale(this.smoothedScale * this.level, this.smoothedScale * this.level);
    ctx.moveTo(this.size * 0.5, 0);
    ctx.lineTo(this.size * -0.5, 0);
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.globalAlpha = this.smoothedAlpha / this.level;
    ctx.strokeStyle = this.color;
    ctx.stroke();

    return ctx.restore();
  }
}
