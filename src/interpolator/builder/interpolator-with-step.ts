import { Interpolator } from '../interpolator';
import { InterpolatorOpts } from '../opts/opts';

export interface TweenWithStep<T> {
  /**
   * Complete the construction of the Interpolator, using the current default options.
   * @returns The completed Interpolator.
   */
  withDefaults: () => Interpolator<T>;

  /**
   * Complete the construction of the Interpolator, using the provided options.
   * @param options The options/configuration to provide to the Interpolator.
   * @returns The completed Interpolator.
   */
  with: (options: InterpolatorOpts) => Interpolator<T>;

  /**
   * Complete the construction of the Interpolator, using the default options, but with a provided duration/length.
   * @param length The length or duration of the Interpolator.
   * @returns The completed Interpolator.
   */
  overTime: (length: number) => Interpolator<T>;
}
