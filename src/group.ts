import { InheritableEventEmitter } from '@akolos/event-emitter';
import { LazyTimer } from './lazy-timer';
import { Timeline, TimelineEvents } from './timeline';

export interface GroupEvents<T extends Timeline> extends TimelineEvents<Group<T>> {
  completed: [event: {}, source: Group<T>];
  sought: [event: { from: number, to: number }, source: Group<T>];
  timelineCompleted: [event: { timeline: T }, source: Group<T>];
  updated: [event: { dt: number }, source: Group<T>];
}

export class Group<T extends Timeline> extends InheritableEventEmitter<GroupEvents<T>> implements Timeline {

  private readonly timer: LazyTimer;

  public get length(): number {
    return this.timer.length;
  }

  public get localTime(): number {
    return this.timer.time;
  }

  private readonly timelines: ReadonlyArray<T>;
  public constructor(timelines: T[]) {
    super();
    this.timelines = timelines;
    this.timer = new LazyTimer(longestTimelineLength());
    this.timer
      .on('completed', () => this.emit('completed', {}, this))
      .on('sought', ({ from, to }: { from: number, to: number }) => this.emit('sought', { from, to }, this))
      .on('updated', (dt: number) => {
        this.updateTimelines();
        this.emit('updated', { dt }, this);
      });

    function longestTimelineLength() {
      return timelines.reduce((longestLength: number, t: T) => Math.max(longestLength, t.length), 0);
    }
  }

  public seek(time: number): void {
    this.timer.seek(time);
  }

  public update(currentTime?: number): void {
    this.timer.update(currentTime);
  }

  private updateTimelines() {
    this.timelines.forEach(t => t.seek(this.localTime));
  }
}