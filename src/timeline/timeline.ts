export interface Timeline {
  /**
   * The length of its timeline i.e. its total duration.
   */
  readonly length: number;

  /**
   * The current progress of the interpolation, in milliseconds since the origin.
   */
  readonly localTime: number;
}
