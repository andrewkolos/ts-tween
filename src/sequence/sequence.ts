import { Timeline } from 'timeline';
import { Sequenced } from './sequenced-timeline';
import { LazyTimer } from 'lazy-timer';
import { EventEmitter } from '@akolos/event-emitter';
import { getNow } from 'misc/getNow';

interface SequenceEvents<T extends Timeline> {
  complete: (source: Sequence<T>) => void;
  stop: (source: Sequence<T>) => void;
  start: (source: Sequence<T>) => void;
  seek: (from: number, to: number, source: Sequence<T>) => void;
  timelineActive: (timeline: T, source: Sequence<T>) => void;
  timelineDeactive: (timeline: T, source: Sequence<T>) => void;
  update: (dt: number, source: Sequence<T>) => void;
}

export class Sequence<T extends Timeline> extends EventEmitter<SequenceEvents<T>> implements Timeline {
  private internalTimer: LazyTimer;
  private readonly items: Sequenced<T>[];
  private readonly activeTimelines = new Set<T>();

  public get localTime() {
    return this.internalTimer.localTime;
  }

  public constructor(sequenceItems: Sequenced<T>[]) {
    super();
    this.items = sequenceItems.sort((a, b) => a.startTime - b.startTime);
    const latestEndingTime = sequenceItems.reduce((latestSoFar, currentItem) => {
      return Math.max(latestSoFar, currentItem.startTime + currentItem.timeline.length);
    }, 0);
    this.internalTimer = new LazyTimer(latestEndingTime);
    this.internalTimer.on('start', () => this.emit('start', this))
      .on('complete', () => this.emit('complete', this))
      .on('start', () => this.emit('start', this))
      .on('seek', (from, to) => this.emit('seek', from, to, this))
      .on('update', (dt) => {
        this.updateTimelines();
        this.emit('update', dt, this);
      });
  }

  public update(currentTime = getNow()): this {
    this.internalTimer.seek(currentTime);
    return this;
  }

  public seek(time: number): this {
    this.internalTimer.seek(time);
    return this;
  }

  public start(): this {
    this.internalTimer.start();
    return this;
  }

  public stop(): this {
    this.internalTimer.stop();
    return this;
  }

  public get stopped(): boolean {
    return this.internalTimer.stopped;
  }

  public get length() {
    return this.internalTimer.length;
  }

  private updateTimelines() {
    const timelinesUpdated = new Set<T>();
    this.items.forEach(si => {
      const { startTime, timeline } = si;
      if (this.localTime > startTime && this.localTime <= startTime + timeline.length) {
        if (!this.activeTimelines.has(timeline)) {
          this.emit('timelineActive', timeline, this);
        }
        timeline.seek(this.localTime - startTime);
        timelinesUpdated.add(timeline);
      }
    });

    for (const at of this.activeTimelines.values()) {
      if (!timelinesUpdated.has(at)) {
        this.emit('timelineDeactive', at, this)
        this.activeTimelines.delete(at);
      }
    }
  }

}

