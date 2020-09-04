import { EventEmitter } from '@akolos/event-emitter';
import { Timeline } from './timeline';
import { getNow } from './misc/getNow';

interface LazyTimerEvents {
  completed: (source: LazyTimer) => void;
  sought: (value: {from: number, to: number}, source: LazyTimer) => void;
  update: (dt: number, source: LazyTimer) => void;
}

export interface LazyTimerOpts {
  startTime?: number;
}

export class LazyTimer extends EventEmitter<LazyTimerEvents> implements Timeline {

  private _localTime: number;

  private timeOfLastUpdate: number;

  public get localTime() {
    return this._localTime;
  }

  public constructor(public readonly length: number, opts: LazyTimerOpts = {}) {
    super();

    const now = opts.startTime != null ? opts.startTime : getNow();

    this._localTime = 0;
    this.timeOfLastUpdate = now;
  }

  public seek(time: number): this {
    const now = getNow();
    this._localTime = time;
    this.timeOfLastUpdate = now;
    this.update(now)
    return this;
  }

  public update(now = getNow()): this {
    const previousLocalTime = this._localTime;

    const dt = now - timeOfLastUpdate(this);
    this._localTime = Math.max(Math.min(this._localTime + dt, this.length), 0);

    this.emit('update', dt, this);

    if (this._localTime >= this.length && this._localTime >= previousLocalTime) {
      this.emit('completed', this);
    }

    this.timeOfLastUpdate = now;

    function timeOfLastUpdate(self: LazyTimer): number {
      if (self.timeOfLastUpdate == null) {
        throw Error('Attempted to update timer before it was ever started.');
      }
      return self.timeOfLastUpdate;
    }

    return this;
  }

}