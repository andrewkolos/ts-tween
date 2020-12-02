import { TimelineRunnerStrategy } from './timeline-runner-strategy';
import { TimelineUpdater } from '../timeline-updater';

export class BrowserTimelineRunnerStrategy implements TimelineRunnerStrategy {
  private stopped = false;
  private timelineUpdater?: TimelineUpdater;

  public start(timelineUpdater: TimelineUpdater) {
    this.stopped = false;
    this.timelineUpdater = timelineUpdater;
    requestAnimationFrame(() => this.updateTweens());
    return this;
  }

  public stop() {
    this.stopped = true;
    return this;
  }

  private updateTweens() {
    if (!this.timelineUpdater) {
      throw Error('Cannot update tweens before given a tween updater.');
    }

    this.timelineUpdater();

    if (!this.stopped) {
      requestAnimationFrame(() => this.updateTweens());
    }
  }
}
