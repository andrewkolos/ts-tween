import { EventSource, InheritableEventEmitter } from '@akolos/event-emitter';
import { Timeline, TimelineEvents } from './timeline';
import { TimelineRunner } from '../timeline-runner/timeline-runner';

export abstract class AbstractTimeline extends InheritableEventEmitter<TimelineEvents<AbstractTimeline>> implements Timeline, EventSource<TimelineEvents<AbstractTimeline>> {

  private readonly _length: number;
  private _localTime: number;
  private _stopped: boolean;

  public get length(): number {
    return this._length;
  }

  public get localTime(): number {
    return this._localTime;
  }

  public stopped(): boolean {
    return this._stopped;
  }

  public constructor(length: number) {
    super();
    this._length = length;
    this._localTime = 0;
    this._stopped = false;

    TimelineRunner._registerTimeline(this);
  }

  public stop() {
    this._stopped = true;
    TimelineRunner._unregisterTimeline(this);
    this._stop();
  }

  public seek(time: number) {
    const from = this.localTime;
    this.__update(time - from);
    this._seek(from, time);
    if (time < this.length) {
      TimelineRunner._registerTimeline(this);
    }
  }

  public complete() {
    this.seek(this.length);
  }

  public __update(dt: number) {
    if (this._stopped) return;
    this._localTime = Math.max(Math.min(this._localTime + dt, this.length), 0);
    this._update(dt);
    if (this.localTime >= this.length) {
      this._completed();
      TimelineRunner._unregisterTimeline(this);
    }
  }

  protected abstract _start(): void;
  protected abstract _stop(): void;
  protected abstract _seek(from: number, to: number): void;
  protected abstract _completed(): void;
  protected abstract _update(dt: number): void
}
