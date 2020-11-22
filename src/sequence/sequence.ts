import { Timeline, TimelineEvents } from '../timeline/timeline';
import { Sequenced } from './sequenced-timeline';
import { AbstractCompositeTimeline } from '../timeline/abstract-composite-timeline';
import { EventEmitter } from '@akolos/event-emitter';

export interface SequenceEvents<T extends Timeline> extends TimelineEvents<Sequence<T>> {
  completed: [event: {}, source: Sequence<T>];
  sought: [event: { from: number }, source: Sequence<T>];
  timelineActivated: [timeline: T, source: Sequence<T>];
  timelineDeactivated: [timeline: T, source: Sequence<T>];
  updated: [event: { dt: number }, source: Sequence<T>];
}

export class Sequence<T extends Timeline> extends AbstractCompositeTimeline<T> implements Timeline {

  private readonly eventEmitter = new EventEmitter<SequenceEvents<T>>();
  public readonly on = this.eventEmitter.makeDelegate('on', this);
  public readonly off = this.eventEmitter.makeDelegate('off', this);
  protected readonly emit = this.eventEmitter.makeDelegate('emit', this);

  private readonly _items: ReadonlySet<Sequenced<T>>;
  private readonly _activeTimelines = new Set<T>();

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
    super(sequenceItems.map(si => si.timeline), latestEndingTime());
    this._items = new Set(sequenceItems.sort((a, b) => a.startTime - b.startTime));

    function latestEndingTime() {
      return sequenceItems.reduce((latestSoFar, currentItem) => {
        return Math.max(latestSoFar, currentItem.startTime + currentItem.timeline.length);
      }, 0);
    }
  }

  public _update(dt: number): void {
    this.updateTimelines();
    this.emit('updated', { dt }, this);
  }

  protected _completed() {
    this.emit('completed', {}, this);
  }
  protected _start(): void {
    this.emit('started', {}, this);
  }
  protected _stop(): void {
    this.emit('stopped', {}, this);
  }
  protected _seek(from: number): void {
    this.emit('sought', { from }, this);
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
