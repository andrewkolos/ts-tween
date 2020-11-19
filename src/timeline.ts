/**
 * Represents anything that starts at some time, progresses, and ends at another time.
 */

import { EventSource } from '@akolos/event-emitter';

export interface TimelineEvents<Self> {
  completed: [event: {}, source: Self];
  sought: [event: { from: number, to: number }, source: Self];
  updated: [event: {dt: number}, source: Self];
}

export interface Timeline extends EventSource<TimelineEvents<Timeline>> {
  /**
   * Advance the timeline to a time with respect to its origin, or start.
   * @param time The time to seek to, in the range [0, `length`].
   */
  seek(time: number): void;

  /**
   * Advances the timeline to the current time, or, if another time is provided,
   * to that time.
   * @param [now] The time (since unix epoch) to seek to.
   */
  update(currentTime?: number): void;

  /**
   * The length of its timeline i.e. its total duration.
   */
  readonly length: number;

  /**
   * The current progress of the interpolation, in milliseconds since the origin.
   */
  readonly localTime: number;
}
