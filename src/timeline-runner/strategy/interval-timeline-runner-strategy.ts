import { TimelineUpdater } from '../timeline-updater';
import { TimelineRunnerStrategy } from './timeline-runner-strategy';

export class IntervalTimelineRunnerStrategy implements TimelineRunnerStrategy {
  private timelineUpdater?: TimelineUpdater;
  private intervalId?: NodeJS.Timeout | number;

  public constructor(public readonly intervalHz: number) { }

  public start(timelineUpdater: TimelineUpdater) {
    this.timelineUpdater = timelineUpdater;
    this.intervalId = setInterval(() => {
      this.updateTimelines();
    }, 1000 / this.intervalHz);
    return this;
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId as any);
      this.intervalId = undefined;
    }
    return this;
  }

  private updateTimelines() {
    if (!this.timelineUpdater) {
      throw Error('Cannot update tweens before given a tween updater.');
    }

    this.timelineUpdater();
  }
}
