/**
 * A finite, seekable timeline with an injected monotonic clock / frame scheduler.
 * User intent (playing) and environmental suspension are deliberately separate.
 * This class has no DOM dependency; there can be at most one outstanding frame.
 */
export class AtlasPlayback {
  constructor({duration = 10400, steps = 4, position = 0, onUpdate = () => {},
    now = () => performance.now(), requestFrame = callback => requestAnimationFrame(callback),
    cancelFrame = id => cancelAnimationFrame(id)} = {}) {
    if (!Number.isFinite(duration) || duration <= 0) throw new RangeError('duration must be positive');
    if (!Number.isInteger(steps) || steps < 2) throw new RangeError('steps must be an integer >= 2');
    this.duration = duration;
    this.steps = steps;
    this.position = this.bound(position, 0, duration);
    this.rate = 1;
    this.loop = false;
    this.playing = false;
    this.allowed = true;
    this.suspensions = new Set();
    this.disposed = false;
    this.frame = null;
    this.lastTime = null;
    this.now = now;
    this.requestFrame = requestFrame;
    this.cancelFrame = cancelFrame;
    this.onUpdate = onUpdate;
  }

  bound(value, min, max) {
    if (!Number.isFinite(value)) throw new TypeError('Timeline values must be finite numbers');
    return Math.max(min, Math.min(max, value));
  }

  get snapshot() {
    const progress = this.position / this.duration;
    return Object.freeze({position: this.position, duration: this.duration, progress,
      step: Math.min(this.steps - 1, Math.floor(progress * this.steps)),
      steps: this.steps, playing: this.playing, running: this.running,
      suspended: this.suspensions.size > 0, allowed: this.allowed,
      completed: this.position === this.duration, speed: this.rate, loop: this.loop});
  }

  get running() {
    return !this.disposed && this.playing && this.allowed && this.suspensions.size === 0;
  }

  sample(timestamp) {
    if (!this.running || this.lastTime === null) return;
    const elapsed = Math.max(0, timestamp - this.lastTime);
    this.lastTime = Math.max(this.lastTime, timestamp);
    this.position += elapsed * this.rate;
    if (this.position >= this.duration) {
      if (this.loop) this.position %= this.duration;
      else {this.position = this.duration; this.playing = false; this.lastTime = null;}
    }
  }

  cancel() {
    if (this.frame !== null) this.cancelFrame(this.frame);
    this.frame = null;
  }

  emit(reason) {
    if (!this.disposed) this.onUpdate(this.snapshot, reason);
  }

  schedule() {
    if (!this.running || this.frame !== null) return;
    this.frame = this.requestFrame(timestamp => {
      this.frame = null;
      if (!this.running) return;
      this.sample(timestamp);
      this.emit('frame');
      this.schedule(); // A callback may have paused/disposed us; re-check running.
    });
  }

  play() {
    if (this.disposed || !this.allowed || this.playing) return false;
    if (this.position >= this.duration) this.position = 0;
    this.playing = true;
    this.lastTime = this.running ? this.now() : null;
    this.emit('play');
    this.schedule();
    return true;
  }

  pause() {
    if (this.disposed) return;
    this.sample(this.now());
    this.playing = false;
    this.lastTime = null;
    this.cancel();
    this.emit('pause');
  }

  seek(position) {
    if (this.disposed) return;
    // A manual seek claims control. It never competes with an automatic advance.
    const bounded = this.bound(position, 0, this.duration);
    this.playing = false;
    this.lastTime = null;
    this.cancel();
    this.position = bounded;
    this.emit('seek');
  }

  seekStep(index) {
    const step = Math.trunc(this.bound(index, 0, this.steps - 1));
    this.seek(step * this.duration / this.steps);
  }

  next() { this.seekStep(Math.min(this.steps - 1, this.snapshot.step + 1)); }
  previous() { this.seekStep(Math.max(0, this.snapshot.step - 1)); }
  restart() { this.seek(0); }

  setSpeed(rate) {
    if (this.disposed) return;
    const bounded = this.bound(rate, 0.25, 2);
    this.sample(this.now()); // Settle time at the old rate first.
    this.rate = bounded;
    if (!this.running) this.cancel();
    this.emit('speed');
  }

  setLoop(loop) {
    if (this.disposed) return;
    this.sample(this.now());
    this.loop = Boolean(loop);
    if (!this.running) this.cancel();
    this.emit('loop');
  }

  setAllowed(allowed) {
    if (this.disposed || this.allowed === Boolean(allowed)) return;
    this.sample(this.now());
    this.allowed = Boolean(allowed);
    if (!this.allowed) {
      this.playing = false;
      this.lastTime = null;
      this.cancel();
    }
    this.emit('preference'); // Re-enabling motion never starts playback by itself.
  }

  suspend(reason, suspended) {
    if (this.disposed || this.suspensions.has(reason) === Boolean(suspended)) return;
    this.sample(this.now());
    if (suspended) this.suspensions.add(reason); else this.suspensions.delete(reason);
    this.cancel();
    this.lastTime = this.running ? this.now() : null;
    this.emit('visibility');
    this.schedule();
  }

  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.playing = false;
    this.lastTime = null;
    this.cancel();
    this.onUpdate = () => {};
    this.suspensions.clear();
  }
}

/** The two continuous labs share the same timeline as their inspector sliders. */
export const timelineForLab = id => id === 'easing'
  ? {key: 't', max: 100, duration: 6000}
  : id === 'race' ? {key: 'time', max: 2800, duration: 8400} : null;
