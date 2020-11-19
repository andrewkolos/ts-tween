import { Timeline, TimelineEvents } from '../timeline';
import { Sequenced } from './sequenced-timeline';
import { LazyTimer } from './../lazy-timer';
import { getNow } from '../misc/getNow';
import { InheritableEventEmitter } from '@akolos/event-emitter';

export interface SequenceEvents<T extends Timeline> extends TimelineEvents<Sequence<T>> {
  completed: [event: {}, source: Sequence<T>];
  sought: [event: { from: number, to: number }, source: Sequence<T>];
  timelineActivated: [timeline: T, source: Sequence<T>];
  timelineDeactivated: [timeline: T, source: Sequence<T>];
  updated: [event: {dt: number}, source: Sequence<T>];
}

export class Sequence<T extends Timeline> extends InheritableEventEmitter<SequenceEvents<T>> implements Timeline {
  private internalTimer: LazyTimer;
  private readonly _items: ReadonlySet<Sequenced<T>>;
  private readonly _activeTimelines = new Set<T>();

  /**
   * The progress of the sequence, in milliseconds.
   */
  public get localTime(): number {
    return this.internalTimer.time;
  }

  /**
   * The total length of the sequence, from the start time of the first item, to the end of time of the
   * last item.
   */
  public get length(): number {
    return this.internalTimer.length;
  }

  /**
   * The set of all timelines that were updated during this sequence's most recent update.
   */
  public getActiveTimelines(): ReadonlySet<T> {
    return new Set(this._activeTimelines);
  }

  /**
   * All timelines included in this sequence along with their start times.
   */
  public getItems(): ReadonlyArray<Sequenced<T>> {
    return [...this._items.values()];
  }

  /**
   * Creates a new sequence.
   * @param sequenceItems The timelines to include in this sequence, with each having a start time.
   */
  public constructor(sequenceItems: Sequenced<T>[]) {
    super();
    this._items = new Set(sequenceItems.sort((a, b) => a.startTime - b.startTime));
    const latestEndingTime = sequenceItems.reduce((latestSoFar, currentItem) => {
      return Math.max(latestSoFar, currentItem.startTime + currentItem.timeline.length);
    }, 0);
    this.internalTimer = new LazyTimer(latestEndingTime);
    this.internalTimer
      .on('completed', () => this.emit('completed', {}, this))
      .on('sought', ({ from, to }: {from: number, to: number}) => this.emit('sought', { from, to }, this))
      .on('updated', (dt: number) => {
        this.updateTimelines();
        this.emit('updated', { dt }, this);
      });
  }

  /**
   * Updates sequence to the current time, or another time, if provided.
   * @param [currentTime] The time to use as the current time.
   * @returns This sequence, for method chaining.
   */
  public update(currentTime = getNow()): this {
    this.internalTimer.seek(currentTime);
    return this;
  }

  /**
   * Moves the sequence to the specified time.
   * @param time The time, in milliseconds since the start, to seek to, up to the length of this sequence.
   * @returns This sequence, for method chaining.
   */
  public seek(time: number): this {
    this.internalTimer.seek(time);
    return this;
  }

  private updateTimelines() {
    this._items.forEach(si => {
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
      const { startTime, timeline } = item;
      return self.localTime > startTime + timeline.length &&
        timeline.localTime < timeline.length;
    }

    function addToActive(timeline: T, self: Sequence<T>) {
      if (isActive(timeline, self)) return;
      self._activeTimelines.add(timeline);
      self.emit('timelineActivated', timeline, self);
    }

    function removeFromActive(timeline: T, self: Sequence<T>) {
      if (!isActive(timeline, self)) return;
      self._activeTimelines.delete(timeline);
      self.emit('timelineDeactivated', timeline, self);
    }

    function isActive(timeline: T, self: Sequence<T>) {
      return self._activeTimelines.has(timeline);
    }
  }

}

