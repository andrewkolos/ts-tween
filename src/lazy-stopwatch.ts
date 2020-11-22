import { InheritableEventEmitter } from '@akolos/event-emitter';
import { getNow } from './misc/getNow';

export interface LazyStopwatchEvents {
  started: [source: LazyStopwatch];
  stopped: [source: LazyStopwatch];
  sought: [from: number, source: LazyStopwatch];
  updated: [dt: number, source: LazyStopwatch];
}

export interface LazyStopwatchOpts {
  startTime?: number;
}

export class LazyStopwatch extends InheritableEventEmitter<LazyStopwatchEvents> {

  public readonly startTime: number;

  protected _time: number;
  private _stopped = true;

  private timeOfLastUpdate: number;

  public get time() {
    return this._time;
  }

  public get stopped() {
    return this._stopped;
  }

  public constructor(opts: LazyStopwatchOpts = {}) {
    super();
    const now = opts.startTime != null ? opts.startTime : getNow();

    this._time = 0;
    this.timeOfLastUpdate = now;
    this.startTime = now;
  }

  public seek(time: number): this {
    const now = getNow();
    const oldTime = this._time
    this._time = time;
    this.timeOfLastUpdate = now;
    this.update(now)
    this.emit('sought', oldTime, this);
    return this;
  }

  public update(now = getNow()): number {
    if (this.stopped) return 0;

    const dt = now - timeOfLastUpdate(this);
    this._time = Math.max(this._time + dt, 0);

    this.emit('updated', dt, this);

    this.timeOfLastUpdate = now;

    function timeOfLastUpdate(self: LazyStopwatch): number {
      if (self.timeOfLastUpdate == null) {
        throw Error('Attempted to update timer before it was ever started.');
      }
      return self.timeOfLastUpdate;
    }

    return dt;
  }

  public start(): this {
    this._stopped = false;
    this.timeOfLastUpdate = getNow();
    this.emit('started', this);
    return this;
  }

  public stop(): this {
    this._stopped = true;
    this.emit('stopped', this);
    return this;
  }

}
