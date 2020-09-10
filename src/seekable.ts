
export interface Seekable {
  /**
   * Advance the timeline to a time with respect to its origin, or start.
   * @param time The time to seek to, in the range [0, `length`].
   */
  seek(time: number): void;
}
