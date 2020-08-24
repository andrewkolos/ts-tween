import { Timeline } from 'timeline';
import { Sequenced } from './sequenced-timeline';
import { LazyTimer } from 'lazy-timer';
import { EventEmitter } from '@akolos/event-emitter';

interface SequenceEvents<T extends Timeline> {
  complete: (source: Sequence<T>) => void;
  pause: (source: Sequence<T>) => void;
  resume: (source: Sequence<T>) => void;
  timelineStarted: <U extends T>(timeline: U, source: Sequence<T>) => void;
  timelineCompleted: <U extends T>(timeline: U, source: Sequence<T>) => void;
  update: <U extends T>(timelinesUpdated: U[], source: Sequence<T>) => void;
}

export class Sequence<T extends Timeline> extends EventEmitter<SequenceEvents<T>> implements Timeline {
  private internalTimer: LazyTimer;


  public constructor(private readonly sequenceItems: Sequenced<T>[]) {
    super();
    const latestEndingTime = sequenceItems.reduce((latestSoFar, currentItem) => {
      return Math.max(latestSoFar, currentItem.startTime + currentItem.timeline.length);
    }, 0);
    this.internalTimer = new LazyTimer(latestEndingTime);
  }

  public seek(time: number): this {
    this.internalTimer.seek(time);
    return this;
  }

  public resume(): this {
    this.internalTimer.resume();
    return this;
  }

  public pause(): this {
    this.internalTimer.pause();
    return this;
  }

  public get length() {
    return this.internalTimer.length;
  }

}