import { InheritableEventEmitter } from '@akolos/event-emitter';
import { getNow } from './misc/getNow';

export interface LazyStopWatchEvents {
  sought: [value: { from: number, to: number }, source: LazyStopwatch];
  updated: [dt: number, source: LazyStopwatch];
}

export interface LazyStopwatchOpts {
  startTime?: number;
}

export class LazyStopwatch extends InheritableEventEmitter<LazyStopWatchEvents> {

  public readonly startTime: number;

  protected _time: number;

  private timeOfLastUpdate: number;

  public get time() {
    return this._time;
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
    this.emit('sought', {from: oldTime, to: this._time}, this);
    return this;
  }

  public update(now = getNow()): this {
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

    return this;
  }

}