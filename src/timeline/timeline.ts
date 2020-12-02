/**
 * Represents anything that starts at some time, progresses, and ends at another time.
 */

import { ReadonlyTimeline } from './readonly-timeline';

export interface Timeline extends ReadonlyTimeline {
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
  __update(nextLocalTime: number): void;

}
