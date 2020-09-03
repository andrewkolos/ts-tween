import { Timeline } from 'timeline';
import { Sequenced } from './sequenced-timeline';
import { LazyTimer } from 'lazy-timer';
import { EventEmitter } from '@akolos/event-emitter';
import { getNow } from 'misc/getNow';

interface SequenceEvents<T extends Timeline> {
  completed: (source: Sequence<T>) => void;
  sought: (value: {from: number, to: number}, source: Sequence<T>) => void;
  timelineActivated: (timeline: T, source: Sequence<T>) => void;
  timelineDeactivated: (timeline: T, source: Sequence<T>) => void;
  update: (dt: number, source: Sequence<T>) => void;
}

export class Sequence<T extends Timeline> extends EventEmitter<SequenceEvents<T>> implements Timeline {
  private internalTimer: LazyTimer;
  private readonly _items: Sequenced<T>[];
  private readonly _activeTimelines = new Set<T>();

  public get playheadPosition() {
    return this.internalTimer.playheadPosition;
  }

  /**
   * The set of all timelines that were updated during this sequence's most recent update.
   */
  public getActiveTimelines(): ReadonlySet<T> {
    return new Set(this._activeTimelines);
  }

  public getItems(): ReadonlyArray<Sequenced<T>>{
    return this._items.slice();
  }

  public constructor(sequenceItems: Sequenced<T>[]) {
    super();
    this._items = sequenceItems.sort((a, b) => a.startTime - b.startTime);
    const latestEndingTime = sequenceItems.reduce((latestSoFar, currentItem) => {
      return Math.max(latestSoFar, currentItem.startTime + currentItem.timeline.length);
    }, 0);
    this.internalTimer = new LazyTimer(latestEndingTime);
    this.internalTimer
      .on('completed', () => this.emit('completed', this))
      .on('sought', ({from, to}) => this.emit('sought', {from, to}, this))
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
    this._items.forEach(si => {
      const { startTime, timeline } = si;
      if (itemIsInFutureButIsAlsoInProgress(si, this)) {
        removeFromActive(timeline, this);
        timeline.seek(0);
      }
      if (itemIsInPastButIsNotCompleted(si, this)) {
        removeFromActive(timeline, this);
        timeline.seek(timeline.length);
      } else if (startTime <= this.playheadPosition && this.playheadPosition <= startTime + timeline.length) {
        addToActive(timeline, this);
        timeline.seek(this.playheadPosition - startTime);
        if (timeline.playheadPosition >= timeline.length) {
          removeFromActive(timeline, this);
        }
      }
    });

    function itemIsInFutureButIsAlsoInProgress(item: Sequenced<T>, self: Sequence<T>) {
      return self.playheadPosition < item.startTime &&
        item.timeline.playheadPosition > 0;
    }

    function itemIsInPastButIsNotCompleted(item: Sequenced<T>, self: Sequence<T>) {
      const {startTime, timeline} = item;
      return self.playheadPosition > startTime + timeline.length &&
        timeline.playheadPosition < timeline.length;
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

