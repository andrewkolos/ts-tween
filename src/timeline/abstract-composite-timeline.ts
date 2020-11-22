import { AbstractTimeline } from './abstract-timeline';
import { Timeline } from './timeline';
import { TimelineRunner } from '../timeline-runner/timeline-runner';

export abstract class AbstractCompositeTimeline<T extends Timeline> extends AbstractTimeline implements Timeline {

  public constructor(protected readonly timelines: ReadonlyArray<T>, length: number) {
    super(length);

    const register = () => {
      this.timelines.forEach(t => TimelineRunner._unregisterTimeline(t));
      TimelineRunner._registerTimeline(this);
    };

    const unregister = () => TimelineRunner._unregisterTimeline(this);

    this.on('started', register);
    this.on('sought', () => this.localTime >= this.length ? register() : {})
    this.on('completed', unregister);
    this.on('stopped', unregister);

    timelines.forEach(t => TimelineRunner._unregisterTimeline(t));
    TimelineRunner._registerTimeline(this);
  }
}
