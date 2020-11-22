import { EventEmitter } from '@akolos/event-emitter';
import { TimelineEvents } from './timeline';
import { AbstractCompositeTimeline } from './timeline/abstract-composite-timeline';
import { Timeline } from './timeline/timeline';

export interface GroupEvents<T extends Timeline> extends TimelineEvents<Group<T>> {
  completed: [event: {}, source: Group<T>];
  sought: [event: { from: number }, source: Group<T>];
  updated: [event: { dt: number }, source: Group<T>];
}

export class Group<T extends Timeline> extends AbstractCompositeTimeline<T> implements Timeline {

  private readonly eventEmitter = new EventEmitter<GroupEvents<T>>();
  public readonly on = this.eventEmitter.makeDelegate('on', this);
  public readonly off = this.eventEmitter.makeDelegate('off', this);
  protected readonly emit = this.eventEmitter.makeDelegate('emit', this);

  public constructor(timelines: T[]) {
    super(timelines, longestTimelineLength());
    function longestTimelineLength() {
      return timelines.reduce((longestLength: number, t: T) => Math.max(longestLength, t.length), 0);
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
    this.timelines.forEach(t => t.seek(this.localTime));
  }
}
