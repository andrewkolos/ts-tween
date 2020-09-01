import { EventEmitter } from '@akolos/event-emitter';
import { Timeline } from 'timeline';
import { getNow } from 'misc/getNow';

interface LazyTimerEvents {
  complete: (source: LazyTimer) => void;
  start: (source: LazyTimer) => void;
  stop: (source: LazyTimer) => void;
  seek: (from: number, to: number, source: LazyTimer) => void;
  update: (dt: number, source: LazyTimer) => void;
}

export class LazyTimer extends EventEmitter<LazyTimerEvents> implements Timeline {

  private _localTime: number;

  private _stopped = true;
  private timeOfLastUpdate?: number;

  public get localTime() {
    return this._localTime;
  }

  public get stopped() {
    return this._stopped;
  }

  public get completed() {
    return this.isComplete();
  }

  public constructor(public readonly length: number) {
    super();
    this._localTime = 0;
  }

  public start(): this {
    if (this._stopped) {
      this.emit('start', this);
      this.setTimeOfLastUpdateToNow();
    }

    this._stopped = false;
    return this;
  }

  public seek(time: number): this {
    this._localTime = Math.min(time, this.length);
    this.isComplete();
    this.setTimeOfLastUpdateToNow();
    return this;
  }

  public stop(): this {
    if (this._stopped) {
      this.emit('stop', this);
    }
    this._stopped = true;
    return this;
  }

  public update(now = getNow()) {
    if (this.isComplete() || this.stopped) return;

    const dt = now - timeOfLastUpdate(this);

    const wasAlreadyCompleted = this.completed;
    this._localTime += dt;

    this.emit('update', dt, this);

    if (this.isComplete() && !wasAlreadyCompleted) {
      this.emit('complete', this);
    }

    this.timeOfLastUpdate = now;

    function timeOfLastUpdate(self: LazyTimer): number {
      if (self.timeOfLastUpdate == null) {
        throw Error('Attempted to update timer before it was ever started.');
      }
      return self.timeOfLastUpdate;
    }
  }

  private isComplete() {
    return this._localTime >= this.length;
  }

  private setTimeOfLastUpdateToNow() {
    this.timeOfLastUpdate = getNow();
  }
}