import { TimelineRunnerStrategy } from './timeline-runner-strategy';
import { TimelineUpdater } from '../timeline-updater';

export class ManualTimelineRunnerStrategy implements TimelineRunnerStrategy {
  private stopped = false;
  private timelineUpdater?: TimelineUpdater;

  public start(updateTimelines: TimelineUpdater) {
    this.timelineUpdater = updateTimelines;
    return this;
  }

  public stop() {
    this.stopped = true;
    return this;
  }

  public update() {
    this.updateTimelines();
  }

  private updateTimelines() {
    if (!this.timelineUpdater) {
      throw Error('Cannot update timelines before given a timeline updater.');
    }

    if (this.stopped) {
      throw Error('Cannot update timelines when this strategy is stopped.');
    }

    this.timelineUpdater();
  }
}
