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

export interface LazyTimerOpts {
  startTime?: number;
}

export class LazyTimer extends EventEmitter<LazyTimerEvents> implements Timeline {

  private _localTime: number;

  private _stopped = true;
  private timeOfLastUpdate: number;

  public get localTime() {
    return this._localTime;
  }

  public get stopped() {
    return this._stopped;
  }

  public constructor(public readonly length: number, opts: LazyTimerOpts = {}) {
    super();

    const now = opts.startTime != null ? opts.startTime : getNow();

    this._localTime = 0;
    this.timeOfLastUpdate = now;
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
    const now = getNow();
    this._localTime = time;
    this.timeOfLastUpdate = now;
    this.update(now)
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
    const previousLocalTime = this._localTime;

    const dt = now - timeOfLastUpdate(this);
    this._localTime = Math.max(Math.min(this._localTime + dt, this.length), 0);

    this.emit('update', dt, this);

    if (this._localTime >= this.length && this._localTime >= previousLocalTime) {
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

  private setTimeOfLastUpdateToNow() {
    this.timeOfLastUpdate = getNow();
  }
}