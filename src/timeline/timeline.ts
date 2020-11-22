/**
 * Represents anything that starts at some time, progresses, and ends at another time.
 */

import { EventSource } from '@akolos/event-emitter';

export interface TimelineEvents<Self = Timeline> {
  completed: [event: {}, source: Self];
  sought: [event: { from: number }, source: Self];
  updated: [event: { dt: number }, source: Self];
  started: [event: {}, source: Self];
  stopped: [event: {}, source: Self];
}

export interface Timeline extends EventSource<TimelineEvents<Timeline>> {
  /**
   * Advance the timeline to a time with respect to its origin, or start.
   * Emits the `sought` and `updated` events.
   * @param time The time to seek to, in the range [0, `length`].
   */
  seek(time: number): void;

  /**
   * Stops a tween before it finishes. Emits the 'stopped` event.
   */
  stop(): void;

  /**
   * Causes the tween to instantly reach its end. Equivalent to
   * `seek(length)`.
   */
  complete(): void;

  /**
   * @internal
   */
  __update(dt: number): void;

  /**
   * The length of its timeline i.e. its total duration.
   */
  readonly length: number;

  /**
   * The current progress of the interpolation, in milliseconds since the origin.
   */
  readonly localTime: number;
}
