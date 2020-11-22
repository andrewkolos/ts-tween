import { EventSource } from '@akolos/event-emitter';
import { TimelineEvents } from './timeline-events';

export interface ReadonlyTimeline extends EventSource<TimelineEvents<ReadonlyTimeline>> {

  /**
   * The length of its timeline i.e. its total duration.
   */
  readonly length: number;

  /**
   * The current progress of the interpolation, in milliseconds since the origin.
   */
  readonly localTime: number;
}
