import { LazyStopwatch, LazyStopwatchOpts } from './lazy-stopwatch';
import { InheritableEventEmitter } from '@akolos/event-emitter';
import { getNow } from './misc/getNow';

export interface LazyTimerEvents {
  completed: [source: LazyTimer];
  sought: [value: { from: number, to: number }, source: LazyTimer];
  updated: [dt: number, source: LazyTimer];
}

export interface LazyTimerOpts extends LazyStopwatchOpts { }

export class LazyTimer extends InheritableEventEmitter<LazyTimerEvents> {

  private readonly stopwatch: LazyStopwatch;

  public get time(): number {
    return this.stopwatch.time;
  }

  public constructor(public readonly length: number, opts: LazyTimerOpts = {}) {
    super();
    this.stopwatch = new LazyStopwatch(opts);
    this.stopwatch
      .on('sought', (value) => this.emit('sought', value, this))
      .on('updated', (dt: number) => {
        this.emit('updated', dt, this);
        if (this.time >= this.length) {
          this.emit('completed', this);
        }
      });
  }

  public seek(time: number): void {
    const clamped = Math.max(Math.min(time, this.length), 0);
    this.stopwatch.seek(clamped);
  }

  public update(currentTime: number = getNow()): void {
    const clamped = Math.max(Math.min(currentTime, this.stopwatch.startTime + this.length), this.stopwatch.startTime);
    this.stopwatch.update(clamped);
  }
}
