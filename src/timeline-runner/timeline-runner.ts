import { Timeline } from '../timeline/timeline';
import { BrowserTimelineRunnerStrategy } from './strategy/browser-timeline-runner-strategy'
import { TimelineRunnerStrategy } from './strategy/timeline-runner-strategy'
import { LazyStopwatch } from '../misc/lazy-stopwatch';
import { TimelineEvents } from '../timeline/timeline-events';
import { Handler } from '@akolos/event-emitter';

export class TimelineRunner {

  private static timelines = new Map<Timeline, TimelineRegistration>();

  private static strategy: TimelineRunnerStrategy = new BrowserTimelineRunnerStrategy();

  private static stopwatch = new LazyStopwatch().start();

  public static changeStrategy(newStrategy: TimelineRunnerStrategy) {
    this.strategy.stop();
    newStrategy.start(() => this.timelines.forEach(t => t.timeline.__update(this.stopwatch.update())));
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

interface TimelineRegistration {
  timeline: Timeline,
  soughtHandler: Handler<TimelineEvents, 'sought'>;
  doneHandler: () => void;
}
