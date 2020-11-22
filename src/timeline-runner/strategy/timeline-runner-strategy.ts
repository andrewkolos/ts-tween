import { TimelineUpdater } from '../timeline-updater';

export interface TimelineRunnerStrategy {
  start: (updateTimelines: TimelineUpdater) => void;
  stop: () => void;
}
