// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings/sketch-js.d.ts" />
import * as Sketch from 'sketch-js';
import { Particle } from './particle';
import { random } from 'lodash-es';
import { NUM_BANDS, NUM_PARTICLES, SMOOTHING } from './const';

type OnUpdate = (bands: Uint8Array) => void;

class AudioAnalyser {
  numBands: number;
  smoothing: number;
  bands!: Uint8Array;
  onUpdate!: OnUpdate;

  constructor(numBands = 256, smoothing = 0.3) {
    this.numBands = numBands;
    this.smoothing = smoothing;
  }
}

export const initVisualizer = (container: HTMLElement) => {
  const sketch = Sketch.create({
    container,
    particles: [],
    interval: 2,
    setup() {
      // generate some particles
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const particle = new Particle(random(this.width), random(this.height));
        particle.energy = random(particle.band / 256);

        this.particles.push(particle);
      }

      // setup the audio analyser
      const analyser = new AudioAnalyser(NUM_BANDS, SMOOTHING);

      // update particles based on fft transformed audio frequencies
      analyser.onUpdate = (bands: Uint8Array) =>
        this.particles.map(
          (particle: Particle): Particle => {
            particle.energy = bands[particle.band] / 256;

            return particle;
          }
        );
    },

    draw() {
      this.globalCompositeOperation = 'lighter';

      return this.particles.map((particle: Particle) => {
        if (particle.y < -particle.size * particle.level * particle.scale * 2) {
          particle.reset();
          particle.x = random(this.width);
          particle.y = this.height + particle.size * particle.scale * particle.level * 2;
        }

        particle.move();

        return particle.draw(this);
      });
    }
  });

  return sketch;
};
