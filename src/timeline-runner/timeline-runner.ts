import { Timeline, TimelineEvents } from '../timeline';
import { BrowserTimelineRunnerStrategy } from './strategy/browser-timeline-runner-strategy'
import { TimelineRunnerStrategy } from './strategy/timeline-runner-strategy'
import { Handler } from '@akolos/event-emitter';
import { LazyStopwatch } from '../lazy-stopwatch';

export class TimelineRunner {

  private static timelines = new Map<Timeline, TimelineRegistration>();

  private static strategy: TimelineRunnerStrategy = new BrowserTimelineRunnerStrategy();

  private static stopwatch = new LazyStopwatch().start();

  public static changeStrategy(newStrategy: TimelineRunnerStrategy) {
    this.strategy.stop();
    newStrategy.start(() => this.timelines.forEach(t => t.timeline.__update(this.stopwatch.update())));
    this.strategy = newStrategy;
  }

  public static registerTimeline(timeline: Timeline) {

    const doneHandler = () => this.unregisterTimeline(timeline);
    const soughtHandler = () => {
      if (timeline.localTime >= timeline.length) {
        this.unregisterTimeline(timeline);
      }
    }

    const registration: TimelineRegistration = {
      timeline,
      doneHandler,
      soughtHandler,
    }

    this.timelines.set(timeline, registration);
  }

  public static unregisterTimeline(timeline: Timeline) {
    this.timelines.delete(timeline);
  }
}

interface TimelineRegistration {
  timeline: Timeline,
  soughtHandler: Handler<TimelineEvents, 'sought'>;
  doneHandler: () => void;
}