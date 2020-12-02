import { Timeline } from '../timeline/timeline';
import { BrowserTimelineRunnerStrategy } from './strategy/browser-timeline-runner-strategy'
import { TimelineRunnerStrategy } from './strategy/timeline-runner-strategy'
import { LazyStopwatch } from '../misc/lazy-stopwatch';
import { TimelineEvents } from '../timeline/timeline-events';
import { Handler } from '@akolos/event-emitter';
import { IntervalTimelineRunnerStrategy } from './strategy/interval-timeline-runner-strategy';

export class TimelineRunner {

  private static timelines = new Map<Timeline, TimelineRegistration>();

  private static strategy: TimelineRunnerStrategy;

  private static stopwatch = new LazyStopwatch().start();

  public static changeStrategy(newStrategy: TimelineRunnerStrategy) {
    if (this.strategy) {
      this.strategy.stop();
    }

    newStrategy.start(() => {
      const dt = this.stopwatch.update();
      this.timelines.forEach(tr => tr.timeline.__update(tr.timeline.localTime + dt));
    });

    this.strategy = newStrategy;
  }

  public static _registerTimeline(timeline: Timeline) {

    const doneHandler = () => this._unregisterTimeline(timeline);
    const soughtHandler = () => {
      if (timeline.localTime >= timeline.length) {
        this._unregisterTimeline(timeline);
      }
    }

    const registration: TimelineRegistration = {
      timeline,
      doneHandler,
      soughtHandler,
    }

    this.timelines.set(timeline, registration);
  }

  public static _unregisterTimeline(timeline: Timeline) {
    this.timelines.delete(timeline);
  }
}

const isNode = typeof process !== 'undefined'
  && process.versions != null
  && process.versions.node != null;

const defaultStrategy = isNode ? new IntervalTimelineRunnerStrategy(60) : new BrowserTimelineRunnerStrategy() ;
TimelineRunner.changeStrategy(defaultStrategy);

interface TimelineRegistration {
  timeline: Timeline,
  soughtHandler: Handler<TimelineEvents, 'sought'>;
  doneHandler: () => void;
}
