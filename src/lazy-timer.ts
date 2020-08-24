import { EventEmitter } from '@akolos/event-emitter';
import { Timeline } from 'timeline';
import { getNow } from 'misc/getNow';

interface LazyTimerEvents {
  complete: (source: LazyTimer) => void;
  pause: (source: LazyTimer) => void;
  resume: (source: LazyTimer) => void;
  seek: (from: number, to: number, source: LazyTimer) => void;
  update: (dt: number, source: LazyTimer) => void;
}

export class LazyTimer extends EventEmitter<LazyTimerEvents> implements Timeline {

  private _localTime: number;

  private _paused = false;
  public readonly startTime: number;
  private timeOfLastUpdate?: number;

  public get localTime() {
    return this._localTime;
  }

  public get paused() {
    return this._paused;
  }

  public get completed() {
    return this.isComplete();
  }

  public constructor(public readonly length: number) {
    super();
    this.startTime = getNow();
    this._localTime = 0;
  }

  public resume(): this {
    if (this._paused) {
      this.emit('resume', this);
      this.setTimeOfLastUpdateToNow();
    }

    this._paused = false;
    return this;
  }

  public seek(time: number): this {
    this._localTime = Math.min(time, this.length);
    this.isComplete();
    this.setTimeOfLastUpdateToNow();
    return this;
  }

  public pause(): this {
    if (this._paused) {
      this.emit('pause', this);
    }
    this._paused = true;
    return this;
  }

  public update(now = getNow()) {
    if (this.isComplete() || this.paused) return;

    const dt = now - timeOfLastUpdate(this);

    const wasAlreadyCompleted = this.completed;
    this._localTime += dt;

    this.emit('update', dt, this);

    if (this.isComplete() && !wasAlreadyCompleted) {
      this.emit('complete', this);
    }

    this.timeOfLastUpdate = now;

    function timeOfLastUpdate(self: LazyTimer): number {
      return self.timeOfLastUpdate != null ? self.timeOfLastUpdate : self.startTime;
    }
  }

  private isComplete() {
    return this._localTime >= this.length;
  }

  private setTimeOfLastUpdateToNow() {
    this.timeOfLastUpdate = getNow();
  }
}