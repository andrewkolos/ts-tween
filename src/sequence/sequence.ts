import { Timeline } from 'timeline';
import { Sequenced } from './sequenced-timeline';
import { LazyTimer } from 'lazy-timer';
import { EventEmitter } from '@akolos/event-emitter';
import { getNow } from 'misc/getNow';

interface SequenceEvents<T extends Timeline> {
  complete: (source: Sequence<T>) => void;
  seek: (from: number, to: number, source: Sequence<T>) => void;
  timelineActive: (timeline: T, source: Sequence<T>) => void;
  timelineDeactive: (timeline: T, source: Sequence<T>) => void;
  update: (dt: number, source: Sequence<T>) => void;
}

export class Sequence<T extends Timeline> extends EventEmitter<SequenceEvents<T>> implements Timeline {
  private internalTimer: LazyTimer;
  private readonly items: Sequenced<T>[];
  private readonly _activeTimelines = new Set<T>();

  public get localTime() {
    return this.internalTimer.localTime;
  }

  /**
   * The timelines that are currently playing. More specifically, all timelines that advanced
   * during this sequence's last update.
   */
  public get activeTimelines(): ReadonlySet<T> {
    return this._activeTimelines;
  }

  public constructor(sequenceItems: Sequenced<T>[]) {
    super();
    this.items = sequenceItems.sort((a, b) => a.startTime - b.startTime);
    const latestEndingTime = sequenceItems.reduce((latestSoFar, currentItem) => {
      return Math.max(latestSoFar, currentItem.startTime + currentItem.timeline.length);
    }, 0);
    this.internalTimer = new LazyTimer(latestEndingTime);
    this.internalTimer
      .on('complete', () => this.emit('complete', this))
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

  public get length() {
    return this.internalTimer.length;
  }

  private updateTimelines() {
    this.items.forEach(si => {
      const { startTime, timeline } = si;
      if (itemIsInFutureButIsAlsoInProgress(si, this)) {
        removeFromActive(timeline, this);
        timeline.seek(0);
      }
      if (itemIsInPastButIsNotCompleted(si, this)) {
        removeFromActive(timeline, this);
        timeline.seek(timeline.length);
      } else if (startTime <= this.localTime && this.localTime <= startTime + timeline.length) {
        addToActive(timeline, this);
        timeline.seek(this.localTime - startTime);
        if (timeline.localTime >= timeline.length) {
          removeFromActive(timeline, this);
        }
      }
    });

    function itemIsInFutureButIsAlsoInProgress(item: Sequenced<T>, self: Sequence<T>) {
      return self.localTime < item.startTime &&
        item.timeline.localTime > 0;
    }

    function itemIsInPastButIsNotCompleted(item: Sequenced<T>, self: Sequence<T>) {
      const {startTime, timeline} = item;
      return self.localTime > startTime + timeline.length &&
        timeline.localTime < timeline.length;
    }

    function addToActive(timeline: T, self: Sequence<T>) {
      if (isActive(timeline, self)) return;
      self._activeTimelines.add(timeline);
      self.emit('timelineActive', timeline, self);
    }

    function removeFromActive(timeline: T, self: Sequence<T>) {
      if (!isActive(timeline, self)) return;
      self._activeTimelines.delete(timeline);
      self.emit('timelineDeactive', timeline, self);
    }

    function isActive(timeline: T, self: Sequence<T>) {
      return self._activeTimelines.has(timeline);
    }
  }

}

